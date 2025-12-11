import React, { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { personnelService } from "../../api"; // DÜZELTİLDİ: personnelService
import { AddStaffModal } from "../StaffModals";

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchStaff = () => {
    setLoading(true);
    personnelService.getAll()
      .then(data => {
        const mapped = Array.isArray(data) ? data.map(p => ({
          id: p.id || p.Id,
          fullName: p.fullName || p.FullName || `${p.firstName} ${p.lastName}`,
          position: p.position || p.Position || "Personel",
          salary: p.salary || p.Salary || 0
        })) : [];
        setStaff(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (data) => {
      try {
          const nameParts = data.name.trim().split(" ");
          const lastName = nameParts.pop() || "";
          const firstName = nameParts.join(" ") || data.name;
          
          await personnelService.create({
              firstName, lastName, position: data.role, salary: parseFloat(data.salary), startDate: new Date().toISOString()
          });
          setShowAddModal(false);
          fetchStaff();
      } catch (err) { alert("Hata: " + err.message); }
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Personel Listesi</h2>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18}/> Personel Ekle
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
              {p.fullName?.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-gray-800">{p.fullName}</div>
              <div className="text-sm text-gray-500">{p.position}</div>
              <div className="text-xs text-green-600 mt-1 font-medium">₺{p.salary} Maaş</div>
            </div>
          </div>
        ))}
      </div>
      
      {showAddModal && <AddStaffModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />}
    </div>
  );
};

export default StaffList;
import React, { useState } from "react";
import { X, ClipboardList } from "lucide-react";

export const StaffDetailModal = ({ person, orders, onClose }) => {
  // Personelin atandığı işleri filtrele (Eğer orders prop'u gelirse)
  const staffOrders = orders ? orders.filter((o) => o.assignedStaff?.includes(person.name)) : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b p-6 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">{person.fullName?.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{person.fullName}</h2>
              <p className="text-gray-600">{person.position}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Maaş</p>
              <p className="text-2xl font-bold text-blue-600">₺{person.salary?.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-1">Tamamlanan İş</p>
              <p className="text-2xl font-bold text-green-600">{staffOrders.length}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Kapat</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddStaffModal = ({ onClose, onAdd }) => {
  const [staffData, setStaffData] = useState({ name: "", role: "", salary: "", phone: "", email: "" });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Yeni Personel Ekle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <input type="text" placeholder="Ad Soyad" className="w-full border rounded-lg px-4 py-2" 
            value={staffData.name} onChange={(e) => setStaffData({ ...staffData, name: e.target.value })} />
          <input type="text" placeholder="Pozisyon" className="w-full border rounded-lg px-4 py-2" 
            value={staffData.role} onChange={(e) => setStaffData({ ...staffData, role: e.target.value })} />
          <input type="number" placeholder="Maaş" className="w-full border rounded-lg px-4 py-2" 
            value={staffData.salary} onChange={(e) => setStaffData({ ...staffData, salary: e.target.value })} />
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">İptal</button>
          <button onClick={() => { onAdd(staffData); }} disabled={!staffData.name || !staffData.role} 
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">Ekle</button>
        </div>
      </div>
    </div>
  );
};
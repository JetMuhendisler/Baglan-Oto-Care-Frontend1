import React from "react";
import { Plus, Trash2 } from "lucide-react";

const StaffList = ({ staff, onAddClick, onDetailClick, onDeleteClick }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Personel Listesi</h2>
        <button onClick={onAddClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={18}/> Personel Ekle
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(p => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => onDetailClick(p)}>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xl">
                {p.name?.charAt(0)}
                </div>
                <div>
                <div className="font-bold text-gray-800">{p.name}</div>
                <div className="text-sm text-gray-500">{p.role}</div>
                <div className="text-xs text-green-600 mt-1 font-medium">₺{p.salary} Maaş</div>
                </div>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onDeleteClick(p.id); }} 
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Personeli Sil"
            >
                <Trash2 size={18} />
            </button>
          </div>
        ))}
        {staff.length === 0 && <div className="col-span-3 text-center text-gray-400 py-10">Personel bulunamadı.</div>}
      </div>
    </div>
  );
};

export default StaffList;
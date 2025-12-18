import React, { useState } from "react";
import { X, Save, User, DollarSign, Calendar } from "lucide-react";
// personnelService importuna gerek yok, sildik.

// --- YENİ PERSONEL EKLEME MODALI ---
export const AddStaffModal = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "",  
    role: "",
    salary: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Veriyi Dashboard'a gönder (API çağrısı orada yapılacak)
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
          <X size={20} />
        </button>
        
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <User className="text-blue-600"/> Yeni Personel Ekle
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Örn: Mahmut" 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Örn: Yılmaz" 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
                required 
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon / Görev</label>
             <input 
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Örn: Usta, Kalfa..." 
                value={formData.role} 
                onChange={e => setFormData({...formData, role: e.target.value})} 
                required 
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Maaş</label>
             <div className="relative">
                <input 
                  type="number"
                  className="w-full border p-3 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="0.00" 
                  value={formData.salary} 
                  onChange={e => setFormData({...formData, salary: e.target.value})} 
                  required 
                />
                <DollarSign className="absolute left-3 top-3.5 text-gray-400" size={18}/>
             </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2 shadow-lg shadow-blue-200 transition-all">
            <Save size={18} /> Kaydet
          </button>
        </form>
      </div>
    </div>
  );
};

// --- PERSONEL DETAY MODALI ---
export const StaffDetailModal = ({ person, orders, onClose }) => {
  const staffOrders = orders.filter(o => o.personnelIds && o.personnelIds.includes(person.id));
  const totalRevenue = staffOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-start">
          <div>
             <h2 className="text-2xl font-bold">{person.name}</h2>
             <p className="opacity-90 flex items-center gap-2 mt-1"><Briefcase size={16}/> {person.role}</p>
          </div>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-4 border-b bg-gray-50">
           <div className="text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Maaş</p>
              <p className="text-xl font-bold text-gray-800">₺{person.salary?.toLocaleString()}</p>
           </div>
           <div className="text-center border-l">
              <p className="text-gray-500 text-xs uppercase font-bold">Tamamlanan İş</p>
              <p className="text-xl font-bold text-blue-600">{staffOrders.length}</p>
           </div>
           <div className="text-center border-l">
              <p className="text-gray-500 text-xs uppercase font-bold">Katkı Sağladığı Ciro</p>
              <p className="text-xl font-bold text-green-600">₺{totalRevenue.toLocaleString()}</p>
           </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
           <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Calendar size={18}/> İş Geçmişi</h4>
           {staffOrders.length > 0 ? (
             <div className="space-y-2">
               {staffOrders.map(order => (
                 <div key={order.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                       <span className="font-bold text-gray-800">{order.plate}</span>
                       <span className="text-sm text-gray-500 ml-2">{order.vehicle}</span>
                    </div>
                    <div className="text-right">
                       <div className="font-bold text-green-600">₺{order.totalPrice}</div>
                       <div className="text-xs text-gray-400">{order.date}</div>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <p className="text-gray-400 italic text-center py-4">Henüz bir iş kaydı bulunmuyor.</p>
           )}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from "react";
import { Check, X, UserPlus, Save } from "lucide-react";
import { orderService } from "../api";

const OrderDetailModal = ({ order, staff, onClose, onSave }) => {
  const [description, setDescription] = useState(order.vehicleInfo || "");
  const [status, setStatus] = useState(
      order.status === "Tamamlandı" || order.status === "Completed" ? 3 : 
      order.status === "İşlemde" || order.status === "InProgress" ? 2 : 1
  );
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);

  const handleSave = async () => {
      try {
          const payload = {
              orderId: order.id,
              description: description,
              statusId: parseInt(status),
              personnelIds: selectedStaffIds
          };
          
          await orderService.update(payload);
          onSave(); // Dashboard'ı yenile
      } catch (err) {
          alert("Güncelleme başarısız: " + err.message);
      }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sipariş Düzenle #{order.id}</h2>
          <button onClick={onClose}><X className="text-gray-500" /></button>
        </div>

        <div className="space-y-4">
            {/* Araç/Açıklama Bilgisi */}
            <div>
                <label className="block text-sm font-medium mb-1">Araç / Açıklama</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {/* Durum Değiştirme */}
            <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="1">Bekliyor</option>
                    <option value="2">İşlemde</option>
                    <option value="3">Tamamlandı</option>
                    <option value="4">İptal</option>
                </select>
            </div>

            {/* Personel Atama */}
            <div>
                <label className="block text-sm font-medium mb-2">Personel Ata</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded">
                    {staff.map(p => (
                        <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1">
                            <input type="checkbox" 
                                checked={selectedStaffIds.includes(p.id)}
                                onChange={(e) => {
                                    if(e.target.checked) setSelectedStaffIds([...selectedStaffIds, p.id]);
                                    else setSelectedStaffIds(selectedStaffIds.filter(id => id !== p.id));
                                }}
                            />
                            <span>{p.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">İptal</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700">
                <Save size={18} /> Kaydet
            </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
import React, { useState } from "react";
import { X, Save } from "lucide-react";
import { orderService } from "../api"; // API importuna dikkat

const OrderDetailModal = ({ order, staff, onClose, onSave }) => {
  const [description, setDescription] = useState(order.vehicle || order.description || "");
  // Durum ID'lerini Backend Enum'una göre ayarlayalım: 1:Pending, 2:InProgress, 3:Completed
  const [status, setStatus] = useState(
      order.status === "Completed" || order.status === "Tamamlandı" ? 3 : 
      order.status === "InProgress" || order.status === "İşlemde" ? 2 : 1
  );
  // Fix: Initialize with existing assigned personnel (prioritize personnelIds from backend)
  const [selectedStaffIds, setSelectedStaffIds] = useState(
      order.personnelIds && order.personnelIds.length > 0 
        ? order.personnelIds.map(id => Number(id))
        : (order.assignedStaff ? order.assignedStaff.map(p => Number(p.id)) : [])
  );

  const handleSave = async () => {
      try {
          // Ensure IDs are sent as integers
          const payload = {
              orderId: order.id,
              description: description,
              statusId: parseInt(status),
              personnelIds: selectedStaffIds.map(id => Number(id))
          };
          
          // API çağrısı
          await orderService.update(payload);
          onSave(); // Listeyi yenilemesi için parent'a haber ver
      } catch (err) {
          alert("Güncelleme başarısız: " + (err.response?.data?.Message || err.message));
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sipariş Düzenle #{order.id}</h2>
          <button onClick={onClose}><X className="text-gray-500 hover:text-gray-700" /></button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">Araç / Açıklama</label>
                <input type="text" className="w-full border rounded px-3 py-2" 
                    value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Durum</label>
                <select className="w-full border rounded px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="1">Bekliyor (Pending)</option>
                    <option value="2">İşlemde (In Progress)</option>
                    <option value="3">Tamamlandı (Completed)</option>
                    <option value="4">İptal (Cancelled)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Personel Ata</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded bg-gray-50">
                    {staff && staff.length > 0 ? staff.map(p => (
                        <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                            <input type="checkbox" 
                                checked={selectedStaffIds.includes(p.id)}
                                onChange={(e) => {
                                    if(e.target.checked) setSelectedStaffIds([...selectedStaffIds, p.id]);
                                    else setSelectedStaffIds(selectedStaffIds.filter(id => id !== p.id));
                                }}
                            />
                            <span>{p.name}</span>
                        </label>
                    )) : <p className="text-gray-500 text-sm">Personel listesi boş.</p>}
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
import React, { useState } from "react";
import { Check, X } from "lucide-react";

const OrderDetailModal = ({ order, staff, transactions, setTransactions, onClose, onSave }) => {
  const [editOrder, setEditOrder] = useState({ ...order });

  const handleStatusChange = (newStatus) => {
    setEditOrder({ ...editOrder, status: newStatus });
  };

  const handleAddToAccounting = () => {
    if (editOrder.status === "completed" && !editOrder.addedToAccounting) {
      const newTransaction = {
        id: transactions.length + 1,
        type: "income",
        description: `${editOrder.services.join(", ")} - ${editOrder.customer} (#${editOrder.id})`,
        amount: editOrder.totalPrice,
        date: new Date().toISOString().split("T")[0],
        category: "Hizmet",
        orderId: editOrder.id,
      };
      setTransactions([...transactions, newTransaction]);
      setEditOrder({ ...editOrder, addedToAccounting: true });
      alert("İş muhasebeye başarıyla eklendi!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 z-10 flex justify-between items-center">
          <h2 className="text-2xl font-bold">İş Emri Detayları - #{order.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <span className="text-sm text-gray-600">Müşteri</span>
              <p className="font-semibold">{order.customer}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Araç</span>
              <p className="font-semibold">{order.vehicle}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Plaka</span>
              <p className="font-semibold">{order.plate}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Tarih</span>
              <p className="font-semibold">{order.date}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Toplam Tutar</span>
              <p className="font-semibold text-green-600">₺{order.totalPrice?.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Muhasebe Durumu</span>
              <p className={`font-semibold ${editOrder.addedToAccounting ? "text-green-600" : "text-orange-600"}`}>
                {editOrder.addedToAccounting ? "✓ Eklendi" : "Eklenmedi"}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Seçilen Hizmetler</h3>
            <div className="space-y-2">
              {order.services.map((service, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Check size={18} className="text-blue-600" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Personel Atama</h3>
            <div className="space-y-2">
              {staff.map((person) => (
                <label key={person.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={editOrder.assignedStaff?.includes(person.name)}
                    onChange={(e) => {
                      const current = editOrder.assignedStaff || [];
                      if (e.target.checked) {
                        setEditOrder({ ...editOrder, assignedStaff: [...current, person.name] });
                      } else {
                        setEditOrder({ ...editOrder, assignedStaff: current.filter((s) => s !== person.name) });
                      }
                    }}
                  />
                  <div>
                    <span className="font-medium">{person.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({person.role})</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">İş Durumu</label>
            <select
              value={editOrder.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="pending">Beklemede</option>
              <option value="progress">İşlemde</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>

          {editOrder.status === "completed" && !editOrder.addedToAccounting && (
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-green-800">İş Tamamlandı!</p>
                <p className="text-sm text-green-600">Bu işi muhasebeye eklemek ister misiniz?</p>
              </div>
              <button onClick={handleAddToAccounting} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Muhasebeye Ekle
              </button>
            </div>
          )}

          <div>
            <label className="block font-semibold mb-2">Ek Notlar</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2"
              rows="3"
              placeholder="İşle ilgili notlar ekleyin..."
              value={editOrder.notes || ""}
              onChange={(e) => setEditOrder({ ...editOrder, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">İptal</button>
            <button onClick={() => { onSave(editOrder); onClose(); }} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
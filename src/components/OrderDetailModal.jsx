import React, { useState, useEffect } from "react";
import { X, Save, User, FileText, Activity, Check, DollarSign } from "lucide-react"; // DollarSign ikonunu ekledik
import { orderService } from "../api";

const OrderDetailModal = ({ order, staff, onClose, onSave }) => {
  // Statü ID çevirici (Mevcut kodun)
  const getStatusId = (statusStr) => {
    if (!statusStr) return 1;
    const s = statusStr.toLowerCase();
    if (s.includes("bekliyor") || s.includes("pending")) return 1;
    if (s.includes("işlemde") || s.includes("progress")) return 2;
    if (s.includes("tamam") || s.includes("completed")) return 3;
    if (s.includes("iptal") || s.includes("cancel")) return 4;
    return 1;
  };

  const [personnelIds, setPersonnelIds] = useState(order.personnelIds || []);
  const [statusId, setStatusId] = useState(1);
  const [description, setDescription] = useState(order.description || "");
  
  // --- YENİ STATE: Ödeme Durumu ---
  const [isPaid, setIsPaid] = useState(order.isPaid || false); 
  // -------------------------------
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatusId(getStatusId(order.status));
  }, [order.status]);

  const toggleStaff = (id) => {
    setPersonnelIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        orderId: order.id,
        statusId: parseInt(statusId),
        description: description,
        personnelIds: personnelIds,
        // --- YENİ ALANI GÖNDERİYORUZ ---
        isPaid: isPaid 
      };

      await orderService.update(payload);
      onSave(); 
    } catch (error) {
      alert("Hata: " + (error.response?.data?.Message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* BAŞLIK */}
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-gray-800">İş Emri Düzenle</h3>
            <p className="text-xs text-gray-500">#{order.id} - {order.plate}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-red-500 transition-colors"><X size={20}/></button>
        </div>

        {/* İÇERİK */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* DURUM BUTONLARI */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <Activity size={16} className="text-blue-600"/> İşlem Durumu
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 1, label: "Bekliyor", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                { id: 2, label: "İşlemde", color: "bg-blue-50 text-blue-700 border-blue-200" },
                { id: 3, label: "Tamamlandı", color: "bg-green-50 text-green-700 border-green-200" },
                { id: 4, label: "İptal", color: "bg-red-50 text-red-700 border-red-200" }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusId(s.id)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all relative
                    ${statusId === s.id 
                      ? `${s.color} ring-2 ring-offset-1 ring-gray-300 scale-105 shadow-md border-transparent` 
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                >
                  {s.label}
                  {statusId === s.id && <Check size={12} className="absolute top-1 right-1"/>}
                </button>
              ))}
            </div>
          </div>

          {/* --- YENİ EKLENEN ÖDEME BÖLÜMÜ --- */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                    <DollarSign size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-800">Ödeme Durumu</p>
                    <p className="text-xs text-gray-500">{isPaid ? "Tahsilat yapıldı." : "Ödeme bekleniyor."}</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isPaid} 
                    onChange={(e) => setIsPaid(e.target.checked)} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">{isPaid ? "Ödendi" : "Ödenmedi"}</span>
            </label>
          </div>
          {/* ----------------------------------- */}

          {/* PERSONEL LİSTESİ */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <User size={16} className="text-purple-600"/> Personel Seçimi
            </label>
            <div className="border rounded-lg p-2 max-h-48 overflow-y-auto bg-gray-50/50 space-y-2">
              {staff.map((p) => {
                const isSelected = personnelIds.includes(p.id);
                return (
                  <div key={p.id} onClick={() => toggleStaff(p.id)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border
                      ${isSelected ? "bg-purple-100 border-purple-300 shadow-sm" : "bg-white border-gray-200 hover:border-blue-300"}`}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-purple-600 border-purple-600" : "bg-white border-gray-400"}`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${isSelected ? "text-purple-900" : "text-gray-700"}`}>
                      {p.name || "İsimsiz Personel"} 
                    </span>
                  </div>
                );
              })}
              {staff.length === 0 && <div className="text-gray-400 text-xs text-center py-2">Personel bulunamadı.</div>}
            </div>
          </div>

          {/* NOTLAR */}
          <div>
            <label className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-gray-600"/> Not / Açıklama
            </label>
            <textarea className="w-full border p-3 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
              placeholder="Not giriniz..." value={description} onChange={(e) => setDescription(e.target.value)}/>
          </div>
        </div>

        {/* KAYDET BUTONU */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">İptal</button>
          <button onClick={handleSave} disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-70">
            {loading ? "Kaydediliyor..." : <><Save size={16}/> Kaydet</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
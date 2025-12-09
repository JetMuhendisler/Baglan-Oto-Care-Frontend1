import React, { useState } from "react";
import { X, ArrowDown, ArrowUp } from "lucide-react";

const AddTransactionModal = ({ onClose, onAdd }) => {
  const [data, setData] = useState({
    type: "income", // "income" veya "expense"
    category: "",   // Başlık olarak kullanılacak
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const categories = {
    income: ["Ek Hizmet", "Bahşiş", "Diğer Gelir"],
    expense: ["Malzeme", "Kira", "Fatura", "Yemek", "Maaş Ödemesi", "Diğer Gider"],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Yeni Muhasebe Kaydı</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setData({ ...data, type: "income" })} className={`p-3 rounded-lg border-2 ${data.type === "income" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200"}`}>
              <ArrowDown size={20} className="mx-auto mb-1" /> Gelir
            </button>
            <button onClick={() => setData({ ...data, type: "expense" })} className={`p-3 rounded-lg border-2 ${data.type === "expense" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200"}`}>
              <ArrowUp size={20} className="mx-auto mb-1" /> Gider
            </button>
          </div>

          <select className="w-full border rounded-lg px-4 py-2" value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}>
            <option value="">Kategori Seçiniz</option>
            {categories[data.type].map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <input type="text" placeholder="Açıklama" className="w-full border rounded-lg px-4 py-2" value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} />
          <input type="number" placeholder="Tutar (TL)" className="w-full border rounded-lg px-4 py-2" value={data.amount} onChange={(e) => setData({ ...data, amount: e.target.value })} />
          <input type="date" className="w-full border rounded-lg px-4 py-2" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">İptal</button>
          <button onClick={() => onAdd(data)} disabled={!data.amount || !data.category} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">Kaydet</button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
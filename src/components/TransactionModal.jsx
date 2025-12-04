import React, { useState } from "react";
import { X, ArrowDown, ArrowUp } from "lucide-react";

const AddTransactionModal = ({ onClose, onAdd }) => {
  const [transactionData, setTransactionData] = useState({
    type: "income",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "",
  });

  const categories = {
    income: ["Hizmet", "Diğer Gelir"],
    expense: ["Malzeme", "Fatura", "Kira", "Maaş", "Diğer Gider"],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Yeni İşlem Ekle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">İşlem Tipi</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setTransactionData({ ...transactionData, type: "income", category: "" })} className={`p-3 rounded-lg border-2 ${transactionData.type === "income" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200"}`}>
                <ArrowDown size={20} className="mx-auto mb-1" /> <span className="font-medium">Gelir</span>
              </button>
              <button onClick={() => setTransactionData({ ...transactionData, type: "expense", category: "" })} className={`p-3 rounded-lg border-2 ${transactionData.type === "expense" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200"}`}>
                <ArrowUp size={20} className="mx-auto mb-1" /> <span className="font-medium">Gider</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kategori</label>
            <select className="w-full border rounded-lg px-4 py-2" value={transactionData.category} onChange={(e) => setTransactionData({ ...transactionData, category: e.target.value })}>
              <option value="">Seçiniz</option>
              {categories[transactionData.type].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <input type="text" placeholder="Açıklama" className="w-full border rounded-lg px-4 py-2" value={transactionData.description} onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })} />
          <input type="number" placeholder="Tutar" className="w-full border rounded-lg px-4 py-2" value={transactionData.amount} onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })} />
          <input type="date" className="w-full border rounded-lg px-4 py-2" value={transactionData.date} onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })} />
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">İptal</button>
          <button onClick={() => { onAdd({ ...transactionData, amount: parseFloat(transactionData.amount) }); onClose(); }} disabled={!transactionData.description || !transactionData.amount || !transactionData.category} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">Ekle</button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;
import React, { useState, useEffect } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { expenseService } from "../../api"; // DÜZELTİLDİ: expenseService
import AddTransactionModal from "../TransactionModal";

const AccountingView = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchExpenses = () => {
    setLoading(true);
    expenseService.getAll()
      .then(data => {
        const mapped = Array.isArray(data) ? data.map(e => ({
          id: e.id || e.Id,
          title: e.title || e.Title || e.description,
          amount: e.amount || e.Amount || 0,
          type: (e.type === 1 || e.IsIncome === true) ? "income" : "expense",
          category: e.category || e.Category || "Genel",
          date: new Date(e.date || e.Date).toLocaleDateString('tr-TR'),
        })).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
        setExpenses(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleAdd = async (data) => {
    try {
        const payload = {
            title: data.category,
            description: data.description,
            amount: parseFloat(data.amount),
            type: data.type === "income" ? 1 : 0,
            date: new Date(data.date).toISOString()
        };
        await expenseService.create(payload);
        setShowModal(false);
        fetchExpenses();
    } catch (err) {
        alert("Ekleme başarısız: " + err.message);
    }
  };

  const handleDelete = async (id) => {
      if(confirm("Silmek istediğinize emin misiniz?")) {
          await expenseService.delete(id);
          fetchExpenses();
      }
  }

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Mali Kayıtlar</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={18} /> Yeni İşlem Ekle
        </button>
      </div>
      
      <table className="w-full">
        <thead className="bg-gray-50 text-gray-500 text-sm">
          <tr>
            <th className="p-3 text-left">Tarih</th>
            <th className="p-3 text-left">İşlem</th>
            <th className="p-3 text-left">Kategori</th>
            <th className="p-3 text-left">Tutar</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {expenses.map(e => (
            <tr key={e.id} className="border-t hover:bg-gray-50">
              <td className="p-3 text-gray-600">{e.date}</td>
              <td className="p-3 font-medium">{e.title}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs ${e.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {e.category}
                </span>
              </td>
              <td className={`p-3 font-bold ${e.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {e.type === "income" ? "+" : "-"}₺{e.amount}
              </td>
              <td className="p-3">
                  <button onClick={() => handleDelete(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && <AddTransactionModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  );
};

export default AccountingView;
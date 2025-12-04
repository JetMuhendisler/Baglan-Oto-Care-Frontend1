import React, { useState } from "react";
// Settings ikonunu ekle
import { Car, LogOut, ClipboardList, Check, Clock, TrendingUp, Users, DollarSign, Plus, Search, Eye, Trash2, Settings } from "lucide-react";
import NewCustomerFlow from "./components/NewCustomerFlow";
import OrderDetailModal from "./components/OrderDetailModal";
import { StaffDetailModal, AddStaffModal } from "./components/StaffModals";
import AddTransactionModal from "./components/TransactionModal";
import SettingsView from "./components/SettingsView"; // Yeni bileşeni import et

// Yeni prop'ları (products, parts vb.) parametre olarak ekle
const Dashboard = ({ user, setUser, orders, setOrders, staff, setStaff, transactions, setTransactions, products, setProducts, parts, setParts }) => {
  const [activeTab, setActiveTab] = useState("orders");
  // ... (diğer state'ler aynı)
  const [searchPlate, setSearchPlate] = useState("");
  const [showCustomerFlow, setShowCustomerFlow] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(null);
  const [showStaffDetail, setShowStaffDetail] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const filteredOrders = orders.filter((order) => order.plate.toLowerCase().includes(searchPlate.toLowerCase()));

  // İstatistikler (aynı)
  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    pendingOrders: orders.filter((o) => o.status === "pending" || o.status === "progress").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const handleNewOrder = (newOrder) => {
      setOrders([...orders, { ...newOrder, id: orders.length + 1 }]);
      setShowCustomerFlow(false);
      setActiveTab("orders");
      alert("Müşteri kaydı başarıyla oluşturuldu!");
  };

  return (
    <div className="min-h-screen bg-gray-100">
       {/* ... Header ve İstatistik Kartları (Aynı kalacak) ... */}
       <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><Car className="text-white" size={24} /></div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Araç Bakım Yönetim Sistemi</h1>
                <p className="text-sm text-gray-500">Bağlan Oto Bakım & Servis</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={() => setUser(null)} className="flex items-center gap-2 text-red-600 hover:text-red-700">
                <LogOut size={18} /> <span className="text-sm">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>

       <div className="max-w-7xl mx-auto px-4 py-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           {/* ... Kart kodları (Aynı) ... */}
           <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div><p className="text-sm text-gray-600">Toplam İş</p><p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p></div>
            <ClipboardList className="text-blue-600" size={32} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div><p className="text-sm text-gray-600">Tamamlanan</p><p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p></div>
            <Check className="text-green-600" size={32} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div><p className="text-sm text-gray-600">Bekleyen</p><p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p></div>
            <Clock className="text-yellow-600" size={32} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div><p className="text-sm text-gray-600">Toplam Gelir</p><p className="text-2xl font-bold text-purple-600">₺{stats.totalRevenue.toLocaleString()}</p></div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>

        {/* Tab Menüsü - AYARLAR EKLENDİ */}
        <div className="bg-white border-b rounded-t-lg">
          <div className="flex gap-1 px-4 overflow-x-auto">
            {[
              { id: "orders", label: "İş Emirleri", icon: ClipboardList },
              { id: "customers", label: "Müşteri Ekle", icon: Plus },
              { id: "staff", label: "Personel", icon: Users },
              { id: "accounting", label: "Muhasebe", icon: DollarSign },
              { id: "settings", label: "Ayarlar", icon: Settings }, // YENİ
            ].map((tab) => (
              <button key={tab.id} onClick={() => tab.id === "customers" ? setShowCustomerFlow(true) : setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}>
                <tab.icon size={18} /><span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow p-6">
          {activeTab === "orders" && (
             /* ... Sipariş Tablosu Kodu (Aynı) ... */
             <div>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Plaka ile ara (örn: 06 ABC 123)" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchPlate} onChange={(e) => setSearchPlate(e.target.value)} />
              </div>
              <table className="w-full">
                 {/* ... Table Header ... */}
                 <thead className="bg-gray-50 border-b">
                  <tr>
                    {["İş No", "Müşteri", "Araç", "Plaka", "Tarih", "Tutar", "Durum", "Muhasebe", "İşlemler"].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y">
                   {/* ... Table Body ... */}
                   {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.vehicle}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">{order.plate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">₺{order.totalPrice?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.status === "completed" ? "bg-green-100 text-green-800" : order.status === "progress" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {order.status === "completed" ? "Tamamlandı" : order.status === "progress" ? "İşlemde" : "Beklemede"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.addedToAccounting ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                            {order.addedToAccounting ? "✓ Eklendi" : "Eklenmedi"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => setShowOrderDetail(order)} className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                          <button onClick={() => setOrders(orders.filter(o => o.id !== order.id))} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          )}

          {activeTab === "staff" && (
             /* ... Personel Kodu (Aynı) ... */
             <div>
              <div className="flex justify-end mb-4">
                <button onClick={() => setShowAddStaff(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus size={20} /> Yeni Personel
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map((person) => (
                  <div key={person.id} className="bg-white border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-xl">{person.name.charAt(0)}</span>
                      </div>
                      <div><h3 className="font-semibold">{person.name}</h3><p className="text-sm text-gray-600">{person.role}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded"><p className="text-sm text-gray-600">Maaş</p><p className="font-semibold">₺{person.salary?.toLocaleString()}</p></div>
                      <div className="text-center p-2 bg-gray-50 rounded"><p className="text-sm text-gray-600">İşler</p><p className="font-semibold">{person.completedJobs}</p></div>
                    </div>
                    <button onClick={() => setShowStaffDetail(person)} className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"><Eye size={18} /> Detay</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "accounting" && (
             /* ... Muhasebe Kodu (Aynı) ... */
             <div>
              <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-xl font-bold">Mali Kayıtlar</h2><p className="text-sm text-gray-600">Gelir ve gider takibi</p></div>
                <button onClick={() => setShowAddTransaction(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={20} /> Yeni İşlem</button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {["Tarih", "İşlem", "Kategori", "Tutar"].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">{transaction.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4"><span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{transaction.category}</span></td>
                      <td className={`px-6 py-4 text-sm font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>{transaction.type === "income" ? "+" : "-"}₺{transaction.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* YENİ: AYARLAR TABI İÇERİĞİ */}
          {activeTab === "settings" && (
            <SettingsView 
              products={products} 
              setProducts={setProducts} 
              parts={parts} 
              setParts={setParts} 
            />
          )}

        </div>
      </div>

      {/* Modallar - NewCustomerFlow'a 'products' ve 'parts' prop olarak geçildi! */}
      {showCustomerFlow && (
        <NewCustomerFlow 
          onClose={() => setShowCustomerFlow(false)} 
          onOrderCreate={handleNewOrder}
          products={products} // YENİ
          parts={parts}       // YENİ
        />
      )}
      {showOrderDetail && <OrderDetailModal order={showOrderDetail} staff={staff} transactions={transactions} setTransactions={setTransactions} onClose={() => setShowOrderDetail(null)} onSave={(updatedOrder) => setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o))} />}
      {showStaffDetail && <StaffDetailModal person={showStaffDetail} orders={orders} onClose={() => setShowStaffDetail(null)} />}
      {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} onAdd={(newStaff) => setStaff([...staff, { ...newStaff, id: staff.length + 1 }])} />}
      {showAddTransaction && <AddTransactionModal onClose={() => setShowAddTransaction(false)} onAdd={(newTransaction) => setTransactions([...transactions, { ...newTransaction, id: transactions.length + 1 }])} />}
    </div>
  );
};

export default Dashboard;
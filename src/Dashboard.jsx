import React, { useState, useEffect } from "react";
import { Car, LogOut, ClipboardList, Check, Clock, TrendingUp, Users, DollarSign, Plus, Search, Eye, Trash2, Settings, Loader2, AlertTriangle } from "lucide-react";
import NewCustomerFlow from "./components/NewCustomerFlow";
import OrderDetailModal from "./components/OrderDetailModal";
import { StaffDetailModal, AddStaffModal } from "./components/StaffModals";
import AddTransactionModal from "./components/TransactionModal";
import SettingsView from "./components/SettingsView";
import { orderService, personnelService, transactionService } from "./api"; 

const Dashboard = ({ user, setUser, products, setProducts, parts, setParts }) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchPlate, setSearchPlate] = useState("");
  const [showCustomerFlow, setShowCustomerFlow] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(null);
  const [showStaffDetail, setShowStaffDetail] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Tarih hatalarını önlemek için yardımcı fonksiyon
  const safeDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? dateString : d.toISOString().split('T')[0];
    } catch  {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      setErrorMsg(null);
      
      try {
        // 1. Siparişleri Çek
        const ordersData = await orderService.getAll() || [];
        
        const mappedOrders = Array.isArray(ordersData) ? ordersData.map(o => ({
          id: o.id,
          customer: o.customerInfo || o.customerName || "Misafir",
          vehicle: o.vehicleInfo || (o.brand ? `${o.brand} ${o.model}` : "Araç Bilgisi Yok"),
          plate: o.plate || o.plateNumber || "---",
          status: o.status || "Pending", 
          date: safeDate(o.date),
          totalPrice: o.totalPrice || 0,
          // Backend summaryList dönüyor mu kontrol et, yoksa selectedServices kullan
          services: (o.summaryList && o.summaryList.length > 0) 
                    ? o.summaryList 
                    : (o.selectedServices ? o.selectedServices.map(s => s.product || s.name) : []), 
          assignedStaff: [], 
          addedToAccounting: false 
        })) : [];

        setOrders(mappedOrders);

        // 2. Personeli Çek
        const staffData = await personnelService.getAll() || [];
        
        setStaff(Array.isArray(staffData) ? staffData.map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            role: p.position || "Personel",
            salary: p.salary || 0,
            completedJobs: 0
        })) : []);

        // 3. Muhasebe
        const transactionsData = await transactionService.getAll() || [];
        const mappedTransactions = Array.isArray(transactionsData) ? transactionsData.map(t => ({
            id: t.id,
            type: "income",
            description: t.description,
            amount: t.totalPrice,
            date: safeDate(t.createdDate),
            category: "Hizmet"
        })) : [];
        setTransactions(mappedTransactions);

      } catch (error) {
        console.error("Veri çekme hatası:", error);
        setErrorMsg("Veriler yüklenemedi. Backend bağlantısını kontrol edin.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab]);

  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === "Completed" || o.status === "Tamamlandı").length,
    pendingOrders: orders.filter((o) => o.status === "Pending" || o.status === "Beklemede").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const filteredOrders = orders.filter((order) => 
    order.plate?.toLowerCase().includes(searchPlate.toLowerCase())
  );

  const handleNewOrder = (newOrderFromFlow) => {
      setOrders(prev => [newOrderFromFlow, ...prev]);
      setShowCustomerFlow(false);
      setActiveTab("orders");
  };

  const handleAddStaff = async (newStaffData) => {
      try {
          const nameParts = newStaffData.name.trim().split(" ");
          const lastName = nameParts.length > 1 ? nameParts.pop() : "";
          const firstName = nameParts.join(" ");

          const payload = {
              firstName: firstName,
              lastName: lastName,
              position: newStaffData.role,
              salary: newStaffData.salary,
              startDate: new Date().toISOString()
          };

          await personnelService.create(payload);
          // Listeyi güncelle
          const updatedStaff = await personnelService.getAll();
           setStaff(Array.isArray(updatedStaff) ? updatedStaff.map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            role: p.position,
            salary: p.salary,
            completedJobs: 0
        })) : []);
        setShowAddStaff(false);
      } catch  {
          alert("Personel eklenirken hata oluştu.");
      }
  };
  
  const handleDeleteOrder = async (id) => {
      if(window.confirm("Bu siparişi silmek istediğinize emin misiniz?")) {
          try {
              await orderService.delete(id);
              setOrders(orders.filter(o => o.id !== id));
          } catch {
              alert("Silme işlemi başarısız.");
          }
      }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

        <div className="bg-white border-b rounded-t-lg">
          <div className="flex gap-1 px-4 overflow-x-auto">
            {[
              { id: "orders", label: "İş Emirleri", icon: ClipboardList },
              { id: "customers", label: "Müşteri Ekle", icon: Plus },
              { id: "staff", label: "Personel", icon: Users },
              { id: "accounting", label: "Muhasebe", icon: DollarSign },
              { id: "settings", label: "Ayarlar", icon: Settings },
            ].map((tab) => (
              <button key={tab.id} onClick={() => tab.id === "customers" ? setShowCustomerFlow(true) : setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}>
                <tab.icon size={18} /><span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow p-6 min-h-[400px]">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={48} />
                <p className="text-gray-500">Veriler Yükleniyor...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "orders" && (
                <div>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Plaka ile ara..." className="w-full pl-10 pr-4 py-2 border rounded-lg" value={searchPlate} onChange={(e) => setSearchPlate(e.target.value)} />
                  </div>
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {["İş No", "Müşteri", "Araç", "Plaka", "Tarih", "Tutar", "Durum", "Muhasebe", "İşlemler"].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                          <td className="px-6 py-4 text-sm">{order.customer}</td>
                          <td className="px-6 py-4 text-sm">{order.vehicle}</td>
                          <td className="px-6 py-4 text-sm font-mono">{order.plate}</td>
                          <td className="px-6 py-4 text-sm">{order.date}</td>
                          <td className="px-6 py-4 text-sm font-bold">₺{order.totalPrice?.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                              {order.status === "Completed" ? "Tamamlandı" : "Beklemede"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.addedToAccounting ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                                {order.addedToAccounting ? "✓ Eklendi" : "Eklenmedi"}
                            </span>
                          </td>
                          <td className="px-6 py-4 flex gap-2">
                            <button onClick={() => setShowOrderDetail(order)} className="text-blue-600"><Eye size={18} /></button>
                            <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600"><Trash2 size={18} /></button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="9" className="text-center py-4 text-gray-500">Kayıt bulunamadı.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "staff" && (
                <div>
                  <div className="flex justify-end mb-4"><button onClick={() => setShowAddStaff(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Yeni Personel</button></div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staff.length > 0 ? staff.map(p => (
                      <div key={p.id} className="border p-4 rounded bg-white shadow-sm">
                        <h3 className="font-bold">{p.name}</h3>
                        <p className="text-sm text-gray-500">{p.role}</p>
                        <p className="font-semibold mt-2">₺{p.salary?.toLocaleString()}</p>
                      </div>
                    )) : (
                        <div className="col-span-3 text-center text-gray-500 py-8">Kayıtlı personel bulunamadı.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "accounting" && (
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

              {activeTab === "settings" && <SettingsView products={products} setProducts={setProducts} parts={parts} setParts={setParts} />}
            </>
          )}
        </div>
      </div>

      {showCustomerFlow && (
        <NewCustomerFlow 
          onClose={() => setShowCustomerFlow(false)} 
          onOrderCreate={handleNewOrder}
          products={products}
          parts={parts}
        />
      )}
      {showOrderDetail && <OrderDetailModal order={showOrderDetail} staff={staff} transactions={transactions} setTransactions={setTransactions} onClose={() => setShowOrderDetail(null)} onSave={() => {}} />}
      {showStaffDetail && <StaffDetailModal person={showStaffDetail} orders={orders} onClose={() => setShowStaffDetail(null)} />}
      {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} />}
      {showAddTransaction && <AddTransactionModal onClose={() => setShowAddTransaction(false)} onAdd={() => {}} />}
    </div>
  );
};

export default Dashboard;
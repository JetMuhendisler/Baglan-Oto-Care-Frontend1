import React, { useState, useEffect } from "react";
import { Car, LogOut, ClipboardList, Check, Clock, TrendingUp, Users, DollarSign, Plus, Search, Eye, Trash2, Settings, Loader2, AlertTriangle } from "lucide-react";
import NewCustomerFlow from "./components/NewCustomerFlow";
import OrderDetailModal from "./components/OrderDetailModal";
import { StaffDetailModal, AddStaffModal } from "./components/StaffModals";
import AddTransactionModal from "./components/TransactionModal";
import SettingsView from "./components/SettingsView";
import { orderService, personnelService, expenseService, dashboardService } from "./api"; 

const Dashboard = ({ user, setUser, products, setProducts, parts, setParts }) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [dashStats, setDashStats] = useState(null);

  const [searchPlate, setSearchPlate] = useState("");
  const [showCustomerFlow, setShowCustomerFlow] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(null);
  const [showStaffDetail, setShowStaffDetail] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Tarih formatlama
  const safeDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  };

  // Veri Çekme
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      setErrorMsg(null);
      
      try {
        // 1. Dashboard İstatistikleri
        try {
          const stats = await dashboardService.getStats();
          setDashStats(stats);
        } catch (err) {
          console.warn("Dashboard stats yüklenemedi:", err);
        }

        // 2. Siparişler
        const ordersData = await orderService.getAll();
        const mappedOrders = Array.isArray(ordersData) ? ordersData.map(o => ({
          id: o.id,
          customer: o.customerInfo || "Misafir",
          vehicle: o.vehicleInfo || "Araç Bilgisi Yok",
          plate: o.plate || "---",
          status: o.status || "Pending",
          date: safeDate(o.date),
          totalPrice: o.totalPrice || 0,
          services: o.summaryList || [],
          assignedStaff: [],
          addedToAccounting: false
        })) : [];
        setOrders(mappedOrders);

        // 3. Personel
        const staffData = await personnelService.getAll();
        setStaff(Array.isArray(staffData) ? staffData.map(p => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          role: p.position || "Personel",
          salary: p.salary || 0,
          completedJobs: 0
        })) : []);

        // 4. Gider/Gelir Kayıtları
        const expensesData = await expenseService.getAll();
        setExpenses(Array.isArray(expensesData) ? expensesData.map(e => ({
          id: e.id,
          type: e.type === 1 ? "income" : "expense",
          title: e.title,
          description: e.description,
          amount: e.amount,
          date: safeDate(e.date),
          category: e.type === 1 ? "Gelir" : "Gider"
        })) : []);

      } catch (error) {
        console.error("Veri çekme hatası:", error);
        setErrorMsg(error.response?.data?.message || "Veriler yüklenemedi. Lütfen backend'in çalıştığından emin olun.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // İstatistikler (Backend'den gelen veya frontend hesaplaması)
  const stats = dashStats || {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === "Completed").length,
    pendingOrders: orders.filter(o => o.status === "Pending").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
  };

  const filteredOrders = orders.filter(order => 
    order.plate?.toLowerCase().includes(searchPlate.toLowerCase())
  );

  // Yeni Sipariş
  const handleNewOrder = async (newOrderFromFlow) => {
    try {
      await orderService.create(newOrderFromFlow);
      const updatedOrders = await orderService.getAll();
      setOrders(updatedOrders.map(o => ({
        id: o.id,
        customer: o.customerInfo || "Misafir",
        vehicle: o.vehicleInfo || "Araç",
        plate: o.plate || "---",
        status: o.status || "Pending",
        date: safeDate(o.date),
        totalPrice: o.totalPrice || 0,
        services: o.summaryList || [],
        assignedStaff: [],
        addedToAccounting: false
      })));
      setShowCustomerFlow(false);
      setActiveTab("orders");
      alert("Sipariş başarıyla oluşturuldu!");
    } catch (error) {
      alert("Sipariş oluşturulamadı: " + (error.response?.data?.message || error.message));
    }
  };

  // Personel Ekleme
  const handleAddStaff = async (newStaffData) => {
    try {
      const nameParts = newStaffData.name.trim().split(" ");
      const lastName = nameParts.length > 1 ? nameParts.pop() : "";
      const firstName = nameParts.join(" ") || "Ad";

      const payload = {
        firstName,
        lastName,
        position: newStaffData.role,
        salary: parseFloat(newStaffData.salary) || 0,
        startDate: new Date().toISOString()
      };

      await personnelService.create(payload);
      const updatedStaff = await personnelService.getAll();
      setStaff(updatedStaff.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        role: p.position,
        salary: p.salary,
        completedJobs: 0
      })));
      setShowAddStaff(false);
      alert("Personel başarıyla eklendi!");
    } catch (error) {
      alert("Personel eklenemedi: " + (error.response?.data?.message || error.message));
    }
  };

  // Gider/Gelir Ekleme
  const handleAddExpense = async (newExpenseData) => {
    try {
      const payload = {
        title: newExpenseData.description,
        description: newExpenseData.description,
        amount: parseFloat(newExpenseData.amount),
        type: newExpenseData.type === "income" ? 1 : 0,
        date: new Date(newExpenseData.date).toISOString()
      };

      await expenseService.create(payload);
      const updated = await expenseService.getAll();
      setExpenses(updated.map(e => ({
        id: e.id,
        type: e.type === 1 ? "income" : "expense",
        title: e.title,
        description: e.description,
        amount: e.amount,
        date: safeDate(e.date),
        category: e.type === 1 ? "Gelir" : "Gider"
      })));
      setShowAddExpense(false);
      alert("Kayıt başarıyla eklendi!");
    } catch (error) {
      alert("Kayıt eklenemedi: " + (error.response?.data?.message || error.message));
    }
  };

  // Sipariş Silme
  const handleDeleteOrder = async (id) => {
    if (window.confirm("Bu siparişi silmek istediğinize emin misiniz?")) {
      try {
        await orderService.delete(id);
        setOrders(orders.filter(o => o.id !== id));
        alert("Sipariş silindi!");
      } catch (error) {
        alert("Silme başarısız: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Gider Silme
  const handleDeleteExpense = async (id) => {
    if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      try {
        await expenseService.delete(id);
        setExpenses(expenses.filter(e => e.id !== id));
        alert("Kayıt silindi!");
      } catch (error) {
        alert("Silme başarısız: " + (error.response?.data?.message || error.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="text-white" size={24} />
              </div>
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

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam İş</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalOrders || 0}</p>
            </div>
            <ClipboardList className="text-blue-600" size={32} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedOrders || 0}</p>
            </div>
            <Check className="text-green-600" size={32} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Gelir</p>
              <p className="text-2xl font-bold text-purple-600">₺{(stats.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <TrendingUp className="text-purple-600" size={32} />
          </div>
        </div>

        {/* Tab Menüsü */}
        <div className="bg-white border-b rounded-t-lg">
          <div className="flex gap-1 px-4 overflow-x-auto">
            {[
              { id: "orders", label: "İş Emirleri", icon: ClipboardList },
              { id: "customers", label: "Müşteri Ekle", icon: Plus },
              { id: "staff", label: "Personel", icon: Users },
              { id: "accounting", label: "Muhasebe", icon: DollarSign },
              { id: "settings", label: "Ayarlar", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.id === "customers" ? setShowCustomerFlow(true) : setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab İçerikleri */}
        <div className="bg-white rounded-b-lg shadow p-6 min-h-[400px]">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
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
              {/* SİPARİŞLER */}
              {activeTab === "orders" && (
                <div>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Plaka ile ara..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                      value={searchPlate}
                      onChange={(e) => setSearchPlate(e.target.value)}
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          {["İş No", "Müşteri", "Araç", "Plaka", "Tarih", "Tutar", "Durum", "İşlemler"].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium">#{order.id}</td>
                            <td className="px-6 py-4 text-sm">{order.customer}</td>
                            <td className="px-6 py-4 text-sm">{order.vehicle}</td>
                            <td className="px-6 py-4 text-sm font-mono">{order.plate}</td>
                            <td className="px-6 py-4 text-sm">{order.date}</td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600">₺{order.totalPrice.toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }`}>
                                {order.status === "Completed" ? "Tamamlandı" : "Beklemede"}
                              </span>
                            </td>
                            <td className="px-6 py-4 flex gap-2">
                              <button onClick={() => setShowOrderDetail(order)} className="text-blue-600 hover:text-blue-800">
                                <Eye size={18} />
                              </button>
                              <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="8" className="text-center py-8 text-gray-500">
                              Kayıt bulunamadı.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PERSONEL */}
              {activeTab === "staff" && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setShowAddStaff(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={20} /> Yeni Personel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staff.length > 0 ? staff.map(p => (
                      <div key={p.id} className="border p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-xl">{p.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-bold">{p.name}</h3>
                            <p className="text-sm text-gray-500">{p.role}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-600">Maaş: ₺{p.salary.toLocaleString()}</p>
                        <button
                          onClick={() => setShowStaffDetail(p)}
                          className="mt-3 w-full px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                        >
                          Detayları Gör
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-3 text-center text-gray-500 py-12">
                        <Users size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Kayıtlı personel bulunamadı.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MUHASEBE */}
              {activeTab === "accounting" && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Mali Kayıtlar</h2>
                      <p className="text-sm text-gray-600">Gelir ve gider takibi</p>
                    </div>
                    <button
                      onClick={() => setShowAddExpense(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus size={20} /> Yeni Kayıt
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          {["Tarih", "Açıklama", "Kategori", "Tutar", "İşlemler"].map(h => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {expenses.length > 0 ? expenses.map((expense) => (
                          <tr key={expense.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-600">{expense.date}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                expense.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {expense.category}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-sm font-semibold ${
                              expense.type === "income" ? "text-green-600" : "text-red-600"
                            }`}>
                              {expense.type === "income" ? "+" : "-"}₺{expense.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <button onClick={() => handleDeleteExpense(expense.id)} className="text-red-600 hover:text-red-800">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="text-center py-8 text-gray-500">Kayıt bulunamadı.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* AYARLAR */}
              {activeTab === "settings" && (
                <SettingsView products={products} setProducts={setProducts} parts={parts} setParts={setParts} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modallar */}
      {showCustomerFlow && (
        <NewCustomerFlow
          onClose={() => setShowCustomerFlow(false)}
          onOrderCreate={handleNewOrder}
          products={products}
          parts={parts}
        />
      )}
      {showOrderDetail && (
        <OrderDetailModal
          order={showOrderDetail}
          staff={staff}
          onClose={() => setShowOrderDetail(null)}
          onSave={() => {}}
        />
      )}
      {showStaffDetail && (
        <StaffDetailModal person={showStaffDetail} orders={orders} onClose={() => setShowStaffDetail(null)} />
      )}
      {showAddStaff && (
        <AddStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} />
      )}
      {showAddExpense && (
        <AddTransactionModal onClose={() => setShowAddExpense(false)} onAdd={handleAddExpense} />
      )}
    </div>
  );
};

export default Dashboard;
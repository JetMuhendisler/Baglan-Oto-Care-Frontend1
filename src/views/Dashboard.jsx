import React, { useState, useEffect, useCallback } from "react";
import { Car, LogOut, ClipboardList, Check, Clock, TrendingUp, Users, DollarSign, Plus, Search, Eye, Trash2, Settings, Loader2, AlertTriangle } from "lucide-react";

// Bileşen Yolları
import NewOrderWizard from "./NewOrderWizard"; 
import OrderDetailModal from "../components/OrderDetailModal";
import { StaffDetailModal, AddStaffModal } from "../components/StaffModals";
import AddTransactionModal from "../components/TransactionModal";
import SettingsView from "../components/SettingsView";
import { orderService, personnelService, expenseService, dashboardService } from "../api";
import { olexProducts, carParts } from "../data"; 

// --- YARDIMCI FONKSİYONLAR ---
const safeDate = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('tr-TR');
  } catch { return dateString; }
};

// --- ANA COMPONENT ---
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("orders");
  
  // Veri State'leri
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  
  // Ayarlar State'leri
  const [products, setProducts] = useState(olexProducts);
  const [parts, setParts] = useState(carParts);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // UI State'leri
  const [searchPlate, setSearchPlate] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(null);
  const [showStaffDetail, setShowStaffDetail] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  // --- VERİ ÇEKME FONKSİYONU ---
  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // 1. İstatistikler
      const stats = await dashboardService.getStats();
      setDashStats(stats);

      // 2. Siparişler
      const ordersData = await orderService.getAll();
      const mappedOrders = Array.isArray(ordersData) ? ordersData.map(o => ({
        id: o.id || o.Id,
        customer: o.customerInfo || o.CustomerInfo || "Misafir",
        vehicle: o.vehicleInfo || o.VehicleInfo || "Araç Bilgisi Yok",
        plate: o.VehiclePlate || o.vehiclePlate || o.plate || "---", 
        status: o.Status || o.status || "Pending",
        date: safeDate(o.Date || o.date || o.TransactionDate),
        totalPrice: o.TotalPrice || o.totalPrice || 0,
        services: o.SummaryList || o.summaryList || [],
        assignedStaff: o.Personnels ? o.Personnels.map(p => ({ id: p.Id, name: p.FullName || `${p.FirstName} ${p.LastName}` })) : [],
        addedToAccounting: false
      })) : [];
      setOrders(mappedOrders);

      // 3. Personel (AD SOYAD DÜZELTMESİ)
      const staffData = await personnelService.getAll();
      setStaff(Array.isArray(staffData) ? staffData.map(p => ({
        id: p.id || p.Id,
        // Backend'deki Mapping'den gelen FullName'i tercih et, yoksa manuel birleştir (image_29b3ad.png çözümü)
        name: p.FullName || p.fullName || `${p.FirstName || p.firstName || ''} ${p.LastName || p.lastName || ''}`.trim(),
        role: p.Position || p.position || "Personel",
        salary: p.Salary || p.salary || 0,
        completedJobs: 0
      })) : []);

      // 4. Muhasebe (GELİR/GİDER DÜZELTMESİ)
      const expensesData = await expenseService.getAll();
      setExpenses(Array.isArray(expensesData) ? expensesData.map(e => ({
        id: e.id || e.Id,
        // Backend Type = 1 (Gelir) veya IsIncome = true
        type: (e.Type === 1 || e.type === 1 || e.IsIncome === true) ? "income" : "expense",
        title: e.Title || e.title || e.Description || e.description,
        description: e.Description || e.description,
        amount: e.Amount || e.amount || 0,
        date: safeDate(e.Date || e.date),
        category: e.Category || e.category || ((e.Type === 1 || e.type === 1) ? "Gelir" : "Gider")
      })).sort((a, b) => new Date(b.date) - new Date(a.date)) : []);

    } catch (error) {
      console.error("Veri çekme hatası:", error);
      setErrorMsg("Veriler yüklenirken bir sorun oluştu. Backend'i kontrol edin.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- CRUD İŞLEMLERİ ---
  const handleOrderUpdate = () => {
    fetchData();
    setShowOrderDetail(null);
  };

  const handleAddStaff = async (data) => {
    try {
      const nameParts = data.name.trim().split(" ");
      const lastName = nameParts.pop() || "Soyad";
      const firstName = nameParts.join(" ") || "Ad";
      await personnelService.create({
        firstName, lastName, position: data.role, salary: parseFloat(data.salary), startDate: new Date().toISOString()
      });
      setShowAddStaff(false);
      fetchData();
      alert("Personel eklendi!");
    } catch (error) { alert("Hata: " + error.message); }
  };

  const handleAddExpense = async (data) => {
    try {
      await expenseService.create({
        title: data.category,
        description: data.description,
        amount: parseFloat(data.amount),
        type: data.type === "income" ? 1 : 0, // Gelir=1, Gider=0
        date: new Date(data.date).toISOString()
      });
      setShowAddExpense(false);
      fetchData();
      alert("İşlem eklendi!");
    } catch (error) { alert("Hata: " + error.message); }
  };
  
  const handleDeleteOrder = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      try {
        await orderService.delete(id);
        fetchData();
      } catch (error) { console.error(error); }
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      try {
        await expenseService.delete(id);
        fetchData();
      } catch { alert("Silinemedi"); }
    }
  };


  const filteredOrders = orders.filter(order => 
    order.plate?.toLowerCase().includes(searchPlate.toLowerCase())
  );
  
  const stats = dashStats || {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === "Completed").length,
    pendingOrders: orders.filter(o => o.status === "Pending").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)
  };


  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Car className="text-white" size={24} /></div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Bağlan Oto Care</h1>
              <p className="text-sm text-gray-500">Yönetim Paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">{user?.name}</span>
            {/* onLogout prop'u kullanılıyor */}
            <button onClick={onLogout} className="text-red-600 hover:text-red-800"><LogOut size={20}/></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow flex justify-between">
            <div><p className="text-gray-500 text-sm">Toplam İş</p><p className="text-2xl font-bold">{stats.totalOrders}</p></div>
            <ClipboardList className="text-blue-600" size={32}/>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex justify-between">
            <div><p className="text-gray-500 text-sm">Tamamlanan</p><p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p></div>
            <Check className="text-green-600" size={32}/>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex justify-between">
            <div><p className="text-gray-500 text-sm">Bekleyen</p><p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p></div>
            <Clock className="text-yellow-600" size={32}/>
          </div>
          <div className="bg-white p-6 rounded-lg shadow flex justify-between">
            <div><p className="text-gray-500 text-sm">Ciro</p><p className="text-2xl font-bold text-purple-600">₺{stats.totalRevenue?.toLocaleString()}</p></div>
            <TrendingUp className="text-purple-600" size={32}/>
          </div>
        </div>

        {/* Tab Menüsü */}
        <div className="bg-white border-b rounded-t-lg flex gap-1 px-4 overflow-x-auto">
          {[
            { id: "orders", label: "İş Emirleri", icon: ClipboardList },
            { id: "customers", label: "Müşteri Ekle", icon: Plus },
            { id: "staff", label: "Personel", icon: Users },
            { id: "accounting", label: "Muhasebe", icon: DollarSign },
            { id: "settings", label: "Ayarlar", icon: Settings },
          ].map((tab) => (
            <button key={tab.id} onClick={() => tab.id === "customers" ? setShowWizard(true) : setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}>
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* İçerik Alanı */}
        <div className="bg-white rounded-b-lg shadow p-6 min-h-[400px]">
          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center gap-2"><AlertTriangle size={18}/>{errorMsg}</div>}
          
          {loading ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div>
          ) : (
            <>
              {/* SİPARİŞLER */}
              {activeTab === "orders" && (
                <div>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <input className="pl-10 border p-2 rounded-lg w-full md:w-1/3" placeholder="Plaka Ara..." value={searchPlate} onChange={e => setSearchPlate(e.target.value)} />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-sm border-b">
                        <tr>
                          {["İş No", "Müşteri", "Araç", "Plaka", "Tutar", "Durum", "Tarih", "İşlemler"].map(h => <th key={h} className="p-3">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">#{order.id}</td>
                            <td className="p-3">{order.customer}</td>
                            <td className="p-3">{order.vehicle}</td>
                            <td className="p-3 font-mono bg-gray-100 rounded w-fit px-2">{order.plate}</td>
                            <td className="p-3 font-bold text-green-600">₺{order.totalPrice?.toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500">{order.date}</td>
                            <td className="p-3 flex gap-2">
                              <button onClick={() => setShowOrderDetail(order)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Eye size={18}/></button>
                              <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filteredOrders.length === 0 && <p className="text-center text-gray-500 py-8">Kayıt bulunamadı.</p>}
                  </div>
                </div>
              )}

              {/* PERSONEL */}
              {activeTab === "staff" && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button onClick={() => setShowAddStaff(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Plus size={18}/> Yeni Personel
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staff.map(p => (
                      <div key={p.id} className="border p-4 rounded-lg hover:shadow-md cursor-pointer" onClick={() => setShowStaffDetail(p)}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">{p.name.charAt(0)}</div>
                          <div><h3 className="font-bold">{p.name}</h3><p className="text-xs text-gray-500">{p.role}</p></div>
                        </div>
                        <p className="text-green-600 font-semibold text-sm">Maaş: ₺{p.salary.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MUHASEBE */}
              {activeTab === "accounting" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Gelir / Gider Listesi</h2>
                    <button onClick={() => setShowAddExpense(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Plus size={18}/> Yeni Kayıt
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-gray-500 text-sm border-b">
                        <tr>
                          {["Tarih", "Açıklama", "Kategori", "Tutar", ""].map(h => <th key={h} className="p-3">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody className="divide-y text-sm">
                        {expenses.map(e => (
                          <tr key={e.id} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-600">{e.date}</td>
                            <td className="p-3 font-medium">{e.title}</td>
                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${e.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{e.category}</span></td>
                            <td className={`p-3 font-bold ${e.type === "income" ? "text-green-600" : "text-red-600"}`}>
                              {e.type === "income" ? "+" : "-"}₺{e.amount.toLocaleString()}
                            </td>
                            <td className="p-3">
                              <button onClick={() => handleDeleteExpense(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </td>
                          </tr>
                        ))}
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

      {/* MODALLAR */}
      {showWizard && (
        <NewOrderWizard 
          onClose={() => setShowWizard(false)} 
          onSuccess={() => {
             alert("Sipariş başarıyla oluşturuldu.");
             fetchData(); // Başarıyla eklendiyse listeyi yenile
             setShowWizard(false); 
          }}
        />
      )}
      
      {showOrderDetail && <OrderDetailModal order={showOrderDetail} staff={staff} onClose={() => setShowOrderDetail(null)} onSave={handleOrderUpdate} />}
      
      {showStaffDetail && <StaffDetailModal person={showStaffDetail} orders={orders} onClose={() => setShowStaffDetail(null)} />}
      
      {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} />}
      
      {showAddExpense && <AddTransactionModal onClose={() => setShowAddExpense(false)} onAdd={handleAddExpense} />}
    </div>
  );
};

export default Dashboard;
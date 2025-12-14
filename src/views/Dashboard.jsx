import React, { useState, useEffect, useCallback } from "react";
import { Car, LogOut, ClipboardList, Check, Clock, TrendingUp, Users, DollarSign, Plus, Search, Eye, Trash2, Settings, Loader2, AlertTriangle, Save, Shield, Sun, Layers } from "lucide-react";

// Modallar
import NewOrderWizard from "./NewOrderWizard"; 
import OrderDetailModal from "../components/OrderDetailModal";
import { StaffDetailModal, AddStaffModal } from "../components/StaffModals";
import AddTransactionModal from "../components/TransactionModal";

// API
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

// --- İÇ BİLEŞENLER ---

// 1. SİPARİŞ LİSTESİ
const OrderList = ({ orders, onEdit, onDelete }) => {
  const [search, setSearch] = useState("");

  const filtered = orders.filter(o => 
    (o.plate || "").toLowerCase().includes(search.toLowerCase()) || 
    (o.customer || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
        <input className="pl-10 border p-2 rounded-lg w-full md:w-1/3 outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Plaka veya Müşteri Ara..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b">
            <tr>{["İş No", "Müşteri", "Araç", "Plaka", "Tutar", "Durum", "Tarih", "İşlem"].map(h => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y text-sm">
            {filtered.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">#{order.id}</td>
                <td className="p-3">{order.customer}</td>
                <td className="p-3">{order.vehicle}</td>
                <td className="p-3 font-mono bg-gray-100 rounded w-fit px-2 text-gray-700 font-bold">{order.plate}</td>
                <td className="p-3 font-bold text-green-600">₺{order.totalPrice?.toLocaleString()}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{order.status}</span></td>
                <td className="p-3 text-gray-500">{order.date}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => onEdit(order)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Eye size={18}/></button>
                  <button onClick={() => onDelete(order.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-gray-500 py-8">Kayıt bulunamadı.</p>}
      </div>
    </div>
  );
};

// 2. PERSONEL LİSTESİ
const StaffList = ({ staff, onAdd, onDetail, onDelete }) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={18}/> Yeni Personel</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {staff.map(p => (
          <div key={p.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow bg-white flex justify-between items-start group">
            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => onDetail(p)}>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold uppercase">{p.name ? p.name.charAt(0) : "U"}</div>
              <div><h3 className="font-bold text-gray-800">{p.name}</h3><p className="text-xs text-gray-500">{p.role}</p><p className="text-xs text-green-600 font-bold mt-1">₺{p.salary?.toLocaleString()}</p></div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18}/></button>
          </div>
        ))}
        {staff.length === 0 && <div className="col-span-3 text-center text-gray-500">Henüz personel eklenmemiş.</div>}
      </div>
    </div>
  );
};

// 3. MUHASEBE LİSTESİ
const AccountingView = ({ expenses, orders, onAdd, onDelete, onDeleteOrder }) => {
  const combinedItems = [
    ...expenses.map(e => ({ ...e, source: 'expense' })),
    ...orders.filter(o => o.status === "Completed" || o.status === "Tamamlandı").map(o => ({
      id: o.id,
      date: o.date,
      title: `${o.plate} - ${o.customer}`,
      category: "İş Emri",
      amount: o.totalPrice,
      type: "income",
      source: 'order'
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Gelir / Gider Listesi</h2>
        <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"><Plus size={18}/> Yeni Kayıt</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm border-b">
            <tr>{["No", "Tarih", "Açıklama", "Kategori", "Tutar", ""].map(h => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y text-sm">
            {combinedItems.map((item, idx) => (
              <tr key={`${item.source}-${item.id}-${idx}`} className="hover:bg-gray-50">
                <td className="p-3 font-mono text-gray-400">#{item.id}</td>
                <td className="p-3 text-gray-600">{item.date}</td>
                <td className="p-3 font-medium">{item.title}</td>
                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${item.type === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.category}</span></td>
                <td className={`p-3 font-bold ${item.type === "income" ? "text-green-600" : "text-red-600"}`}>{item.type === "income" ? "+" : "-"}₺{item.amount?.toLocaleString()}</td>
                <td className="p-3 text-right">
                    <button onClick={() => item.source === 'order' ? onDeleteOrder(item.id) : onDelete(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16}/>
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {combinedItems.length === 0 && <p className="text-center text-gray-500 py-8">Kayıt bulunamadı.</p>}
      </div>
    </div>
  );
};

// 4. AYARLAR BİLEŞENİ
const SettingsPanel = ({ products, setProducts, parts, setParts }) => {
  const updatePrice = (type, id, val) => {
    const price = parseFloat(val) || 0;
    if (type === 'part') setParts(prev => prev.map(p => p.id === id ? { ...p, price } : p));
    else if (type === 'ppf') setProducts(prev => ({ ...prev, ppf: { ...prev.ppf, series: prev.ppf.series.map(s => s.id === id ? { ...s, basePrice: price } : s) } }));
    else if (type === 'window') setProducts(prev => ({ ...prev, windowFilm: { ...prev.windowFilm, products: prev.windowFilm.products.map(p => p.id === id ? { ...p, price } : p) } }));
    else if (type === 'ceramic') setProducts(prev => ({ ...prev, ceramic: { ...prev.ceramic, products: prev.ceramic.products.map(p => p.id === id ? { ...p, price } : p) } }));
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Fiyat Ayarları</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Save size={20} /> <span>Kaydet</span></button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-purple-100">
          <div className="flex items-center gap-2 mb-4 text-purple-700"><Shield size={24} /><h3 className="text-xl font-bold">PPF Fiyatları</h3></div>
          <div className="space-y-3">{products.ppf.series.map(s => (<div key={s.id} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span className="font-medium">{s.name}</span><div className="flex items-center gap-1"><span className="text-gray-400">₺</span><input type="number" value={s.basePrice} onChange={e => updatePrice('ppf', s.id, e.target.value)} className="w-20 p-1 border rounded text-right font-bold text-purple-700"/></div></div>))}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-700"><Car size={24} /><h3 className="text-xl font-bold">Parça Fiyatları</h3></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">{parts.map(p => (<div key={p.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50"><span className="text-sm">{p.name}</span><input type="number" value={p.price} onChange={e => updatePrice('part', p.id, e.target.value)} className="w-16 p-1 border rounded text-right text-sm"/></div>))}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-blue-700"><Sun size={24} /><h3 className="text-xl font-bold">Cam Filmi</h3></div>
          <div className="space-y-3">{products.windowFilm.products.map(p => (<div key={p.id} className="flex justify-between items-center p-2 bg-gray-50 rounded"><span className="font-medium">{p.name}</span><div className="flex items-center gap-1"><span className="text-gray-400">₺</span><input type="number" value={p.price} onChange={e => updatePrice('window', p.id, e.target.value)} className="w-20 p-1 border rounded text-right font-bold text-blue-700"/></div></div>))}</div>
        </div>
      </div>
    </div>
  );
};

// --- ANA DASHBOARD ---
const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [products, setProducts] = useState(olexProducts);
  const [parts, setParts] = useState(carParts);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [showWizard, setShowWizard] = useState(false);
  const [showOrderDetail, setShowOrderDetail] = useState(null);
  const [showStaffDetail, setShowStaffDetail] = useState(null);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const stats = await dashboardService.getStats();
      setDashStats(stats);

      const ordersData = await orderService.getAll();
      setOrders(Array.isArray(ordersData) ? ordersData.map(o => ({
        id: o.id || o.Id,
        customer: o.customerInfo || o.CustomerInfo || "Misafir",
        vehicle: o.vehicleInfo || o.VehicleInfo || "Araç Yok",
        plate: o.VehiclePlate || o.vehiclePlate || o.Plate || o.plate || "---",
        status: o.Status || o.status || "Pending",
        date: safeDate(o.Date || o.date || o.TransactionDate),
        totalPrice: o.TotalPrice || o.totalPrice || 0,
        services: o.SummaryList || o.summaryList || [],
        personnelIds: o.PersonnelIds || o.personnelIds || [], // Backend'den gelen personel ID'leri
        assignedStaff: o.Personnels ? o.Personnels.map(p => ({ id: p.Id, name: p.FullName || `${p.FirstName} ${p.LastName}` })) : [],
      })).sort((a, b) => b.id - a.id) : []);

      const staffData = await personnelService.getAll();
      console.log("🔍 Backend Personnel Data:", staffData); // Debug: See raw data
      setStaff(Array.isArray(staffData) ? staffData.map(p => {
        // Try to extract name from various possible fields
        const fullName = p.FullName || p.fullName;
        const firstName = p.FirstName || p.firstName || p.Ad || p.ad;
        const lastName = p.LastName || p.lastName || p.Soyad || p.soyad;
        const combinedName = `${firstName || ''} ${lastName || ''}`.trim();
        const singleName = p.Name || p.name || p.Username || p.username;
        
        const finalName = fullName || combinedName || singleName || `Personel #${p.id || p.Id}`;
        
        console.log(`👤 Personnel ${p.id || p.Id}:`, { fullName, firstName, lastName, singleName, finalName, raw: p }); // Debug each person
        
        return {
          id: p.id || p.Id,
          name: finalName,
          role: p.Position || p.position || "Personel",
          salary: p.Salary || p.salary || 0,
        };
      }).sort((a, b) => b.id - a.id) : []);

      const expensesData = await expenseService.getAll();
      setExpenses(Array.isArray(expensesData) ? expensesData.map(e => ({
        id: e.id || e.Id,
        type: (e.Type === 1 || e.type === 1 || e.IsIncome === true) ? "income" : "expense",
        title: e.Title || e.title || e.Description,
        description: e.Description || e.description,
        amount: e.Amount || e.amount || 0,
        date: safeDate(e.Date || e.date),
        category: e.Category || e.category || ((e.Type === 1 || e.type === 1) ? "Gelir" : "Gider")
      })).sort((a, b) => b.id - a.id) : []);

    } catch (error) {
      console.error("Veri çekme hatası:", error);
      setErrorMsg("Veriler yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

 const handleDeleteOrder = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      try {
        await orderService.delete(id);
        alert("Sipariş başarıyla silindi!");
        fetchData();
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("Silme başarısız: " + (err.response?.data?.Message || err.message));
      }
    }
  };
 const handleDeleteStaff = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      try {
        await personnelService.delete(id);
        alert("Personel başarıyla silindi!");
        fetchData();
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("Silme başarısız: " + (err.response?.data?.Message || err.message));
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm("Silmek istediğinize emin misiniz?")) {
      try {
        await expenseService.delete(id);
        alert("Kayıt başarıyla silindi!");
        fetchData();
      } catch (err) {
        console.error("Silme hatası:", err);
        alert("Silme başarısız: " + (err.response?.data?.Message || err.message));
      }
    }
  };
  const handleAddStaff = async (data) => {
    const nameParts = data.name.trim().split(" ");
    const lastName = nameParts.pop() || "";
    const firstName = nameParts.join(" ") || data.name;
    await personnelService.create({ firstName, lastName, position: data.role, salary: parseFloat(data.salary), startDate: new Date().toISOString() });
    setShowAddStaff(false);
    fetchData();
  };

  const handleAddExpense = async (data) => {
    await expenseService.create({
      title: data.category,
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type === "income" ? 1 : 0,
      date: new Date(data.date).toISOString()
    });
    setShowAddExpense(false);
    fetchData();
  };

  // Fix: Always calculate stats from local orders to ensure real-time updates
  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === "Completed" || o.status === "Tamamlandı").length,
    pendingOrders: orders.filter(o => o.status === "Pending" || o.status === "Beklemede" || o.status === "İşlemde").length,
    totalRevenue: orders
        .filter(o => o.status === "Completed" || o.status === "Tamamlandı")
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0) // Only count completed revenue
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg"><Car className="text-white" size={24} /></div>
            <div><h1 className="text-xl font-bold text-gray-800">Bağlan Oto Care</h1><p className="text-sm text-gray-500">Yönetim Paneli</p></div>
          </div>
          <div className="flex items-center gap-4"><span className="text-sm text-gray-600 font-medium">{user?.name}</span><button onClick={onLogout} className="text-red-600"><LogOut size={20}/></button></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow flex justify-between"><div><p className="text-gray-500 text-sm">Toplam İş</p><p className="text-2xl font-bold">{stats.totalOrders}</p></div><ClipboardList className="text-blue-600" size={32}/></div>
          <div className="bg-white p-6 rounded-lg shadow flex justify-between"><div><p className="text-gray-500 text-sm">Tamamlanan</p><p className="text-2xl font-bold text-green-600">{stats.completedOrders}</p></div><Check className="text-green-600" size={32}/></div>
          <div className="bg-white p-6 rounded-lg shadow flex justify-between"><div><p className="text-gray-500 text-sm">Bekleyen</p><p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p></div><Clock className="text-yellow-600" size={32}/></div>
          <div className="bg-white p-6 rounded-lg shadow flex justify-between"><div><p className="text-gray-500 text-sm">Ciro</p><p className="text-2xl font-bold text-purple-600">₺{stats.totalRevenue?.toLocaleString()}</p></div><TrendingUp className="text-purple-600" size={32}/></div>
        </div>

        <div className="bg-white border-b rounded-t-lg flex gap-1 px-4 overflow-x-auto">
          {[{ id: "orders", label: "İş Emirleri", icon: ClipboardList }, { id: "customers", label: "Müşteri Ekle", icon: Plus }, { id: "staff", label: "Personel", icon: Users }, { id: "accounting", label: "Muhasebe", icon: DollarSign }, { id: "settings", label: "Ayarlar", icon: Settings }].map((tab) => (
            <button key={tab.id} onClick={() => tab.id === "customers" ? setShowWizard(true) : setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-800"}`}><tab.icon size={18} /> {tab.label}</button>
          ))}
        </div>

        <div className="bg-white rounded-b-lg shadow p-6 min-h-[400px]">
          {errorMsg && <div className="bg-red-50 text-red-700 p-3 rounded mb-4 flex items-center gap-2"><AlertTriangle size={18}/>{errorMsg}</div>}
          {loading ? <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" size={48} /></div> : (
            <>
              {activeTab === "orders" && <OrderList orders={orders} onEdit={(o) => setShowOrderDetail(o)} onDelete={handleDeleteOrder} />}
              {activeTab === "staff" && <StaffList staff={staff} onAdd={() => setShowAddStaff(true)} onDetail={(p) => setShowStaffDetail(p)} onDelete={handleDeleteStaff} />}
              {activeTab === "accounting" && <AccountingView expenses={expenses} orders={orders} onAdd={() => setShowAddExpense(true)} onDelete={handleDeleteExpense} onDeleteOrder={handleDeleteOrder} />}
              {activeTab === "settings" && <SettingsPanel products={products} setProducts={setProducts} parts={parts} setParts={setParts} />}
            </>
          )}
        </div>
      </div>

      {showWizard && <NewOrderWizard onClose={() => setShowWizard(false)} onSuccess={() => { fetchData(); setShowWizard(false); }} products={products} parts={parts} />}
      {showOrderDetail && <OrderDetailModal order={showOrderDetail} staff={staff} onClose={() => setShowOrderDetail(null)} onSave={() => { fetchData(); setShowOrderDetail(null); }} />}
      {showStaffDetail && <StaffDetailModal person={showStaffDetail} orders={orders} onClose={() => setShowStaffDetail(null)} />}
      {showAddStaff && <AddStaffModal onClose={() => setShowAddStaff(false)} onAdd={handleAddStaff} />}
      {showAddExpense && <AddTransactionModal onClose={() => setShowAddExpense(false)} onAdd={handleAddExpense} />}
    </div>
  );
};

export default Dashboard;
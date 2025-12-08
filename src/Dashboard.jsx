import React, { useState, useEffect } from "react";
import { Car, LogOut, ClipboardList, Check, Clock, TrendingUp, Users, DollarSign, Plus, Search, Eye, Trash2, Settings, Loader2, AlertTriangle } from "lucide-react";
import NewCustomerFlow from "./components/NewCustomerFlow";
import OrderDetailModal from "./components/OrderDetailModal";
import { StaffDetailModal, AddStaffModal } from "./components/StaffModals";
import AddTransactionModal from "./components/TransactionModal";
import SettingsView from "./components/SettingsView";
import { getOrders, getStaff } from "./api"; // DÜZELTİLDİ: Yeni fonksiyonlar

const Dashboard = ({ user, setUser, products, setProducts, parts, setParts, onLogout }) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchPlate, setSearchPlate] = useState("");
  const [showCustomerFlow, setShowCustomerFlow] = useState(false);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      setErrorMsg(null);
      
      try {
        // 1. Siparişleri Çek
        const orderData = await getOrders();
        setOrders(orderData.map(order => ({
          id: order.id,
          customer: order.customerInfo,
          vehicle: order.vehicleInfo,
          plate: order.plate,
          status: order.status === "Pending" ? "Bekliyor" : order.status,
          date: new Date(order.date).toLocaleDateString("tr-TR"),
          totalPrice: order.totalPrice,
          services: order.summaryList || []
        })));

        // 2. Personeli Çek
        const staffData = await getStaff();
        setStaff(staffData.map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            role: p.position,
            salary: p.salary,
            completedJobs: 0
        })));

      } catch (error) {
        console.error("Veri hatası:", error);
        setErrorMsg("Veriler yüklenemedi. Backend bağlantısını kontrol edin.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab]); // Sadece user veya tab değişince çalışır

  // İstatistikler
  const stats = {
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === "Completed" || o.status === "Tamamlandı").length,
    pendingOrders: orders.filter((o) => o.status === "Pending" || o.status === "Bekliyor").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const filteredOrders = orders.filter((order) => 
    order.plate?.toLowerCase().includes(searchPlate.toLowerCase())
  );

  const handleLogout = () => {
    if (onLogout) onLogout();
    if (setUser) setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
       <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg"><Car className="text-white" size={24} /></div>
              <h1 className="text-xl font-bold text-gray-800">Bağlan Oto Bakım</h1>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-700">
              <LogOut size={18} /> <span className="text-sm">Çıkış</span>
            </button>
        </div>
      </div>

       <div className="max-w-7xl mx-auto px-4 py-6">
        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Toplam İş</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Gelir</p>
            <p className="text-2xl font-bold text-purple-600">₺{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Menü */}
        <div className="bg-white border-b rounded-t-lg flex overflow-x-auto">
            {[{ id: "orders", label: "İş Emirleri", icon: ClipboardList }, { id: "customers", label: "+ Yeni İşlem", icon: Plus }, { id: "staff", label: "Personel", icon: Users }, { id: "settings", label: "Ayarlar", icon: Settings }].map((tab) => (
              <button key={tab.id} onClick={() => tab.id === "customers" ? setShowCustomerFlow(true) : setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"}`}>
                <tab.icon size={18} /><span>{tab.label}</span>
              </button>
            ))}
        </div>

        <div className="bg-white rounded-b-lg shadow p-6 min-h-[400px]">
          {errorMsg && <div className="text-red-600 mb-4">{errorMsg}</div>}
          {loading ? <div className="text-center p-10"><Loader2 className="animate-spin mx-auto text-blue-600" /></div> : (
            <>
              {activeTab === "orders" && (
                <div>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Plaka Ara..." className="w-full pl-10 p-2 border rounded-lg" value={searchPlate} onChange={(e) => setSearchPlate(e.target.value)} />
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr><th className="p-3">Plaka</th><th className="p-3">Müşteri</th><th className="p-3">Araç</th><th className="p-3">Tutar</th><th className="p-3">Durum</th></tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono font-bold">{order.plate}</td>
                          <td className="p-3">{order.customer}</td>
                          <td className="p-3">{order.vehicle}</td>
                          <td className="p-3 font-bold">₺{order.totalPrice}</td>
                          <td className="p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {activeTab === "staff" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {staff.map(p => <div key={p.id} className="border p-4 rounded shadow-sm"><b>{p.name}</b><p className="text-gray-500">{p.role}</p></div>)}
                </div>
              )}
              {activeTab === "settings" && <SettingsView products={products} setProducts={setProducts} parts={parts} setParts={setParts} />}
            </>
          )}
        </div>
      </div>

      {showCustomerFlow && (
        <NewCustomerFlow onClose={() => setShowCustomerFlow(false)} onSuccess={() => { setShowCustomerFlow(false); setActiveTab("orders"); }} />
      )}
    </div>
  );
};

export default Dashboard;
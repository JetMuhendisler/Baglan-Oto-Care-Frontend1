import React, { useState, useEffect } from "react";
import { Save, Car, Layers, Sun, Shield, Plus, Loader2, List, Grid } from "lucide-react";
import { serviceDefService } from "../api";

const SettingsView = ({ products, setProducts, parts, setParts }) => {
  const [activeTab, setActiveTab] = useState("catalog"); // "prices" veya "catalog"
  
  // --- KATALOG YÖNETİMİ STATE ---
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    category: "PPF", // Varsayılan
    price: "",
    includedParts: "Tam Araç"
  });

  // Katalog Verilerini Çek
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceDefService.getAll();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Hizmetler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  // İlk yüklemede verileri çek
  useEffect(() => {
    if (activeTab === "catalog") {
      fetchServices();
    }
  }, [activeTab]);

  // Yeni Hizmet Ekleme (API)
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return alert("Lütfen isim ve fiyat giriniz.");

    try {
      const payload = {
        name: newService.name,
        category: newService.category,
        price: parseFloat(newService.price),
        includedParts: newService.includedParts
      };
      await serviceDefService.create(payload);
      alert("Hizmet başarıyla eklendi!");
      setNewService({ name: "", category: "PPF", price: "", includedParts: "Tam Araç" }); // Formu sıfırla
      fetchServices(); // Listeyi güncelle
    } catch (err) {
      alert("Ekleme hatası: " + (err.response?.data?.message || err.message));
    }
  };

  // --- FİYAT DÜZENLEME FONKSİYONLARI (Simülasyon) ---
  const updatePrice = (type, id, val) => {
    const price = parseFloat(val) || 0;
    if (type === 'part') {
      setParts(parts.map(p => p.id === id ? { ...p, price } : p));
    } else if (type === 'ppf') {
      setProducts(prev => ({
        ...prev,
        ppf: { ...prev.ppf, series: prev.ppf.series.map(s => s.id === id ? { ...s, basePrice: price } : s) }
      }));
    } else if (type === 'window') {
      setProducts(prev => ({
        ...prev,
        windowFilm: { ...prev.windowFilm, products: prev.windowFilm.products.map(p => p.id === id ? { ...p, price } : p) }
      }));
    } else if (type === 'ceramic') {
      setProducts(prev => ({
        ...prev,
        ceramic: { ...prev.ceramic, products: prev.ceramic.products.map(p => p.id === id ? { ...p, price } : p) }
      }));
    }
  };

  return (
    <div className="p-6 space-y-6 pb-20">
      
      {/* Üst Başlık ve Sekmeler */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Ayarlar ve Katalog</h2>
          <p className="text-gray-500 text-sm">Hizmetlerinizi ve fiyatlarınızı yönetin.</p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border shadow-sm">
            <button 
                onClick={() => setActiveTab("catalog")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === "catalog" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                <List size={18}/> Katalog Yönetimi (API)
            </button>
            <button 
                onClick={() => setActiveTab("prices")} 
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === "prices" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                <Grid size={18}/> Fiyat Listesi (Hızlı)
            </button>
        </div>
      </div>

      {/* --- SEKME 1: KATALOG YÖNETİMİ (CANLI API) --- */}
      {activeTab === "catalog" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Yeni Ekleme Formu */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-blue-700">
                        <Plus size={20}/> Yeni Hizmet Ekle
                    </h3>
                    <form onSubmit={handleAddService} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Hizmet Adı</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="Örn: Gold Paket Yıkama"
                                value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Kategori</label>
                            <select className="w-full border p-2 rounded" 
                                value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}>
                                <option value="PPF">PPF Kaplama</option>
                                <option value="Seramik">Seramik Kaplama</option>
                                <option value="Cam Filmi">Cam Filmi</option>
                                <option value="Yıkama">Yıkama & Bakım</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Fiyat (₺)</label>
                            <input type="number" className="w-full border p-2 rounded" placeholder="0.00"
                                value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Kapsam / Parçalar</label>
                            <input type="text" className="w-full border p-2 rounded" placeholder="Örn: Tam Araç, Kaput..."
                                value={newService.includedParts} onChange={e => setNewService({...newService, includedParts: e.target.value})}/>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium">
                            Kataloğa Ekle
                        </button>
                    </form>
                </div>
            </div>

            {/* Mevcut Liste */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow border overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Mevcut Hizmet Tanımları</h3>
                        <button onClick={fetchServices} className="text-sm text-blue-600 hover:underline">Yenile</button>
                    </div>
                    {loading ? (
                        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>
                    ) : (
                        <div className="max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">Hizmet Adı</th>
                                        <th className="p-3">Kategori</th>
                                        <th className="p-3">Kapsam</th>
                                        <th className="p-3">Fiyat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {services.length > 0 ? services.map((svc) => (
                                        <tr key={svc.id} className="hover:bg-gray-50">
                                            <td className="p-3 font-medium">{svc.name}</td>
                                            <td className="p-3"><span className="bg-gray-100 px-2 py-1 rounded text-xs">{svc.category}</span></td>
                                            <td className="p-3 text-gray-500">{svc.includedParts}</td>
                                            <td className="p-3 font-bold text-green-600">₺{svc.price}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="p-6 text-center text-gray-500">Kayıtlı hizmet bulunamadı.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- SEKME 2: FİYAT LİSTESİ DÜZENLEME (MEVCUT YAPI) --- */}
      {activeTab === "prices" && (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm">
                    <Save size={20} /> <span>Değişiklikleri Kaydet (Local)</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PPF */}
                <div className="bg-white p-6 rounded-lg shadow border border-purple-100">
                <div className="flex items-center gap-2 mb-4 text-purple-700"><Shield size={24} /><h3 className="text-xl font-bold">PPF Fiyatları</h3></div>
                <div className="space-y-3">
                    {products.ppf.series.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{s.name}</span>
                        <div className="flex items-center gap-1"><span className="text-gray-400">₺</span>
                        <input type="number" value={s.basePrice} onChange={e => updatePrice('ppf', s.id, e.target.value)} className="w-24 p-1 border rounded text-right font-bold text-purple-700"/>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Parçalar */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                <div className="flex items-center gap-2 mb-4 text-gray-700"><Car size={24} /><h3 className="text-xl font-bold">Araç Parça Fiyatları</h3></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                    {parts.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                        <span className="text-sm">{p.name}</span>
                        <input type="number" value={p.price} onChange={e => updatePrice('part', p.id, e.target.value)} className="w-20 p-1 border rounded text-right text-sm"/>
                    </div>
                    ))}
                </div>
                </div>

                {/* Cam Filmi */}
                <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
                <div className="flex items-center gap-2 mb-4 text-blue-700"><Sun size={24} /><h3 className="text-xl font-bold">Cam Filmi Fiyatları</h3></div>
                <div className="space-y-3">
                    {products.windowFilm.products.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{p.name}</span>
                        <div className="flex items-center gap-1"><span className="text-gray-400">₺</span>
                        <input type="number" value={p.price} onChange={e => updatePrice('window', p.id, e.target.value)} className="w-24 p-1 border rounded text-right font-bold text-blue-700"/>
                        </div>
                    </div>
                    ))}
                </div>
                </div>

                {/* Seramik */}
                <div className="bg-white p-6 rounded-lg shadow border border-green-100">
                <div className="flex items-center gap-2 mb-4 text-green-700"><Layers size={24} /><h3 className="text-xl font-bold">Seramik Fiyatları</h3></div>
                <div className="space-y-3">
                    {products.ceramic.products.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{p.name}</span>
                        <div className="flex items-center gap-1"><span className="text-gray-400">₺</span>
                        <input type="number" value={p.price} onChange={e => updatePrice('ceramic', p.id, e.target.value)} className="w-24 p-1 border rounded text-right font-bold text-green-700"/>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default SettingsView;
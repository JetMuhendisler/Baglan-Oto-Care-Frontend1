import React, { useState, useEffect } from "react";
import { 
  Plus, Trash2, Edit2, Save, X, Layers, Box, 
  ChevronDown, ChevronRight, Tag, Loader2, ShieldCheck, DollarSign, ListTree 
} from "lucide-react";
import { catalogService } from "../api";

const SettingsView = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'CATEGORY', 'PRODUCT', 'VARIANT', 'PRICE'
  const [editingItem, setEditingItem] = useState(null);
  
  // İşlem yapılan Parent ID'ler
  const [parentId, setParentId] = useState(null); 

  const [formData, setFormData] = useState({});

  // Veri Çekme
  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        catalogService.getAllCategories(),
        catalogService.getAllProducts()
      ]);
      setCategories(Array.isArray(catsRes) ? catsRes : catsRes.data || []);
      setProducts(Array.isArray(prodsRes) ? prodsRes : prodsRes.data || []);
    } catch (error) {
      console.error("Veri hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Modal Açma
  const openModal = (type, item = null, pId = null) => {
    setModalType(type);
    setEditingItem(item);
    setParentId(pId);
    setFormData({}); // Formu temizle

    // --- FORM VARSAYILANLARI ---
    if (item) {
        // Düzenleme Modu (Mevcut verileri doldur)
        // Not: Burada detaylı maplemeler gerekebilir, şimdilik basit tutuyoruz.
    } else {
        // Yeni Ekleme Modu
        if (type === 'PRODUCT') {
            setFormData({ 
                categoryId: "", name: "", brand: "", description: "", 
                hasMicron: false, basePrice: 0 
            });
        }
        if (type === 'VARIANT') {
            setFormData({ 
                name: "", thicknessCode: "", 
                hasSubParts: false, variantPrice: 0 
            });
        }
        if (type === 'PRICE') {
            setFormData({ partName: "", price: 0, isExtra: false });
        }
        if (type === 'CATEGORY') {
            setFormData({ name: "", description: "" });
        }
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setFormData({}); setEditingItem(null); setParentId(null); };

  // --- KAYDETME MANTIĞI ---
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // 1. KATEGORİ
      if (modalType === 'CATEGORY') {
        if (editingItem) await catalogService.updateCategory({ ...formData, id: editingItem.id });
        else await catalogService.createCategory(formData);
      } 
      
      // 2. ÜRÜN (LEVEL 1)
      else if (modalType === 'PRODUCT') {
        // hasMicron true ise, basePrice 0 gönderilir
        const payload = {
            ...formData,
            categoryId: parseInt(formData.categoryId),
            basePrice: formData.hasMicron ? 0 : parseFloat(formData.basePrice)
        };

        if (editingItem) await catalogService.updateProduct({ ...payload, id: editingItem.id });
        else await catalogService.createProduct(payload);
      }
      
      // 3. VARYANT (LEVEL 2)
      else if (modalType === 'VARIANT') {
        // hasSubParts true ise, variantPrice 0 gönderilir
        const payload = {
            ...formData,
            productId: parentId, // Parent ID buradan gelir
            variantPrice: formData.hasSubParts ? 0 : parseFloat(formData.variantPrice)
        };

        if (editingItem) await catalogService.updateVariant({ ...payload, id: editingItem.id });
        else await catalogService.createVariant(payload);
      }

      // 4. PARÇA FİYAT (LEVEL 3)
      else if (modalType === 'PRICE') {
        const payload = {
            ...formData,
            variantId: parentId, // Parent ID (Varyant ID) buradan gelir
            price: parseFloat(formData.price)
        };
        // Backend'de createPartPrice endpointi VariantId bekliyor, isimlendirme uydu.
        if (editingItem) await catalogService.updatePartPrice({ ...payload, id: editingItem.id });
        else await catalogService.createPartPrice(payload);
      }

      alert("İşlem Başarılı!");
      closeModal();
      fetchData(); 
    } catch (error) {
      alert("Hata: " + (error.response?.data?.Message || error.message));
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      if (type === 'CATEGORY') await catalogService.deleteCategory(id);
      if (type === 'PRODUCT') await catalogService.deleteProduct(id);
      if (type === 'VARIANT') await catalogService.deleteVariant(id);
      if (type === 'PRICE') await catalogService.deletePartPrice(id);
      fetchData();
    } catch (error) {
      alert("Silinemedi: " + error.message);
    }
  };

  return (
    <div className="p-6 pb-24 space-y-6 bg-gray-50 min-h-screen">
      {/* BAŞLIK */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600"/> Katalog Yönetimi
          </h2>
          <p className="text-gray-500 text-sm">Ürünleri, mikronları ve parça fiyatlarını yapılandırın.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setActiveTab("categories")} className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${activeTab === "categories" ? "bg-white text-blue-600 shadow" : "text-gray-600"}`}><Layers size={18}/> Kategoriler</button>
          <button onClick={() => setActiveTab("products")} className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${activeTab === "products" ? "bg-white text-blue-600 shadow" : "text-gray-600"}`}><Box size={18}/> Ürünler</button>
        </div>
      </div>

      {loading && <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600 w-8 h-8"/></div>}

      {/* KATEGORİ LİSTESİ */}
      {!loading && activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => openModal('CATEGORY')} className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 bg-white h-32 transition-all">
            <Plus size={32} /> <span className="font-bold mt-2">Yeni Kategori</span>
          </button>
          {categories.map(cat => (
            <div key={cat.id} className="bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center group hover:border-blue-300 transition-all">
              <div><h3 className="font-bold text-lg text-gray-800">{cat.name}</h3><p className="text-gray-500 text-sm">{cat.description}</p></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openModal('CATEGORY', cat)} className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete('CATEGORY', cat.id)} className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ÜRÜN LİSTESİ (HİYERARŞİK GÖRÜNÜM) */}
      {!loading && activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-end">
             <button onClick={() => openModal('PRODUCT')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all"><Plus size={20}/> Yeni Ürün Ekle</button>
          </div>
          {products.map(prod => (
            <div key={prod.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              {/* 1. SEVİYE: ÜRÜN BAŞLIĞI */}
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors border-b" onClick={() => setExpandedProductId(expandedProductId === prod.id ? null : prod.id)}>
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full transition-colors ${expandedProductId === prod.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                    {expandedProductId === prod.id ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">{prod.brand} <span className="font-normal text-gray-600">{prod.name}</span></h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{prod.categoryName}</span>
                        {/* Micron Var mı Badge */}
                        {prod.hasMicron ? 
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-medium">Micronlu</span> : 
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 font-bold">Tek Fiyat: ₺{prod.basePrice}</span>
                        }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete('PRODUCT', prod.id); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>

              {/* 2. SEVİYE: VARYANTLAR (ACCORDION) */}
              {expandedProductId === prod.id && (
                <div className="p-6 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide"><ListTree size={16}/> Varyantlar / Seçenekler</h4>
                      <button onClick={() => openModal('VARIANT', null, prod.id)} className="text-xs bg-white border border-blue-300 text-blue-600 px-3 py-1.5 rounded-md font-bold hover:bg-blue-50 flex items-center gap-1 shadow-sm"><Plus size={14}/> Varyant Ekle</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prod.variants?.map((variant, vIdx) => {
                      const variantId = variant.id;
                      return (
                      <div key={vIdx} className="bg-white border rounded-lg p-4 shadow-sm relative group hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start border-b pb-2 mb-3">
                           <div>
                               <span className="block font-bold text-purple-700 text-lg">{variant.thicknessCode || "Kodsuz"}</span>
                               <span className="text-xs text-gray-500">{variant.name}</span>
                           </div>
                           <div className="flex items-center gap-2">
                               {/* Eğer Alt Parça VARSA -> Fiyat Ekle Butonu Göster */}
                               {variant.hasSubParts ? (
                                   <button onClick={() => openModal('PRICE', null, variantId)} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200 hover:bg-green-100 flex items-center gap-1 transition-colors font-medium"><Plus size={12}/> Parça Fiyatı Ekle</button>
                               ) : (
                                   <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border font-bold">Sabit: ₺{variant.variantPrice}</span>
                               )}
                               <button onClick={() => handleDelete('VARIANT', variantId)} className="text-red-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                           </div>
                        </div>

                        {/* 3. SEVİYE: PARÇA FİYATLARI (Sadece HasSubParts true ise görünür) */}
                        {variant.hasSubParts && (
                            <ul className="space-y-2">
                            {variant.partPrices?.map((price, pIdx) => (
                                <li key={pIdx} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-all">
                                    <div className="flex items-center gap-2"><span className="font-medium text-gray-700">{price.partName}</span>{price.isExtra && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">Ekstra</span>}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-600">₺{price.price?.toLocaleString()}</span>
                                        <button onClick={() => handleDelete('PRICE', price.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={12}/></button>
                                    </div>
                                </li>
                            ))}
                            {(!variant.partPrices || variant.partPrices.length === 0) && <li className="text-xs text-gray-400 italic text-center py-2">Henüz parça fiyatı girilmedi.</li>}
                            </ul>
                        )}
                      </div>
                    )})}
                    {(!prod.variants || prod.variants.length === 0) && <div className="col-span-2 text-center py-6 text-gray-400 italic bg-white border border-dashed rounded-lg">Varyant yok.</div>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            <h3 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">
                {modalType === 'CATEGORY' && "Kategori Yönetimi"}
                {modalType === 'PRODUCT' && "Yeni Ürün Tanımla"}
                {modalType === 'VARIANT' && "Varyant Ekle"}
                {modalType === 'PRICE' && "Parça Fiyatı Ekle"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
                
                {/* KATEGORİ FORMU */}
                {modalType === 'CATEGORY' && (
                    <>
                        <input className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kategori Adı" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        <textarea className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Açıklama" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                    </>
                )}

                {/* ÜRÜN FORMU */}
                {modalType === 'PRODUCT' && (
                    <>
                        <select className="w-full border p-3 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500" value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required><option value="">Kategori Seçin</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                        <input className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Marka (Örn: OLEX)" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required />
                        <input className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ürün Adı" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        
                        {/* MİKRON SEÇENEĞİ */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={formData.hasMicron} onChange={e => setFormData({...formData, hasMicron: e.target.checked})} />
                                <span className="font-bold text-blue-800">Bu Ürünün Mikron Çeşitleri Var mı?</span>
                            </label>
                            {/* Eğer micron yoksa fiyat sor */}
                            {!formData.hasMicron && (
                                <div className="mt-3 relative animate-in slide-in-from-top-2">
                                    <input type="number" className="w-full border p-2 rounded pl-8 outline-none focus:ring-2 focus:ring-green-500" placeholder="Ürün Fiyatı" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} required />
                                    <span className="absolute left-2 top-2 text-gray-400">₺</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* VARYANT FORMU */}
                {modalType === 'VARIANT' && (
                    <>
                        <input className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Kod / Kalınlık (Örn: 190)" value={formData.thicknessCode} onChange={e => setFormData({...formData, thicknessCode: e.target.value})} required />
                        <input className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Varyant Adı (Örn: Micron)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        
                        {/* ALT PARÇA SEÇENEĞİ */}
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-5 h-5 text-purple-600 rounded" checked={formData.hasSubParts} onChange={e => setFormData({...formData, hasSubParts: e.target.checked})} />
                                <span className="font-bold text-purple-800">Alt Parçalara Bölünecek mi? (Kaput, Tavan...)</span>
                            </label>
                            {/* Eğer alt parça yoksa tek fiyat sor */}
                            {!formData.hasSubParts && (
                                <div className="mt-3 relative animate-in slide-in-from-top-2">
                                    <input type="number" className="w-full border p-2 rounded pl-8 outline-none focus:ring-2 focus:ring-green-500" placeholder="Varyant Fiyatı" value={formData.variantPrice} onChange={e => setFormData({...formData, variantPrice: e.target.value})} required />
                                    <span className="absolute left-2 top-2 text-gray-400">₺</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* FİYAT FORMU (Sadece Alt Parça Varsa Açılır) */}
                {modalType === 'PRICE' && (
                    <>
                        <input className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-green-500" placeholder="Parça Adı (Örn: Kaput)" value={formData.partName} onChange={e => setFormData({...formData, partName: e.target.value})} required />
                        <div className="relative">
                            <input type="number" className="w-full border p-3 rounded-lg pl-8 outline-none focus:ring-2 focus:ring-green-500" placeholder="Fiyat" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
                            <span className="absolute left-3 top-3.5 text-gray-400">₺</span>
                        </div>
                        <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={formData.isExtra} onChange={e => setFormData({...formData, isExtra: e.target.checked})} />
                            <span className="text-gray-700 font-medium">Ekstra İşlem mi?</span>
                        </label>
                    </>
                )}

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2 shadow-md transition-all"><Save size={18} /> Kaydet</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
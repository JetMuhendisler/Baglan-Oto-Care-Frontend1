import React, { useState, useEffect } from "react";
import { Check, ChevronRight, ChevronLeft, Car, Calendar, CreditCard, X, Loader2, User } from "lucide-react";
import { orderService, catalogService, personnelService } from "../api";

const NewOrderWizard = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // --- CATALOG & STAFF DATA ---
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [staffList, setStaffList] = useState([]);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    plateNumber: "", brand: "", model: "", color: "", year: "",
    selectedServices: [], 
    appointmentDate: new Date().toISOString().split('T')[0], appointmentTime: "09:00",
    paymentMethod: "Nakit", isPaid: false,
    finalPrice: null,
    personnelId: 0 // Personel seçimi için
  });

  // --- STEP 2 SELECTION STATES ---
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // VERİLERİ ÇEK
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes, staffRes] = await Promise.all([
            catalogService.getAllCategories(),
            catalogService.getAllProducts(),
            personnelService.getAll()
        ]);
        setCategories(Array.isArray(catsRes) ? catsRes : catsRes.data || []);
        setProducts(Array.isArray(prodsRes) ? prodsRes : prodsRes.data || []);
        setStaffList(Array.isArray(staffRes) ? staffRes : staffRes.data || []);
      } catch (err) {
        console.error("Veri yüklenemedi:", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlateBlur = async () => {
    if (formData.plateNumber.length > 2) {
      try {
        const res = await orderService.search(formData.plateNumber);
        if (res && res.Found) {
          setFormData(prev => ({
            ...prev,
            customerName: res.CustomerName || res.customerName || "",
            customerPhone: res.Phone || res.phone || "",
            brand: res.Brand || res.brand || "",
            model: res.Model || res.model || ""
          }));
        }
      } catch (err) { console.log("Arama hatası", err); }
    }
  };

  // --- AKILLI HİZMET EKLEME MANTIĞI ---
  const addToCart = (categoryName, productName, variantName, partName, price) => {
    // Aynı hizmet var mı kontrolü
    const exists = formData.selectedServices.some(item => 
        item.category === categoryName &&
        item.product === productName &&
        item.spec === (variantName || "") &&
        item.part === (partName || "Standart")
    );

    if (exists) return;

    const newItem = {
      category: categoryName,
      product: productName,
      spec: variantName || "",
      part: partName || "Standart",
      price: price
    };
    
    setFormData(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, newItem]
    }));
  };

  // 1. Ürün Seçimi
  const handleProductSelect = (prod) => {
    // Eğer ürünün mikron/varyantı YOKSA -> Direkt Ekle
    if (!prod.hasMicron) {
        addToCart(activeCategory.name, prod.name, "", "Tam Uygulama", prod.basePrice);
        // Seçimi sıfırla (başka ürün seçilebilsin)
        setActiveProduct(null); 
    } else {
        // Varyantı varsa -> Detay aç
        setActiveProduct(prod);
        setSelectedVariant(null);
    }
  };

  // 2. Varyant Seçimi
  const handleVariantSelect = (variant) => {
    // Eğer varyantın alt parçası YOKSA -> Direkt Ekle
    if (!variant.hasSubParts) {
        addToCart(
            activeCategory.name, 
            activeProduct.name, 
            variant.thicknessCode || variant.name, 
            "Tam Uygulama", 
            variant.variantPrice
        );
        setSelectedVariant(null);
    } else {
        // Alt parçası varsa -> Parçaları göster
        setSelectedVariant(variant);
    }
  };

  const removeServiceItem = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        plateNumber: formData.plateNumber,
        brand: formData.brand,
        model: formData.model,
        color: formData.color,
        year: formData.year,
        personnelId: Number(formData.personnelId), // Seçilen personel
        date: new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).toISOString(),
        totalPrice: formData.finalPrice !== null ? Number(formData.finalPrice) : formData.selectedServices.reduce((sum, item) => sum + item.price, 0),
        paymentMethod: formData.paymentMethod,
        isPaid: formData.isPaid,
        selectedServices: formData.selectedServices
      };

      await orderService.create(payload);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Hata: " + (error.response?.data?.Message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ADIM 1: MÜŞTERİ & ARAÇ
  const renderStep1 = () => (
    <div className="space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2"><Car size={20}/> Müşteri ve Araç</h3>
      <div className="grid grid-cols-2 gap-4">
        <input className="border p-3 rounded-lg" placeholder="Plaka (06ABC123)" 
          value={formData.plateNumber} 
          onChange={e => handleChange("plateNumber", e.target.value.toUpperCase())}
          onBlur={handlePlateBlur}
        />
        <input className="border p-3 rounded-lg" placeholder="Telefon (5XX...)" 
          value={formData.customerPhone} onChange={e => handleChange("customerPhone", e.target.value)} />
        <input className="border p-3 rounded-lg col-span-2" placeholder="Müşteri Adı Soyadı" 
          value={formData.customerName} onChange={e => handleChange("customerName", e.target.value)} />
        <input className="border p-3 rounded-lg" placeholder="Marka (BMW)" 
          value={formData.brand} onChange={e => handleChange("brand", e.target.value)} />
        <input className="border p-3 rounded-lg" placeholder="Model (320i)" 
          value={formData.model} onChange={e => handleChange("model", e.target.value)} />
        <input className="border p-3 rounded-lg" placeholder="Renk" 
          value={formData.color} onChange={e => handleChange("color", e.target.value)} />
        <input className="border p-3 rounded-lg" placeholder="Yıl" 
          value={formData.year} onChange={e => handleChange("year", e.target.value)} />
      </div>
    </div>
  );

  // ADIM 2: HİZMETLER (GÜNCELLENDİ)
  const renderStep2 = () => {
    if (dataLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/> Yükleniyor...</div>;

    const filteredProducts = activeCategory 
        ? products.filter(p => p.categoryName === activeCategory.name || p.categoryId === activeCategory.id)
        : [];

    return (
      <div className="h-[500px] flex gap-4">
        {/* SOL: KATEGORİ LİSTESİ */}
        <div className="w-1/4 border-r pr-2 space-y-2 overflow-y-auto">
          {categories.map(cat => (
            <button key={cat.id} 
              onClick={() => { setActiveCategory(cat); setActiveProduct(null); setSelectedVariant(null); }}
              className={`w-full text-left p-3 rounded-lg font-medium transition-colors ${activeCategory?.id === cat.id ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* ORTA: ÜRÜN VE VARYANT SEÇİMİ */}
        <div className="flex-1 overflow-y-auto pr-2">
          {activeCategory ? (
            <div>
              <h4 className="font-bold mb-3 text-gray-700">{activeCategory.name} Ürünleri</h4>
              
              {/* Ürün Listesi */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                {filteredProducts.length > 0 ? filteredProducts.map((prod) => (
                  <div key={prod.id} 
                    className={`border p-3 rounded-lg cursor-pointer transition-all flex justify-between items-center ${activeProduct?.id === prod.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "hover:border-gray-400"}`}
                    onClick={() => handleProductSelect(prod)}>
                    <div>
                        <div className="font-semibold text-blue-900">{prod.brand}</div>
                        <div className="text-sm text-gray-600">{prod.name}</div>
                    </div>
                    {/* Micron yoksa fiyatı göster */}
                    {!prod.hasMicron ? (
                        <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">₺{prod.basePrice}</span>
                    ) : (
                        <ChevronRight size={16} className="text-gray-400"/>
                    )}
                  </div>
                )) : <div className="text-gray-500 italic">Bu kategoride ürün bulunamadı.</div>}
              </div>

              {/* VARYANTLAR (Sadece Ürün Seçiliyse ve Micron Varsa) */}
              {activeProduct && activeProduct.hasMicron && activeProduct.variants && activeProduct.variants.length > 0 && (
                <div className="mb-6 animate-fade-in bg-gray-50 p-3 rounded border">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tip / Kalınlık Seçimi:</label>
                  <div className="flex flex-wrap gap-2">
                    {activeProduct.variants.map((v, idx) => {
                      const uniqueKey = v.thicknessCode || v.name || idx; 
                      return (
                        <button 
                          key={uniqueKey} 
                          onClick={() => handleVariantSelect(v)}
                          className={`px-4 py-2 border rounded-md transition-colors font-medium text-sm flex flex-col items-center
                            ${selectedVariant?.thicknessCode === v.thicknessCode && selectedVariant?.name === v.name
                              ? "bg-purple-600 text-white border-purple-600 shadow-md transform scale-105" 
                              : "hover:bg-white bg-gray-100 text-gray-700 hover:border-blue-300"}`}>
                          
                          <span>{v.thicknessCode || v.name}</span>
                          {/* Alt parça yoksa fiyatı göster */}
                          {!v.hasSubParts && <span className="text-xs font-bold mt-1 opacity-90">₺{v.variantPrice}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PARÇA FİYATLARI (Sadece Varyant Seçiliyse ve Alt Parça Varsa) */}
              {selectedVariant && selectedVariant.hasSubParts && selectedVariant.partPrices && (
                <div className="animate-fade-in">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                    Uygulanacak Parça ({selectedVariant.thicknessCode || selectedVariant.name}):
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedVariant.partPrices.map((part, pIdx) => {
                      // Parça daha önce seçildi mi kontrolü
                      const isSelected = formData.selectedServices.some(item => 
                          item.category === activeCategory.name &&
                          item.product === activeProduct.name &&
                          item.spec === (selectedVariant.thicknessCode || selectedVariant.name) && 
                          item.part === part.partName
                      );

                      return (
                        <button key={pIdx} 
                          disabled={isSelected}
                          onClick={() => addToCart(
                              activeCategory.name, 
                              activeProduct.name, 
                              selectedVariant.thicknessCode || selectedVariant.name, 
                              part.partName, 
                              part.price
                          )}
                          className={`flex justify-between items-center p-3 border rounded-lg transition-colors group
                            ${isSelected 
                                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" 
                                : "hover:bg-green-50 hover:border-green-300 cursor-pointer bg-white"}`}>
                          <span className={`font-medium ${isSelected ? "" : "group-hover:text-green-800"}`}>
                              {part.partName} {isSelected && <Check size={14} className="inline ml-1"/>}
                          </span>
                          <span className={`font-bold ${isSelected ? "" : "text-green-600"}`}>
                              +₺{part.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : <div className="text-gray-400 text-center mt-20 flex flex-col items-center"><ChevronLeft className="mb-2"/> Lütfen soldan bir kategori seçin</div>}
        </div>

        {/* SAĞ: SEÇİLENLER ÖZETİ */}
        <div className="w-1/4 border-l pl-2 flex flex-col bg-gray-50/50 rounded-r-lg">
          <h4 className="font-bold mb-2 p-2 border-b">Seçilen Hizmetler</h4>
          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {formData.selectedServices.map((item, i) => (
              <div key={i} className="bg-white p-3 rounded shadow-sm border text-sm relative group animate-fade-in">
                <button onClick={() => removeServiceItem(i)} className="absolute top-1 right-1 text-gray-400 hover:text-red-500"><X size={14}/></button>
                <div className="font-semibold text-blue-800">{item.category}</div>
                <div className="text-gray-600">{item.product}</div>
                {item.spec && <div className="text-xs text-purple-600 font-medium bg-purple-50 inline-block px-1 rounded mt-1">{item.spec}</div>}
                <div className="flex justify-between mt-2 pt-2 border-t border-dashed">
                  <span>{item.part}</span>
                  <span className="font-bold">₺{item.price}</span>
                </div>
              </div>
            ))}
            {formData.selectedServices.length === 0 && <div className="text-gray-400 text-center text-sm mt-10">Henüz hizmet eklenmedi.</div>}
          </div>
          <div className="border-t p-3 bg-white mt-2 rounded-lg shadow-sm">
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>Toplam:</span>
                <span>₺{formData.selectedServices.reduce((a,b)=>a+b.price, 0)}</span>
              </div>
          </div>
        </div>
      </div>
    );
  };

  // ADIM 3: RANDEVU & ÖDEME & PERSONEL
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i <= 19; i++) {
        slots.push(`${i < 10 ? '0'+i : i}:00`);
        slots.push(`${i < 10 ? '0'+i : i}:30`);
    }
    return slots;
  };

  const calculateTotal = () => formData.selectedServices.reduce((sum, item) => sum + item.price, 0);

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        
        {/* SOL: RANDEVU & PERSONEL */}
        <div className="space-y-4">
          {/* Randevu */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Calendar/> Randevu</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tarih Seçimi</label>
              <input type="date" className="w-full border p-3 rounded-lg mb-4" 
                value={formData.appointmentDate} onChange={e => handleChange("appointmentDate", e.target.value)} />

              <label className="block text-sm font-medium text-gray-700 mb-2">Saat Seçimi</label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                  {generateTimeSlots().map(time => (
                      <button key={time}
                          onClick={() => handleChange("appointmentTime", time)}
                          className={`py-2 px-1 rounded text-sm text-center border transition-all ${formData.appointmentTime === time ? "bg-blue-600 text-white border-blue-600 shadow" : "hover:bg-gray-50 border-gray-200"}`}>
                          {time}
                      </button>
                  ))}
              </div>
          </div>

          {/* Personel Seçimi (YENİ) */}
          <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><User/> Personel Atama</h3>
              <select 
                  className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.personnelId}
                  onChange={(e) => handleChange("personnelId", e.target.value)}
              >
                  <option value="0">Personel Seçiniz (Opsiyonel)</option>
                  {staffList.map(st => (
                      <option key={st.id} value={st.id}>{st.fullName || st.name || st.firstName}</option>
                  ))}
              </select>
          </div>
        </div>

        {/* SAĞ: ÖDEME */}
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CreditCard/> Ödeme</h3>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Liste Fiyatı:</span>
                  <span className="font-bold text-lg text-gray-500 line-through">₺{calculateTotal()}</span>
              </div>
              <div className="flex justify-between items-center bg-white p-3 rounded border ring-1 ring-blue-100">
                  <span className="text-blue-800 font-bold">Nihai Tutar:</span>
                  <input type="number" 
                      className="w-32 text-right font-bold text-blue-800 outline-none text-xl"
                      placeholder={calculateTotal()}
                      value={formData.finalPrice !== null ? formData.finalPrice : calculateTotal()}
                      onChange={e => handleChange("finalPrice", e.target.value)}
                  />
              </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Ödeme Yöntemi</h4>
            <div className="grid grid-cols-3 gap-3">
                {["Nakit", "Kredi Kartı", "Havale"].map(m => (
                <label key={m} className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${formData.paymentMethod === m ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" : ""}`}>
                    <input type="radio" name="payment" className="hidden" checked={formData.paymentMethod === m} onChange={() => handleChange("paymentMethod", m)} />
                    <span className="font-medium">{m}</span>
                </label>
                ))}
            </div>
            
            <label className="flex items-center gap-3 mt-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer shadow-sm">
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={formData.isPaid} onChange={e => handleChange("isPaid", e.target.checked)} />
              <span className="font-medium text-gray-800">Ödeme Tahsil Edildi</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl h-[90vh] flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-2xl font-bold text-gray-800">Yeni İş Emri Oluştur</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-full transition-colors"><X className="text-gray-500 hover:text-red-500" /></button>
        </div>

        {/* STEPPER */}
        <div className="flex justify-center py-4 bg-white border-b shadow-sm z-10">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex items-center ${i < 3 ? "after:content-[''] after:w-24 after:h-1 after:mx-4 after:rounded after:bg-gray-200" : ""}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all shadow-md ${step === i ? "bg-blue-600 text-white scale-110" : step > i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > i ? <Check size={20}/> : i}
              </div>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/30">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-white flex justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-6 py-3 border rounded-lg hover:bg-gray-100 flex items-center gap-2 text-gray-700 font-medium">
            <ChevronLeft size={18}/> Geri
          </button>
          
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && !formData.plateNumber} 
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all">
              İleri <ChevronRight size={18}/>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-10 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg shadow-green-200 flex items-center gap-2 transition-all">
              {loading ? <Loader2 className="animate-spin"/> : <Check size={20}/>} {loading ? "Kaydediliyor..." : "Siparişi Tamamla"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewOrderWizard;
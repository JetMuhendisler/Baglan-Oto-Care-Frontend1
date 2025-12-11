import React, { useState } from "react";
import { Check, ChevronRight, ChevronLeft, Car, Calendar, CreditCard, X } from "lucide-react";
// catalog.js dosyanız yoksa bu importu kaldırıp aşağıda const SERVICE_CATALOG = [...] şeklinde veriyi bu dosyaya da ekleyebilirsiniz.
// Şimdilik veriyi buraya gömüyorum ki hata almayın:
import { orderService } from "../api";

const SERVICE_CATALOG = [
  {
    id: "ppf",
    name: "PPF Kaplama",
    category: "PPF",
    products: [
      {
        name: "OLEX Platinum Series",
        microns: [190, 210, 250],
        hasPartBasedPricing: true,
        partPrices: [
          { partName: "Kaput", price: 3000 },
          { partName: "Çamurluk", price: 1500 },
          { partName: "Tampon", price: 1500 },
          { partName: "Tüm Araç", price: 16000 }
        ]
      },
      {
        name: "OLEX Carat Series",
        microns: [150, 180],
        hasPartBasedPricing: true,
        partPrices: [
          { partName: "Kaput", price: 2500 },
          { partName: "Tüm Araç", price: 14000 }
        ]
      }
    ]
  },
  {
    id: "ceramic",
    name: "Seramik Kaplama",
    category: "Seramik",
    products: [
      { name: "Premium Seramik (3 Yıl)", price: 8000 },
      { name: "Standard Seramik (2 Yıl)", price: 5000 }
    ]
  },
  {
    id: "window",
    name: "Cam Filmi",
    category: "Cam Filmi",
    products: [
      {
        name: "OLEX Rayblock",
        hasPartBasedPricing: true,
        partPrices: [
          { partName: "Ön Cam", price: 2000 },
          { partName: "Yan Camlar", price: 3000 },
          { partName: "Sunroof", price: 1000 }
        ]
      }
    ]
  },
  {
    id: "wash",
    name: "Yıkama & Bakım",
    category: "Yıkama",
    products: [
        { name: "Standart Yıkama", price: 400 },
        { name: "Detaylı Temizlik", price: 1500 },
        { name: "Motor Yıkama", price: 600 }
    ]
  }
];

const NewOrderWizard = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    customerName: "", customerPhone: "", customerEmail: "",
    plateNumber: "", brand: "", model: "", color: "", year: "",
    selectedServices: [], 
    appointmentDate: "", appointmentTime: "09:00",
    paymentMethod: "Nakit", isPaid: false
  });

  // --- HANDLERS ---
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlateBlur = async () => {
    if (formData.plateNumber.length > 2) {
      try {
        const res = await orderService.search(formData.plateNumber);
        if (res && res.Found) { // Backend DTO yapısına göre Found büyük harf olabilir
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

  const addServiceItem = (category, product, spec, partName, price) => {
    const newItem = {
      category,
      product: product.name || product,
      spec: spec || "",
      part: partName || "Tam Paket",
      price: price
    };
    setFormData(prev => ({
      ...prev,
      selectedServices: [...prev.selectedServices, newItem]
    }));
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
        personnelId: 0,
        date: new Date(`${formData.appointmentDate}T${formData.appointmentTime}`).toISOString(),
        totalPrice: formData.selectedServices.reduce((sum, item) => sum + item.price, 0),
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

  // ADIM 2: HİZMETLER
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeProduct, setActiveProduct] = useState(null);
  const [selectedMicron, setSelectedMicron] = useState(null);

  const renderStep2 = () => (
    <div className="h-[500px] flex gap-4">
      <div className="w-1/4 border-r pr-2 space-y-2">
        {SERVICE_CATALOG.map(cat => (
          <button key={cat.id} 
            onClick={() => { setActiveCategory(cat); setActiveProduct(null); setSelectedMicron(null); }}
            className={`w-full text-left p-3 rounded-lg font-medium ${activeCategory?.id === cat.id ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {activeCategory ? (
          <div>
            <h4 className="font-bold mb-3">{activeCategory.name} Ürünleri</h4>
            <div className="grid grid-cols-1 gap-3 mb-4">
              {activeCategory.products.map((prod, idx) => (
                <div key={idx} className={`border p-3 rounded-lg cursor-pointer ${activeProduct === prod ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}
                  onClick={() => { setActiveProduct(prod); setSelectedMicron(null); }}>
                  <div className="font-semibold">{prod.name}</div>
                  {!prod.hasPartBasedPricing && <div className="text-sm text-green-600">₺{prod.price}</div>}
                </div>
              ))}
            </div>

            {activeProduct?.microns && (
              <div className="mb-4">
                <label className="text-sm font-semibold text-gray-500">Kalınlık:</label>
                <div className="flex gap-2 mt-2">
                  {activeProduct.microns.map(m => (
                    <button key={m} onClick={() => setSelectedMicron(m)}
                      className={`px-3 py-1 border rounded ${selectedMicron === m ? "bg-purple-600 text-white" : "hover:bg-gray-50"}`}>
                      {m} Mikron
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeProduct && (activeProduct.hasPartBasedPricing ? (
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-2 block">Parça Seçimi:</label>
                <div className="grid grid-cols-2 gap-2">
                  {activeProduct.partPrices.map((part, pIdx) => (
                    <button key={pIdx} 
                      onClick={() => addServiceItem(activeCategory.name, activeProduct, selectedMicron ? `${selectedMicron}μ` : null, part.partName, part.price)}
                      className="flex justify-between items-center p-2 border rounded hover:bg-green-50 text-sm">
                      <span>{part.partName}</span>
                      <span className="font-bold text-green-700">+₺{part.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button 
                onClick={() => addServiceItem(activeCategory.name, activeProduct, null, "Tam Paket", activeProduct.price)}
                className="w-full bg-blue-600 text-white py-2 rounded mt-4">
                Ekle ₺{activeProduct.price}
              </button>
            ))}
          </div>
        ) : <div className="text-gray-400 text-center mt-20">Lütfen bir kategori seçin</div>}
      </div>

      <div className="w-1/4 border-l pl-2 flex flex-col">
        <h4 className="font-bold mb-2">Seçilenler</h4>
        <div className="flex-1 overflow-y-auto space-y-2">
          {formData.selectedServices.map((item, i) => (
            <div key={i} className="bg-gray-50 p-2 rounded text-sm relative group">
              <button onClick={() => removeServiceItem(i)} className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100"><X size={14}/></button>
              <div className="font-semibold">{item.category}</div>
              <div className="text-gray-600">{item.product} {item.spec && `(${item.spec})`}</div>
              <div className="flex justify-between mt-1">
                <span>{item.part}</span>
                <span className="font-bold">₺{item.price}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 mt-2 text-lg font-bold flex justify-between">
            <span>Toplam:</span>
            <span>₺{formData.selectedServices.reduce((a,b)=>a+b.price, 0)}</span>
        </div>
      </div>
    </div>
  );

  // ADIM 3: RANDEVU & ÖDEME
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Calendar/> Randevu</h3>
          <input type="date" className="w-full border p-3 rounded-lg mb-2" 
            value={formData.appointmentDate} onChange={e => handleChange("appointmentDate", e.target.value)} />
          <input type="time" className="w-full border p-3 rounded-lg" 
            value={formData.appointmentTime} onChange={e => handleChange("appointmentTime", e.target.value)} />
        </div>
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><CreditCard/> Ödeme</h3>
          <div className="space-y-2">
            {["Nakit", "Kredi Kartı", "Havale"].map(m => (
              <label key={m} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${formData.paymentMethod === m ? "bg-blue-50 border-blue-500" : ""}`}>
                <input type="radio" name="payment" checked={formData.paymentMethod === m} onChange={() => handleChange("paymentMethod", m)} />
                {m}
              </label>
            ))}
            <label className="flex items-center gap-2 mt-4">
              <input type="checkbox" className="w-5 h-5" checked={formData.isPaid} onChange={e => handleChange("isPaid", e.target.checked)} />
              <span className="font-medium">Ödeme şimdi alındı mı?</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800">Yeni İş Emri Oluştur</h2>
          <button onClick={onClose}><X className="text-gray-500 hover:text-red-500" /></button>
        </div>
        <div className="flex justify-center py-4 bg-white border-b">
          {[1, 2, 3].map(i => (
            <div key={i} className={`flex items-center ${i < 3 ? "after:content-[''] after:w-16 after:h-1 after:mx-2 after:bg-gray-200" : ""}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step === i ? "bg-blue-600 text-white" : step > i ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > i ? <Check size={20}/> : i}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 p-6 overflow-y-auto">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
        <div className="p-6 border-t bg-gray-50 flex justify-between rounded-b-2xl">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()} className="px-6 py-3 border rounded-lg hover:bg-gray-100 flex items-center gap-2">
            <ChevronLeft size={18}/> Geri
          </button>
          
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} disabled={step === 1 && !formData.plateNumber} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
              İleri <ChevronRight size={18}/>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg flex items-center gap-2">
              {loading ? "Kaydediliyor..." : "Siparişi Tamamla"} <Check size={18}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewOrderWizard;
import React, { useState } from "react";
import { Car, X, Check, ChevronLeft, ChevronRight, DollarSign, Droplets } from "lucide-react";
// Veri dosyasından yeni eklediğimiz windowGlassParts ve washServices'i de çekiyoruz
import { washServices, windowGlassParts } from "../data";

const NewCustomerFlow = ({ onClose, onOrderCreate, products, parts }) => {
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Form datasında address'i kaldırdık, wash ve windowFilm yapısını güncelledik
  const [formData, setFormData] = useState({
    customer: { name: "", phone: "", email: "" }, // Adres kalktı
    vehicle: { brand: "", model: "", year: "", plate: "", color: "" },
    services: {
      ppf: { selected: false, parts: [], price: 0 },
      ceramic: { selected: false, parts: [], price: 0 },
      windowFilm: { selected: false, parts: [], price: 0 },
      wash: { selected: false, items: [], price: 0 }
    },
    appointment: { date: "", time: "" },
    payment: { method: "", amount: 0, isPaid: false },
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const calculateTotal = () => {
    let total = 0;
    // PPF
    if (formData.services.ppf?.selected) total += formData.services.ppf.price || 0;
    // Seramik
    if (formData.services.ceramic?.selected) total += formData.services.ceramic.price || 0;
    // Cam Filmi
    if (formData.services.windowFilm?.selected) total += formData.services.windowFilm.price || 0;
    // Yıkama
    if (formData.services.wash?.selected) total += formData.services.wash.price || 0;
    
    return total;
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((num) => (
        <React.Fragment key={num}>
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${
              step >= num ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
            }`}
          >
            {step > num ? <Check size={20} /> : num}
          </div>
          {num < 4 && (
            <div className={`w-16 h-1 mx-2 ${step > num ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Yeni Müşteri Kaydı</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <StepIndicator />
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Müşteri Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Ad Soyad *"
                    className="border rounded-lg px-4 py-3"
                    value={formData.customer.name}
                    onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })}
                  />
                  <input
                    type="tel"
                    placeholder="Telefon *"
                    className="border rounded-lg px-4 py-3"
                    value={formData.customer.phone}
                    onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, phone: e.target.value } })}
                  />
                  <input
                    type="email"
                    placeholder="E-posta"
                    className="border rounded-lg px-4 py-3 md:col-span-2"
                    value={formData.customer.email}
                    onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, email: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Araç Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Marka (BMW, Mercedes, vb.) *"
                    className="border rounded-lg px-4 py-3"
                    value={formData.vehicle.brand}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, brand: e.target.value } })}
                  />
                  <input
                    type="text"
                    placeholder="Model (320i, C200, vb.) *"
                    className="border rounded-lg px-4 py-3"
                    value={formData.vehicle.model}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, model: e.target.value } })}
                  />
                  <input
                    type="text"
                    placeholder="Plaka *"
                    className="border rounded-lg px-4 py-3"
                    value={formData.vehicle.plate}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, plate: e.target.value } })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        placeholder="Yıl"
                        className="border rounded-lg px-4 py-3"
                        value={formData.vehicle.year}
                        onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, year: e.target.value } })}
                    />
                    <input
                        type="text"
                        placeholder="Renk"
                        className="border rounded-lg px-4 py-3"
                        value={formData.vehicle.color}
                        onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, color: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Hizmet Seçimi</h3>

              {/* ARABA YIKAMA */}
              <div className="border-2 border-cyan-200 rounded-lg p-6 bg-cyan-50">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-cyan-700">
                    <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center">
                        <Droplets size={18} className="text-white" />
                    </div>
                    Yıkama & Bakım İşlemleri
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {washServices.map(service => {
                          const isSelected = formData.services.wash?.items?.includes(service.id);
                          return (
                              <label key={service.id} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "bg-cyan-100 border-cyan-400" : "bg-white hover:bg-gray-50"}`}>
                                  <div className="flex items-center gap-2">
                                      <input type="checkbox" className="w-4 h-4 text-cyan-600" checked={isSelected} 
                                      onChange={(e) => {
                                          const currentItems = formData.services.wash?.items || [];
                                          const newItems = e.target.checked ? [...currentItems, service.id] : currentItems.filter(id => id !== service.id);
                                          
                                          const totalPrice = newItems.reduce((sum, id) => {
                                              const s = washServices.find(ws => ws.id === id);
                                              return sum + (s ? s.price : 0);
                                          }, 0);

                                          setFormData({
                                              ...formData,
                                              services: {
                                                  ...formData.services,
                                                  wash: {
                                                      selected: newItems.length > 0,
                                                      items: newItems,
                                                      price: totalPrice,
                                                      name: "Yıkama & Bakım"
                                                  }
                                              }
                                          });
                                      }}/>
                                      <span className="text-sm font-medium">{service.name}</span>
                                  </div>
                                  <span className="text-sm font-bold text-cyan-700">₺{service.price}</span>
                              </label>
                          )
                      })}
                  </div>
              </div>

              {/* PPF Kaplama */}
              <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-purple-700">
                   <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
                    <Car size={18} className="text-white" />
                  </div>
                  OLEX PPF (Paint Protection Film)
                </h4>
                <div className="space-y-4">
                   <select
                    className="w-full border rounded-lg px-4 py-3 bg-white"
                    onChange={(e) => {
                      const series = products.ppf.series.find(s => s.id === e.target.value);
                      if (series) {
                        setFormData({
                          ...formData,
                          services: {
                            ...formData.services,
                            ppf: {
                              selected: true,
                              series: series,
                              micron: null,
                              parts: formData.services.ppf?.parts || [],
                            },
                          },
                        });
                      }
                    }}
                   >
                     <option value="">Seri Seçiniz</option>
                     {products.ppf.series.map((series) => (
                       <option key={series.id} value={series.id}>
                         {series.name} - ₺{series.basePrice.toLocaleString()} - {series.description}
                       </option>
                     ))}
                   </select>

                   {formData.services.ppf?.series && (
                      <div>
                         <label className="block text-sm font-medium mb-2">Kalınlık (Micron)</label>
                         <div className="grid grid-cols-5 gap-2">
                            {formData.services.ppf.series.microns.map((micron) => (
                               <button
                                 key={micron}
                                 onClick={() => setFormData({...formData, services: {...formData.services, ppf: {...formData.services.ppf, micron}}})}
                                 className={`p-3 rounded-lg border-2 font-semibold ${formData.services.ppf.micron === micron ? "border-purple-600 bg-purple-100 text-purple-700" : "border-gray-200 hover:border-gray-300"}`}
                               >
                                 {micron}μ
                               </button>
                            ))}
                         </div>
                      </div>
                   )}
                   
                   {formData.services.ppf?.micron && (
                    <div>
                        <label className="block text-sm font-medium mb-3">Kaplanacak Parçalar</label>
                        <div className="max-h-80 overflow-y-auto bg-white p-3 rounded-lg border">
                           {/* TAMAMI SEÇENEĞİ */}
                           <label className="flex items-center justify-between p-3 border-b-2 border-purple-100 mb-2 cursor-pointer bg-purple-50 rounded">
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" className="w-5 h-5 text-purple-600"
                                        checked={formData.services.ppf?.parts?.length === parts.length}
                                        onChange={(e) => {
                                            const allPartIds = parts.map(p => p.id);
                                            const newParts = e.target.checked ? allPartIds : [];
                                            
                                            // Toplam Fiyat Hesabı
                                            const totalPrice = newParts.reduce((sum, partId) => {
                                                const p = parts.find(cp => cp.id === partId);
                                                return sum + (p ? p.price : 0);
                                            }, 0);

                                            setFormData({
                                                ...formData,
                                                services: {
                                                    ...formData.services,
                                                    ppf: {
                                                        ...formData.services.ppf,
                                                        parts: newParts,
                                                        price: totalPrice,
                                                        name: `PPF ${formData.services.ppf.series.name} - ${newParts.length === parts.length ? "TAM ARAÇ" : newParts.length + " Parça"}`
                                                    }
                                                }
                                            })
                                        }}
                                    />
                                    <span className="font-bold text-purple-800">TÜM ARAÇ (Komple Kaplama)</span>
                                </div>
                           </label>

                           <div className="grid grid-cols-2 gap-2">
                               {parts.map((part) => {
                                 const isSelected = formData.services.ppf?.parts?.includes(part.id);
                                 return (
                                   <label key={part.id} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "bg-purple-100 border-purple-400 shadow-sm" : "hover:bg-gray-50"}`}>
                                     <div className="flex items-center gap-2">
                                       <input
                                         type="checkbox"
                                         className="w-4 h-4 text-purple-600"
                                         checked={isSelected}
                                         onChange={(e) => {
                                           const currentParts = formData.services.ppf?.parts || [];
                                           const newParts = e.target.checked ? [...currentParts, part.id] : currentParts.filter(p => p !== part.id);
                                           
                                           const totalPrice = newParts.reduce((sum, partId) => {
                                              const p = parts.find(cp => cp.id === partId);
                                              return sum + (p ? p.price : 0);
                                           }, 0);
                                           
                                           setFormData({
                                              ...formData,
                                              services: {
                                                 ...formData.services,
                                                 ppf: {
                                                    ...formData.services.ppf,
                                                    parts: newParts,
                                                    price: totalPrice,
                                                    name: `PPF ${formData.services.ppf.series.name} - ${newParts.length === parts.length ? "TAM ARAÇ" : newParts.length + " Parça"}`
                                                 }
                                              }
                                           });
                                         }}
                                       />
                                       <span className="text-sm font-medium">{part.name}</span>
                                     </div>
                                     <span className="text-xs font-bold text-purple-600">₺{part.price}</span>
                                   </label>
                                 );
                               })}
                           </div>
                        </div>
                        {formData.services.ppf?.parts?.length > 0 && (
                            <div className="mt-3 p-4 bg-purple-600 text-white rounded-lg">
                               <div className="flex justify-between items-center">
                                  <span className="font-medium">PPF Toplam ({formData.services.ppf.parts.length} Parça):</span>
                                  <span className="text-2xl font-bold">₺{formData.services.ppf.price?.toLocaleString()}</span>
                               </div>
                            </div>
                        )}
                    </div>
                   )}
                </div>
              </div>

              {/* Seramik Kaplama */}
              <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
                    <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                        <Car size={18} className="text-white" />
                    </div>
                    Seramik Kaplama
                </h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Seramik Türü</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {products.ceramic.products.map(product => (
                                <button key={product.id} onClick={() => setFormData({...formData, services: {...formData.services, ceramic: {selected: true, product: product, parts: formData.services.ceramic?.parts || []}}})}
                                className={`p-4 rounded-lg border-2 text-left ${formData.services.ceramic?.product?.id === product.id ? "border-green-600 bg-green-100" : "border-gray-200 hover:border-green-300 bg-white"}`}>
                                    <p className="font-bold text-lg">{product.name}</p>
                                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                    <p className="text-green-600 font-bold">₺{product.price.toLocaleString()}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    {formData.services.ceramic?.product && (
                        <div>
                             <label className="block text-sm font-medium mb-3">Kaplanacak Parçalar</label>
                             <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto bg-white p-3 rounded-lg border">
                                {parts.map(part => {
                                    const isSelected = formData.services.ceramic?.parts?.includes(part.id);
                                    return (
                                        <label key={part.id} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "bg-green-100 border-green-400 shadow-sm" : "hover:bg-gray-50"}`}>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="w-4 h-4 text-green-600" checked={isSelected}
                                                onChange={(e) => {
                                                    const currentParts = formData.services.ceramic?.parts || [];
                                                    const newParts = e.target.checked ? [...currentParts, part.id] : currentParts.filter(p => p !== part.id);
                                                    const partPrice = newParts.reduce((sum, partId) => {
                                                        const p = parts.find(cp => cp.id === partId);
                                                        return sum + (p ? p.price * 0.5 : 0);
                                                    }, 0);
                                                    setFormData({
                                                        ...formData,
                                                        services: {
                                                            ...formData.services,
                                                            ceramic: {
                                                                ...formData.services.ceramic,
                                                                parts: newParts,
                                                                price: partPrice,
                                                                name: `Seramik Kaplama ${formData.services.ceramic.product.name} - ${newParts.length} Parça`
                                                            }
                                                        }
                                                    });
                                                }} />
                                                <span className="text-sm font-medium">{part.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-green-600">₺{Math.round(part.price * 0.5)}</span>
                                        </label>
                                    )
                                })}
                             </div>
                             {formData.services.ceramic?.parts?.length > 0 && (
                                <div className="mt-3 p-4 bg-green-600 text-white rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Seramik Toplam:</span>
                                        <span className="text-2xl font-bold">₺{formData.services.ceramic.price?.toLocaleString()}</span>
                                    </div>
                                </div>
                             )}
                        </div>
                    )}
                </div>
              </div>

              {/* Cam Filmi - GÜNCELLENDİ: ARTIK PARÇA SEÇİMLİ */}
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                 <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-700">
                     <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                         <Car size={18} className="text-white" />
                     </div>
                     OLEX Cam Filmleri
                 </h4>
                 
                 <div className="space-y-4">
                     {/* 1. ADIM: Film Türü Seçimi */}
                     <div>
                        <label className="block text-sm font-medium mb-2">Film Serisi</label>
                        <select 
                            className="w-full border rounded-lg px-4 py-3 bg-white"
                            onChange={(e) => {
                                const product = products.windowFilm.products.find(p => p.id === e.target.value);
                                if(product) {
                                    setFormData({
                                        ...formData,
                                        services: {
                                            ...formData.services,
                                            windowFilm: {
                                                selected: true,
                                                product: product,
                                                parts: formData.services.windowFilm?.parts || [],
                                                price: formData.services.windowFilm?.price || 0
                                            }
                                        }
                                    })
                                }
                            }}
                        >
                            <option value="">Film Seçiniz</option>
                            {products.windowFilm.products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - {p.description}</option>
                            ))}
                        </select>
                     </div>

                     {/* 2. ADIM: Cam Parçaları Seçimi */}
                     {formData.services.windowFilm?.product && (
                        <div>
                             <label className="block text-sm font-medium mb-3">Uygulanacak Camlar</label>
                             <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border">
                                {windowGlassParts.map(part => {
                                    const isSelected = formData.services.windowFilm?.parts?.includes(part.id);
                                    return (
                                        <label key={part.id} className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${isSelected ? "bg-blue-100 border-blue-400 shadow-sm" : "hover:bg-gray-50"}`}>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" className="w-4 h-4 text-blue-600" checked={isSelected}
                                                onChange={(e) => {
                                                    const currentParts = formData.services.windowFilm?.parts || [];
                                                    const newParts = e.target.checked ? [...currentParts, part.id] : currentParts.filter(p => p !== part.id);
                                                    
                                                    // Fiyat Hesabı (Baz fiyatın üzerine parça fiyatı ekleniyor)
                                                    // Basitlik için: Seçilen ürünün baz fiyatı + cam parça fiyatı
                                                    // Veya: Cam parça fiyatı x Ürün Kalite Çarpanı (Burada direkt topluyoruz)
                                                    const partsPrice = newParts.reduce((sum, partId) => {
                                                        const p = windowGlassParts.find(wp => wp.id === partId);
                                                        return sum + (p ? p.price : 0);
                                                    }, 0);

                                                    setFormData({
                                                        ...formData,
                                                        services: {
                                                            ...formData.services,
                                                            windowFilm: {
                                                                ...formData.services.windowFilm,
                                                                parts: newParts,
                                                                price: partsPrice, // Baz fiyat eklemek isterseniz buraya + product.price ekleyin
                                                                name: `Cam Filmi ${formData.services.windowFilm.product.name} - ${newParts.length} Cam`
                                                            }
                                                        }
                                                    });
                                                }} />
                                                <span className="text-sm font-medium">{part.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-blue-600">₺{part.price}</span>
                                        </label>
                                    )
                                })}
                             </div>
                             {formData.services.windowFilm?.parts?.length > 0 && (
                                <div className="mt-3 p-4 bg-blue-600 text-white rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">Cam Filmi Toplam:</span>
                                        <span className="text-2xl font-bold">₺{formData.services.windowFilm.price?.toLocaleString()}</span>
                                    </div>
                                </div>
                             )}
                        </div>
                     )}
                 </div>
              </div>

              {/* TOPLAM TUTAR */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold">Toplam Tutar:</span>
                  <span className="text-4xl font-bold">₺{calculateTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Randevu Seçimi</h3>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                   <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                   <h4 className="font-semibold text-lg">{currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}</h4>
                   <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                   {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(day => <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">{day}</div>)}
                   {getDaysInMonth(currentMonth).map((date, idx) => {
                       if (!date) return <div key={idx} className="p-3" />;
                       const isToday = date.toDateString() === new Date().toDateString();
                       const isPast = date < new Date() && !isToday;
                       const isSelected = formData.appointment.date === date.toISOString().split("T")[0];
                       return (
                           <button key={idx} disabled={isPast}
                           onClick={() => setFormData({...formData, appointment: {...formData.appointment, date: date.toISOString().split("T")[0]}})}
                           className={`p-3 rounded-lg border text-center transition-colors ${isPast ? "bg-gray-100 text-gray-400 cursor-not-allowed" : isSelected ? "bg-blue-600 text-white border-blue-600" : isToday ? "border-blue-600 text-blue-600 hover:bg-blue-50" : "hover:bg-gray-50"}`}>
                               <div className="text-sm font-medium">{date.getDate()}</div>
                           </button>
                       )
                   })}
                </div>
              </div>
              {formData.appointment.date && (
                <div>
                   <label className="block text-sm font-medium mb-2">Saat Seçimi</label>
                   <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                          <button key={time} onClick={() => setFormData({...formData, appointment: {...formData.appointment, time}})}
                          className={`p-3 rounded-lg border font-medium ${formData.appointment.time === time ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}>
                              {time}
                          </button>
                      ))}
                   </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
               <h3 className="text-xl font-semibold mb-4">Ödeme Bilgileri</h3>
               <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                   <div className="flex justify-between items-center mb-4">
                       <span className="text-lg">Toplam Tutar</span>
                       <span className="text-3xl font-bold">₺{calculateTotal().toLocaleString()}</span>
                   </div>
                   <div className="text-sm opacity-90">Müşteri: {formData.customer.name}</div>
                   <div className="text-sm opacity-90">Araç: {formData.vehicle.brand} {formData.vehicle.model} - {formData.vehicle.plate}</div>
                   <div className="text-sm opacity-90">Randevu: {formData.appointment.date} {formData.appointment.time}</div>
                   <div className="mt-4 pt-4 border-t border-blue-400 text-sm">
                       <p className="font-semibold mb-1">Seçilen Hizmetler:</p>
                       <ul className="list-disc list-inside opacity-90">
                           {formData.services.wash?.selected && <li>{formData.services.wash.name}</li>}
                           {formData.services.ppf?.selected && <li>{formData.services.ppf.name}</li>}
                           {formData.services.ceramic?.selected && <li>{formData.services.ceramic.name}</li>}
                           {formData.services.windowFilm?.selected && <li>{formData.services.windowFilm.name}</li>}
                       </ul>
                   </div>
               </div>
               <div>
                   <label className="block text-sm font-medium mb-2">Ödeme Yöntemi</label>
                   <div className="grid grid-cols-2 gap-4">
                      {["Nakit", "Kredi Kartı", "Havale/EFT", "Daha Sonra"].map(method => (
                          <button key={method} onClick={() => setFormData({...formData, payment: {...formData.payment, method, isPaid: method !== "Daha Sonra", amount: calculateTotal()}})}
                          className={`p-4 rounded-lg border-2 text-center ${formData.payment.method === method ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                              <DollarSign className="mx-auto mb-2" size={24} />
                              <span className="font-medium">{method}</span>
                          </button>
                      ))}
                   </div>
               </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-6 border-t mt-6">
            <button
              onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ChevronLeft size={20} />
              {step === 1 ? "İptal" : "Geri"}
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={
                  (step === 1 && (!formData.customer.name || !formData.customer.phone || !formData.vehicle.plate)) ||
                  (step === 2 && calculateTotal() === 0) ||
                  (step === 3 && (!formData.appointment.date || !formData.appointment.time))
                }
              >
                İleri
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={() => {
                   const serviceNames = [];
                   if (formData.services.wash?.selected) serviceNames.push(formData.services.wash.name);
                   if (formData.services.ppf?.selected) serviceNames.push(formData.services.ppf.name);
                   if (formData.services.ceramic?.selected) serviceNames.push(formData.services.ceramic.name);
                   if (formData.services.windowFilm?.selected) serviceNames.push(formData.services.windowFilm.name);

                   const newOrder = {
                       customer: formData.customer.name,
                       vehicle: `${formData.vehicle.brand} ${formData.vehicle.model}`,
                       plate: formData.vehicle.plate,
                       status: "pending",
                       date: formData.appointment.date,
                       services: serviceNames,
                       assignedStaff: [],
                       totalPrice: calculateTotal(),
                       payment: formData.payment.isPaid ? "paid" : "pending",
                       addedToAccounting: false
                   };
                   onOrderCreate(newOrder);
                }}
                disabled={!formData.payment.method}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
              >
                <Check size={20} />
                Kaydı Tamamla
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerFlow;
import React, { useState } from "react";
import { Car, X, Check, ChevronLeft, ChevronRight, DollarSign, Droplets, Loader2 } from "lucide-react";
import { washServices, windowGlassParts } from "../data";
import { customerService, vehicleService, transactionService } from "../api";

const NewCustomerFlow = ({ onClose, onOrderCreate, products, parts }) => {
  const [step, setStep] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Form datası
  const [formData, setFormData] = useState({
    customer: { name: "", phone: "", email: "" }, 
    vehicle: { brand: "", model: "", year: "", plate: "", color: "" },
    services: {
      ppf: { selected: false, parts: [], price: 0, name: "" },
      ceramic: { selected: false, parts: [], price: 0, name: "" },
      windowFilm: { selected: false, parts: [], price: 0, name: "" },
      wash: { selected: false, items: [], price: 0, name: "" }
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
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  const calculateTotal = () => {
    let total = 0;
    if (formData.services.ppf?.selected) total += formData.services.ppf.price || 0;
    if (formData.services.ceramic?.selected) total += formData.services.ceramic.price || 0;
    if (formData.services.windowFilm?.selected) total += formData.services.windowFilm.price || 0;
    if (formData.services.wash?.selected) total += formData.services.wash.price || 0;
    return total;
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // 1. İsim Soyisim Ayrıştırma
      const nameParts = formData.customer.name.trim().split(" ");
      const lastName = nameParts.length > 1 ? nameParts.pop() : "";
      const firstName = nameParts.join(" ");

      // 2. Müşteri Oluşturma
      const customerPayload = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: formData.customer.phone,
        email: formData.customer.email || null
      };
      
      const createdCustomer = await customerService.create(customerPayload);
      // Backend yapısına göre ID alımı (createdCustomer.data.id veya direkt createdCustomer.id olabilir)
      // api.js'deki interceptor ayarına göre direkt data gelecektir.
      const customerId = createdCustomer.id || createdCustomer;

      // 3. Araç Oluşturma
      const vehiclePayload = {
        plateNumber: formData.vehicle.plate,
        brand: formData.vehicle.brand,
        model: formData.vehicle.model,
        customerId: customerId
      };

      const createdVehicle = await vehicleService.create(vehiclePayload);
      const vehicleId = createdVehicle.id || createdVehicle;

      // 4. Hizmet Açıklaması ve İşlem Oluşturma
      const serviceNames = [];
      if (formData.services.wash?.selected) serviceNames.push(formData.services.wash.name);
      if (formData.services.ppf?.selected) serviceNames.push(formData.services.ppf.name);
      if (formData.services.ceramic?.selected) serviceNames.push(formData.services.ceramic.name);
      if (formData.services.windowFilm?.selected) serviceNames.push(formData.services.windowFilm.name);
      
      const description = `${serviceNames.join(", ")} - Randevu: ${formData.appointment.date} ${formData.appointment.time}`;

      const transactionPayload = {
        description: description,
        vehicleId: vehicleId,
        personnelId: 0, 
        serviceDefinitionId: null, 
        totalPrice: calculateTotal()
      };

      const createdTransaction = await transactionService.create(transactionPayload);

      alert("Müşteri ve İşlem başarıyla oluşturuldu!");
      
      const newFrontendOrder = {
          id: createdTransaction.id || Math.floor(Math.random() * 1000),
          customer: formData.customer.name,
          vehicle: `${formData.vehicle.brand} ${formData.vehicle.model}`,
          plate: formData.vehicle.plate,
          status: "pending",
          date: formData.appointment.date,
          services: serviceNames,
          totalPrice: calculateTotal(),
          assignedStaff: [],
          payment: formData.payment.isPaid ? "paid" : "pending"
      };

      onOrderCreate(newFrontendOrder);
      onClose();

    } catch (error) {
      console.error("Kayıt sırasında hata:", error);
      alert("Kayıt başarısız: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((num) => (
        <React.Fragment key={num}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= num ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
            {step > num ? <Check size={20} /> : num}
          </div>
          {num < 4 && <div className={`w-16 h-1 mx-2 ${step > num ? "bg-blue-600" : "bg-gray-200"}`} />}
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
          {/* STEP 1: Müşteri & Araç */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Müşteri Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Ad Soyad *" className="border rounded-lg px-4 py-3" value={formData.customer.name} onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })} />
                  <input type="tel" placeholder="Telefon *" className="border rounded-lg px-4 py-3" value={formData.customer.phone} onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, phone: e.target.value } })} />
                  <input type="email" placeholder="E-posta" className="border rounded-lg px-4 py-3 md:col-span-2" value={formData.customer.email} onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, email: e.target.value } })} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4">Araç Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Marka *" className="border rounded-lg px-4 py-3" value={formData.vehicle.brand} onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, brand: e.target.value } })} />
                  <input type="text" placeholder="Model *" className="border rounded-lg px-4 py-3" value={formData.vehicle.model} onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, model: e.target.value } })} />
                  <input type="text" placeholder="Plaka *" className="border rounded-lg px-4 py-3" value={formData.vehicle.plate} onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, plate: e.target.value } })} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="Yıl" className="border rounded-lg px-4 py-3" value={formData.vehicle.year} onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, year: e.target.value } })} />
                    <input type="text" placeholder="Renk" className="border rounded-lg px-4 py-3" value={formData.vehicle.color} onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, color: e.target.value } })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Hizmet Seçimi - DEĞİŞKENLER BURADA KULLANILIYOR */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Hizmet Seçimi</h3>

              {/* YIKAMA */}
              <div className="border-2 border-cyan-200 rounded-lg p-6 bg-cyan-50">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-cyan-700">
                    <Droplets size={18} /> Yıkama & Bakım
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {washServices.map(service => (
                          <label key={service.id} className="flex items-center gap-2 cursor-pointer p-2 border rounded bg-white hover:bg-gray-50">
                              <input type="checkbox" className="w-4 h-4" checked={formData.services.wash?.items?.includes(service.id)} 
                              onChange={(e) => {
                                  const currentItems = formData.services.wash?.items || [];
                                  const newItems = e.target.checked ? [...currentItems, service.id] : currentItems.filter(id => id !== service.id);
                                  const totalPrice = newItems.reduce((sum, id) => sum + (washServices.find(ws => ws.id === id)?.price || 0), 0);
                                  setFormData({...formData, services: {...formData.services, wash: {selected: newItems.length > 0, items: newItems, price: totalPrice, name: "Yıkama"}}});
                              }}/>
                              <span className="flex-1">{service.name}</span>
                              <span className="font-bold text-cyan-700">₺{service.price}</span>
                          </label>
                      ))}
                  </div>
              </div>

              {/* PPF KAPLAMA - products ve parts kullanımı */}
              <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-purple-700">
                   <Car size={18} /> OLEX PPF (Paint Protection Film)
                </h4>
                <div className="space-y-4">
                   <select className="w-full border rounded-lg px-4 py-3 bg-white"
                    onChange={(e) => {
                      const series = products.ppf.series.find(s => s.id === e.target.value);
                      if (series) {
                        setFormData({...formData, services: {...formData.services, ppf: {selected: true, series: series, micron: null, parts: formData.services.ppf?.parts || []}}});
                      }
                    }}>
                     <option value="">Seri Seçiniz</option>
                     {products.ppf.series.map((series) => (
                       <option key={series.id} value={series.id}>{series.name} - ₺{series.basePrice.toLocaleString()}</option>
                     ))}
                   </select>

                   {formData.services.ppf?.series && (
                      <div className="grid grid-cols-5 gap-2">
                        {formData.services.ppf.series.microns.map((micron) => (
                           <button key={micron} onClick={() => setFormData({...formData, services: {...formData.services, ppf: {...formData.services.ppf, micron}}})}
                             className={`p-2 rounded border font-semibold ${formData.services.ppf.micron === micron ? "bg-purple-600 text-white" : "bg-white"}`}>
                             {micron}μ
                           </button>
                        ))}
                      </div>
                   )}
                   
                   {formData.services.ppf?.micron && (
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto bg-white p-3 rounded border">
                       {parts.map((part) => (
                         <label key={part.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                           <input type="checkbox" className="w-4 h-4" checked={formData.services.ppf?.parts?.includes(part.id)}
                             onChange={(e) => {
                               const currentParts = formData.services.ppf?.parts || [];
                               const newParts = e.target.checked ? [...currentParts, part.id] : currentParts.filter(p => p !== part.id);
                               const totalPrice = newParts.reduce((sum, partId) => sum + (parts.find(p => p.id === partId)?.price || 0), 0);
                               setFormData({...formData, services: {...formData.services, ppf: {...formData.services.ppf, parts: newParts, price: totalPrice, name: `PPF ${formData.services.ppf.series.name}`}}});
                             }}/>
                           <span className="flex-1 text-sm">{part.name}</span>
                           <span className="text-xs font-bold text-purple-600">₺{part.price}</span>
                         </label>
                       ))}
                    </div>
                   )}
                </div>
              </div>

              {/* SERAMİK KAPLAMA - products kullanımı */}
              <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-green-700">
                    <Car size={18} /> Seramik Kaplama
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {products.ceramic.products.map(product => (
                        <button key={product.id} onClick={() => setFormData({...formData, services: {...formData.services, ceramic: {selected: true, product: product, parts: [], price: product.price, name: product.name}}})}
                        className={`p-3 border-2 rounded text-left bg-white ${formData.services.ceramic?.product?.id === product.id ? "border-green-600 bg-green-50" : ""}`}>
                            <div className="font-bold">{product.name}</div>
                            <div className="text-green-600 font-bold">₺{product.price.toLocaleString()}</div>
                        </button>
                    ))}
                </div>
              </div>

              {/* CAM FİLMİ - windowGlassParts kullanımı */}
              <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                 <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-blue-700">
                     <Car size={18} /> OLEX Cam Filmleri
                 </h4>
                 <div className="space-y-4">
                     <select className="w-full border rounded-lg px-4 py-3 bg-white"
                        onChange={(e) => {
                            const product = products.windowFilm.products.find(p => p.id === e.target.value);
                            if(product) {
                                setFormData({...formData, services: {...formData.services, windowFilm: {selected: true, product: product, parts: [], price: 0, name: `Cam Filmi ${product.name}`}}})
                            }
                        }}>
                        <option value="">Film Seçiniz</option>
                        {products.windowFilm.products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                     </select>

                     {formData.services.windowFilm?.product && (
                         <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded border">
                            {windowGlassParts.map(part => (
                                <label key={part.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                                    <input type="checkbox" className="w-4 h-4" checked={formData.services.windowFilm?.parts?.includes(part.id)}
                                    onChange={(e) => {
                                        const currentParts = formData.services.windowFilm?.parts || [];
                                        const newParts = e.target.checked ? [...currentParts, part.id] : currentParts.filter(p => p !== part.id);
                                        const partsPrice = newParts.reduce((sum, partId) => sum + (windowGlassParts.find(wp => wp.id === partId)?.price || 0), 0);
                                        setFormData({...formData, services: {...formData.services, windowFilm: {...formData.services.windowFilm, parts: newParts, price: partsPrice}}});
                                    }} />
                                    <span className="flex-1 text-sm">{part.name}</span>
                                    <span className="text-xs font-bold text-blue-600">₺{part.price}</span>
                                </label>
                            ))}
                         </div>
                     )}
                 </div>
              </div>

              <div className="bg-blue-600 text-white rounded-lg p-4 font-bold text-xl text-center shadow-lg">
                  Toplam Tutar: ₺{calculateTotal().toLocaleString()}
              </div>
            </div>
          )}

          {/* STEP 3: Randevu */}
          {step === 3 && (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4">Randevu Seçimi</h3>
                <div className="border rounded p-4">
                    <div className="flex justify-between mb-4">
                        <button onClick={() => changeMonth(-1)}><ChevronLeft/></button>
                        <span>{currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}</span>
                        <button onClick={() => changeMonth(1)}><ChevronRight/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map(d=><div key={d} className="text-center text-xs text-gray-500">{d}</div>)}
                        {getDaysInMonth(currentMonth).map((date, idx) => (
                            date ? <button key={idx} onClick={() => setFormData({...formData, appointment: {...formData.appointment, date: date.toISOString().split("T")[0]}})} className={`p-2 border rounded ${formData.appointment.date === date.toISOString().split("T")[0] ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}>{date.getDate()}</button> : <div key={idx}></div>
                        ))}
                    </div>
                </div>
                {formData.appointment.date && (
                    <div className="grid grid-cols-4 gap-2">
                        {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00"].map(time => (
                            <button key={time} onClick={() => setFormData({...formData, appointment: {...formData.appointment, time}})} className={`p-2 border rounded ${formData.appointment.time === time ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}>{time}</button>
                        ))}
                    </div>
                )}
            </div>
          )}

          {/* STEP 4: Ödeme ve Onay */}
          {step === 4 && (
            <div className="space-y-6">
               <h3 className="text-xl font-semibold mb-4">Ödeme Bilgileri</h3>
               <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-md">
                   <p className="text-2xl font-bold mb-2">Toplam: ₺{calculateTotal().toLocaleString()}</p>
                   <div className="text-sm opacity-90 space-y-1">
                       <p>Müşteri: {formData.customer.name}</p>
                       <p>Araç: {formData.vehicle.brand} {formData.vehicle.model} - {formData.vehicle.plate}</p>
                       <p>Tarih: {formData.appointment.date} {formData.appointment.time}</p>
                   </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {["Nakit", "Kredi Kartı", "Havale", "Daha Sonra"].map(method => (
                      <button key={method} onClick={() => setFormData({...formData, payment: {...formData.payment, method, isPaid: method !== "Daha Sonra"}})} className={`p-4 border-2 rounded-lg font-medium transition-all ${formData.payment.method === method ? "border-blue-600 bg-blue-50 text-blue-700" : "hover:border-gray-300"}`}>
                          {method}
                      </button>
                  ))}
               </div>
            </div>
          )}

          <div className="flex justify-between gap-3 pt-6 border-t mt-6">
            <button onClick={() => (step > 1 ? setStep(step - 1) : onClose())} disabled={loading} className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50">
              <ChevronLeft size={20} /> {step === 1 ? "İptal" : "Geri"}
            </button>

            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={step === 1 && !formData.customer.name}>
                İleri <ChevronRight size={20} />
              </button>
            ) : (
              <button onClick={handleComplete} disabled={!formData.payment.method || loading} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                {loading ? "Kaydediliyor..." : "Kaydı Tamamla"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerFlow;
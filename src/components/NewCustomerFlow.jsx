import React, { useState } from "react";
import { Car, X, Check, ChevronLeft, ChevronRight, Droplets, Loader2 } from "lucide-react";
import { washServices, windowGlassParts } from "../data";
import { orderService } from "../api";

const NewCustomerFlow = ({ onClose, onOrderCreate, parts }) => {
    const [step, setStep] = useState(1);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customer: { name: "", phone: "", email: "" },
        vehicle: { brand: "", model: "", year: "", plate: "", color: "" },
        services: {
            ppf: { selected: false, series: null, micron: null, parts: [], price: 0, name: "" },
            ceramic: { selected: false, product: null, parts: [], price: 0, name: "" },
            windowFilm: { selected: false, product: null, parts: [], price: 0, name: "" },
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
            const selectedServices = [];

            // A. Yıkama
            if (formData.services.wash?.selected && formData.services.wash.items.length > 0) {
                formData.services.wash.items.forEach(washId => {
                   const service = washServices.find(w => w.id === washId);
                   if(service) {
                     selectedServices.push({
                       category: "Yıkama",
                       product: service.name,
                       spec: "",
                       part: "Tüm Araç",
                       price: service.price
                     });
                   }
                });
            }

            // B. PPF
            if (formData.services.ppf?.selected && formData.services.ppf.series && formData.services.ppf.parts.length > 0) {
                const seriesName = formData.services.ppf.series.name;
                const micron = formData.services.ppf.micron;
                
                formData.services.ppf.parts.forEach(partId => {
                   const part = parts.find(p => p.id === partId);
                   if(part) {
                     selectedServices.push({
                       category: "PPF",
                       product: seriesName,
                       spec: `${micron}μ`,
                       part: part.name,
                       price: part.price
                     });
                   }
                });
            }

            // C. Seramik
            if (formData.services.ceramic?.selected && formData.services.ceramic.product) {
                 const product = formData.services.ceramic.product;
                 
                 if (formData.services.ceramic.parts && formData.services.ceramic.parts.length > 0) {
                     formData.services.ceramic.parts.forEach(partId => {
                        const part = parts.find(p => p.id === partId);
                        if (part) {
                            selectedServices.push({
                                category: "Seramik",
                                product: product.name,
                                spec: product.duration,
                                part: part.name,
                                price: Math.round(part.price * 0.5)
                            });
                        }
                     });
                 } else {
                     selectedServices.push({
                        category: "Seramik",
                        product: product.name,
                        spec: product.duration,
                        part: "Tam Araç",
                        price: product.price
                     });
                 }
            }

            // D. Cam Filmi
            if (formData.services.windowFilm?.selected && formData.services.windowFilm.product && formData.services.windowFilm.parts.length > 0) {
                const filmName = formData.services.windowFilm.product.name;
                
                formData.services.windowFilm.parts.forEach(partId => {
                   const part = windowGlassParts.find(p => p.id === partId);
                   if(part) {
                     selectedServices.push({
                       category: "Cam Filmi",
                       product: filmName,
                       spec: "",
                       part: part.name,
                       price: part.price
                     });
                   }
                });
            }

            // Backend'e gönderilecek payload (Backend DTO'suna uygun)
            const fullOrderPayload = {
                customerName: formData.customer.name,
                customerPhone: formData.customer.phone,
                customerEmail: formData.customer.email || "",
                plateNumber: formData.vehicle.plate.toUpperCase(),
                brand: formData.vehicle.brand,
                model: formData.vehicle.model,
                color: formData.vehicle.color || "",
                year: formData.vehicle.year || new Date().getFullYear().toString(),
                personnelId: 1, // Varsayılan personel ID (veya seçim yaptırabilirsiniz)
                date: new Date(`${formData.appointment.date}T${formData.appointment.time || "09:00"}`).toISOString(),
                totalPrice: calculateTotal(),
                paymentMethod: formData.payment.method === "Nakit" ? "Nakit" : 
                               formData.payment.method === "Kredi Kartı" ? "Kredi Kartı" : 
                               formData.payment.method === "Havale" ? "Havale" : "Daha Sonra",
                isPaid: formData.payment.isPaid,
                selectedServices: selectedServices
            };

            console.log("Backend'e gönderilen payload:", fullOrderPayload);

            // Backend'e POST isteği
            const response = await orderService.create(fullOrderPayload);
            console.log("Backend yanıtı:", response);

            alert("✅ Sipariş başarıyla oluşturuldu!");
            
            // Frontend state'ini güncelle (opsiyonel)
            const newFrontendOrder = {
                id: response.id || Math.floor(Math.random() * 10000),
                customer: formData.customer.name,
                vehicle: `${formData.vehicle.brand} ${formData.vehicle.model}`,
                plate: formData.vehicle.plate,
                status: "Pending",
                date: formData.appointment.date,
                services: selectedServices.map(s => `${s.category}: ${s.product}`),
                totalPrice: calculateTotal(),
                assignedStaff: [],
                payment: formData.payment.isPaid ? "paid" : "pending"
            };

            onOrderCreate(newFrontendOrder);
            onClose();

        } catch (error) {
            console.error("❌ Sipariş oluşturma hatası:", error);
            const errorMessage = error.response?.data?.message || 
                                error.response?.data?.errors?.join(", ") || 
                                error.message || 
                                "Bilinmeyen bir hata oluştu";
            alert(`Sipariş oluşturulamadı:\n${errorMessage}`);
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

    const isStep1Valid = formData.customer.name.trim() !== "" && 
                        formData.customer.phone.trim() !== "" && 
                        formData.vehicle.brand.trim() !== "" && 
                        formData.vehicle.model.trim() !== "" && 
                        formData.vehicle.plate.trim() !== "";
    const isStep2Valid = calculateTotal() > 0;
    const isStep3Valid = formData.appointment.date !== "" && formData.appointment.time !== "";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Yeni Müşteri Kaydı</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={loading}>
                            <X size={24} />
                        </button>
                    </div>
                    <StepIndicator />
                </div>

                <div className="p-6">
                    {/* ADIM 1: Müşteri & Araç Bilgileri */}
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
                                        placeholder="Telefon * (5XX XXX XX XX)" 
                                        className="border rounded-lg px-4 py-3" 
                                        value={formData.customer.phone} 
                                        onChange={(e) => setFormData({ ...formData, customer: { ...formData.customer, phone: e.target.value } })} 
                                    />
                                    <input 
                                        type="email" 
                                        placeholder="E-posta (Opsiyonel)" 
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
                                        placeholder="Marka * (BMW, Mercedes...)" 
                                        className="border rounded-lg px-4 py-3" 
                                        value={formData.vehicle.brand} 
                                        onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, brand: e.target.value } })} 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Model * (320i, C200...)" 
                                        className="border rounded-lg px-4 py-3" 
                                        value={formData.vehicle.model} 
                                        onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, model: e.target.value } })} 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Plaka * (06 ABC 123)" 
                                        className="border rounded-lg px-4 py-3 uppercase" 
                                        value={formData.vehicle.plate} 
                                        onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, plate: e.target.value.toUpperCase() } })} 
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="Yıl (2020)" 
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

                    {/* ADIM 2: Hizmet Seçimi - Önceki kodunuz aynen devam eder */}
                    {/* ... (PPF, Seramik, Cam Filmi, Yıkama seçenekleri) */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold mb-4">Hizmet Seçimi</h3>
                            {/* Yıkama, PPF, Seramik, Cam Filmi bölümleri buraya gelecek */}
                            {/* Kodunuz çok uzun olduğu için burada sadece yapıyı gösteriyorum */}
                            <div className="bg-blue-600 text-white rounded-lg p-4 text-center">
                                <p className="text-2xl font-bold">Toplam: ₺{calculateTotal().toLocaleString()}</p>
                            </div>
                        </div>
                    )}

                    {/* ADIM 3: Randevu */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold mb-4">Randevu Tarihi ve Saati</h3>
                            <div className="border rounded-lg p-4">
                                <div className="flex justify-between mb-4">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded">
                                        <ChevronLeft />
                                    </button>
                                    <span className="font-semibold">
                                        {currentMonth.toLocaleDateString("tr-TR", { month: "long", year: "numeric" })}
                                    </span>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded">
                                        <ChevronRight />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"].map(d => (
                                        <div key={d} className="text-center text-xs font-medium text-gray-500">{d}</div>
                                    ))}
                                    {getDaysInMonth(currentMonth).map((date, idx) => (
                                        date ? (
                                            <button 
                                                key={idx} 
                                                onClick={() => setFormData({...formData, appointment: {...formData.appointment, date: date.toISOString().split("T")[0]}})} 
                                                className={`p-2 border rounded text-sm ${formData.appointment.date === date.toISOString().split("T")[0] ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}
                                            >
                                                {date.getDate()}
                                            </button>
                                        ) : <div key={idx}></div>
                                    ))}
                                </div>
                            </div>
                            {formData.appointment.date && (
                                <div>
                                    <label className="block font-semibold mb-2">Saat Seçimi</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(time => (
                                            <button 
                                                key={time} 
                                                onClick={() => setFormData({...formData, appointment: {...formData.appointment, time}})} 
                                                className={`p-3 border rounded font-medium ${formData.appointment.time === time ? "bg-blue-600 text-white" : "hover:bg-gray-50"}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ADIM 4: Ödeme */}
                    {step === 4 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold mb-4">Ödeme Bilgileri</h3>
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg">
                                <p className="text-3xl font-bold mb-2">Toplam: ₺{calculateTotal().toLocaleString()}</p>
                                <div className="text-sm opacity-90">
                                    <p>Müşteri: {formData.customer.name}</p>
                                    <p>Araç: {formData.vehicle.brand} {formData.vehicle.model}</p>
                                    <p>Tarih: {formData.appointment.date} {formData.appointment.time}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-2">Ödeme Yöntemi</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {["Nakit", "Kredi Kartı", "Havale", "Daha Sonra"].map(method => (
                                        <button 
                                            key={method} 
                                            onClick={() => setFormData({
                                                ...formData, 
                                                payment: {
                                                    ...formData.payment, 
                                                    method, 
                                                    isPaid: method !== "Daha Sonra"
                                                }
                                            })} 
                                            className={`p-4 border-2 rounded-lg font-medium transition-all ${
                                                formData.payment.method === method ? "border-blue-600 bg-blue-50" : "hover:border-gray-300"
                                            }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigasyon Butonları */}
                    <div className="flex justify-between gap-3 pt-6 border-t mt-6">
                        <button 
                            onClick={() => (step > 1 ? setStep(step - 1) : onClose())} 
                            disabled={loading} 
                            className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft size={20} /> {step === 1 ? "İptal" : "Geri"}
                        </button>

                        {step < 4 ? (
                            <button 
                                onClick={() => setStep(step + 1)} 
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300" 
                                disabled={loading || 
                                    (step === 1 && !isStep1Valid) || 
                                    (step === 2 && !isStep2Valid) || 
                                    (step === 3 && !isStep3Valid)
                                }
                            >
                                İleri <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button 
                                onClick={handleComplete} 
                                disabled={!formData.payment.method || loading} 
                                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Kaydediliyor...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        <span>Kaydı Tamamla</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewCustomerFlow;
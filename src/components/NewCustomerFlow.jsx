import React, { useState } from 'react';
import { createOrder, searchCustomer } from '../api'; // Yeni fonksiyonlar

const NewCustomerFlow = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '', customerPhone: '', plateNumber: '', brand: '', model: '',
    color: '', year: '', personnelId: 1, date: new Date().toISOString(),
    totalPrice: 0, paymentMethod: 'Nakit', isPaid: false, selectedServices: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Otomatik Arama (Basit versiyon)
    if ((name === 'customerPhone' || name === 'plateNumber') && value.length > 3) {
       searchCustomer(value).then(res => {
         if (res && res.found) {
           setFormData(p => ({ ...p, customerName: res.customerName || p.customerName, brand: res.brand || p.brand, model: res.model || p.model }));
         }
       });
    }
  };

  const addService = () => {
    setFormData(p => ({
      ...p,
      selectedServices: [...p.selectedServices, { category: "Genel", product: "Hızlı Bakım", part: "Tüm Araç", price: 500 }],
      totalPrice: p.totalPrice + 500
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Backend'e gönderilecek veriyi hazırla (Sayıları ve tarihleri düzelt)
      const payload = { ...formData, personnelId: Number(formData.personnelId), year: formData.year || "0" };
      await createOrder(payload);
      alert('İşlem Başarılı!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      alert('Kaydedilemedi. Lütfen bilgileri kontrol edin.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Yeni İşlem</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="plateNumber" placeholder="Plaka" value={formData.plateNumber} onChange={handleChange} className="border p-2 rounded" required />
            <input name="customerPhone" placeholder="Telefon" value={formData.customerPhone} onChange={handleChange} className="border p-2 rounded" required />
            <input name="customerName" placeholder="Müşteri Adı" value={formData.customerName} onChange={handleChange} className="border p-2 rounded" required />
            <input name="brand" placeholder="Marka" value={formData.brand} onChange={handleChange} className="border p-2 rounded" />
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
                <h3 className="font-bold">Hizmetler</h3>
                <button type="button" onClick={addService} className="text-blue-600">+ Ekle (500₺)</button>
            </div>
            {formData.selectedServices.map((s, i) => <div key={i} className="text-sm bg-gray-100 p-2 mb-1">{s.product} - {s.price}₺</div>)}
            <div className="text-right font-bold text-xl mt-2">Toplam: {formData.totalPrice}₺</div>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">İptal</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded">Kaydet</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCustomerFlow;
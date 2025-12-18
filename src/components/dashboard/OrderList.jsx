import React, { useState, useEffect } from "react";
import { orderService } from "../../api"; // API servisiniz
import { Calendar, User, Phone, Car, Tag, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Detayları açmak için

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderService.getAll();
      // Tarihe göre yeniden eskiye sırala
      const sorted = (res.data || res).sort((a, b) => new Date(b.date) - new Date(a.date));
      setOrders(sorted);
    } catch (error) {
      console.error("Siparişler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Durum rozeti rengi
  const getStatusBadge = (isPaid) => {
    return isPaid ? (
      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <CheckCircle size={12}/> Ödendi
      </span>
    ) : (
      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <Clock size={12}/> Bekliyor
      </span>
    );
  };

  if (loading) return <div className="p-4 text-center text-gray-500">Yükleniyor...</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-bold text-gray-700">Son İş Emirleri</h3>
        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">Toplam: {orders.length}</span>
      </div>

      <div className="divide-y">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Henüz kayıtlı iş emri yok.</div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="group hover:bg-gray-50 transition-colors">
              
              {/* ÜST SATIR (ÖZET) */}
              <div 
                className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(order.id)}
              >
                {/* Sol: Müşteri & Araç */}
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full mt-1 ${expandedOrderId === order.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                    {expandedOrderId === order.id ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 flex items-center gap-2">
                        {order.plateNumber}
                        <span className="text-xs font-normal text-gray-500 border px-1 rounded">{order.brand} {order.model}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        <User size={14}/> {order.customerName} 
                        <Phone size={14} className="ml-2"/> {order.customerPhone}
                    </div>
                  </div>
                </div>

                {/* Sağ: Tarih, Tutar, Durum */}
                <div className="flex flex-col md:items-end gap-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14}/> {new Date(order.date).toLocaleDateString("tr-TR")}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-blue-900 text-lg">₺{order.totalPrice?.toLocaleString()}</span>
                    {getStatusBadge(order.isPaid)}
                  </div>
                </div>
              </div>

              {/* ALT DETAY (AÇILIR KISIM) - YENİ VERİ YAPISI BURADA İŞLENİYOR */}
              {expandedOrderId === order.id && (
                <div className="bg-gray-50/50 p-4 border-t pl-14">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <Tag size={12}/> Yapılan İşlemler / Hizmetler
                  </h4>
                  
                  <div className="space-y-2">
                    {/* YENİ SİSTEM: selectedServices dizisi varsa */}
                    {order.selectedServices && Array.isArray(order.selectedServices) && order.selectedServices.length > 0 ? (
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {order.selectedServices.map((service, idx) => (
                          <li key={idx} className="bg-white border rounded p-2 text-sm flex justify-between items-center shadow-sm">
                            <div>
                              <span className="font-semibold text-gray-700">{service.product || "Ürün Belirtilmemiş"}</span>
                              {service.spec && <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded ml-2">{service.spec}</span>}
                              <div className="text-xs text-gray-500 mt-0.5">
                                {service.category} • <span className="text-gray-700 font-medium">{service.part}</span>
                              </div>
                            </div>
                            <span className="font-bold text-gray-600">₺{service.price}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      /* ESKİ SİSTEM veya BOŞ VERİ (Geriye dönük uyumluluk) */
                      <p className="text-sm text-gray-500 italic">
                        {order.serviceName || "Özel İşlem / Detay Yok"}
                      </p>
                    )}
                  </div>

                  {/* Ödeme Bilgisi */}
                  <div className="mt-3 text-xs text-gray-400 text-right">
                    Ödeme Yöntemi: <span className="font-medium text-gray-600">{order.paymentMethod}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderList;
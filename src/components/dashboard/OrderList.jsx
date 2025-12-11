import React, { useState, useEffect } from "react";
import { Search, Edit, Loader2, Eye, Trash2 } from "lucide-react";
import { orderService, personnelService } from "../../api"; // DÜZELTİLDİ: personnelService
import OrderDetailModal from "../OrderDetailModal";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [staffList, setStaffList] = useState([]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getAll();
      const mapped = Array.isArray(data) ? data.map(o => ({
        id: o.id || o.Id,
        customer: o.customerInfo || o.CustomerInfo || "Misafir",
        vehicle: o.vehicleInfo || o.VehicleInfo || "",
        plate: o.plate || o.VehiclePlate || "---",
        totalPrice: o.totalPrice || o.TotalPrice || 0,
        status: o.status || o.Status || "Pending",
        date: new Date(o.date || o.TransactionDate || o.CreatedDate).toLocaleDateString('tr-TR'),
        services: o.summaryList || []
      })) : [];
      setOrders(mapped);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
      fetchOrders();
      // Personel listesini modal için çek
      personnelService.getAll().then(data => {
          const mappedStaff = Array.isArray(data) ? data.map(p => ({
              id: p.id || p.Id,
              name: p.fullName || p.FullName || `${p.firstName} ${p.lastName}`
          })) : [];
          setStaffList(mappedStaff);
      });
  }, []);

  const handleUpdate = () => {
      fetchOrders(); 
      setSelectedOrder(null); 
  };

  const handleDelete = async (id) => {
    if(confirm("Silmek istediğine emin misin?")) {
        await orderService.delete(id);
        fetchOrders();
    }
  }

  const filtered = orders.filter(o => o.plate?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">İş Emirleri</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
          <input className="pl-10 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Plaka Ara..." 
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="p-3 text-left">İş No</th>
              <th className="p-3 text-left">Müşteri</th>
              <th className="p-3 text-left">Plaka</th>
              <th className="p-3 text-left">Tutar</th>
              <th className="p-3 text-left">Durum</th>
              <th className="p-3 text-left">İşlem</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map(order => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">#{order.id}</td>
                <td className="p-3">{order.customer}</td>
                <td className="p-3 font-mono bg-gray-100 rounded px-2 w-fit">{order.plate}</td>
                <td className="p-3 font-bold text-green-600">₺{order.totalPrice}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    order.status === "Completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedOrder && (
          <OrderDetailModal 
            order={selectedOrder} 
            staff={staffList} 
            onClose={() => setSelectedOrder(null)} 
            onSave={handleUpdate} 
          />
      )}
    </div>
  );
};

export default OrderList;
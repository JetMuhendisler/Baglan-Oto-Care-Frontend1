import React from "react";
import { Save, Car, Layers, Sun, Shield } from "lucide-react";

const SettingsView = ({ products, setProducts, parts, setParts }) => {
  
  // PPF Fiyatı Güncelleme
  const updatePPFPrice = (seriesId, newPrice) => {
    const updatedSeries = products.ppf.series.map(s => 
      s.id === seriesId ? { ...s, basePrice: parseInt(newPrice) || 0 } : s
    );
    setProducts({
      ...products,
      ppf: { ...products.ppf, series: updatedSeries }
    });
  };

  // Cam Filmi Fiyatı Güncelleme
  const updateWindowFilmPrice = (productId, newPrice) => {
    const updatedProducts = products.windowFilm.products.map(p => 
      p.id === productId ? { ...p, price: parseInt(newPrice) || 0 } : p
    );
    setProducts({
      ...products,
      windowFilm: { ...products.windowFilm, products: updatedProducts }
    });
  };

  // Seramik Fiyatı Güncelleme
  const updateCeramicPrice = (productId, newPrice) => {
    const updatedProducts = products.ceramic.products.map(p => 
      p.id === productId ? { ...p, price: parseInt(newPrice) || 0 } : p
    );
    setProducts({
      ...products,
      ceramic: { ...products.ceramic, products: updatedProducts }
    });
  };

  // Parça Fiyatı Güncelleme
  const updatePartPrice = (partId, newPrice) => {
    const updatedParts = parts.map(p => 
      p.id === partId ? { ...p, price: parseInt(newPrice) || 0 } : p
    );
    setParts(updatedParts);
  };

  return (
    <div className="p-6 space-y-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fiyat Ayarları</h2>
          <p className="text-gray-500">Hizmet ve parça fiyatlarını buradan güncelleyebilirsiniz.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Save size={20} />
          <span>Otomatik Kaydediliyor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PPF Ayarları */}
        <div className="bg-white p-6 rounded-lg shadow border border-purple-100">
          <div className="flex items-center gap-2 mb-4 text-purple-700">
            <Shield size={24} />
            <h3 className="text-xl font-bold">PPF Kaplama Taban Fiyatları</h3>
          </div>
          <div className="space-y-3">
            {products.ppf.series.map(series => (
              <div key={series.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{series.name}</p>
                  <p className="text-xs text-gray-500">{series.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">₺</span>
                  <input 
                    type="number" 
                    value={series.basePrice} 
                    onChange={(e) => updatePPFPrice(series.id, e.target.value)}
                    className="w-24 border rounded px-2 py-1 text-right font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parça Fiyatları */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Car size={24} />
            <h3 className="text-xl font-bold">Araç Parça Fiyatları</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
            {parts.map(part => (
              <div key={part.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                <span className="text-sm font-medium">{part.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">₺</span>
                  <input 
                    type="number" 
                    value={part.price} 
                    onChange={(e) => updatePartPrice(part.id, e.target.value)}
                    className="w-20 border rounded px-1 py-1 text-right text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cam Filmi Ayarları */}
        <div className="bg-white p-6 rounded-lg shadow border border-blue-100">
          <div className="flex items-center gap-2 mb-4 text-blue-700">
            <Sun size={24} />
            <h3 className="text-xl font-bold">Cam Filmi Fiyatları</h3>
          </div>
          <div className="space-y-3">
            {products.windowFilm.products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{product.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">₺</span>
                  <input 
                    type="number" 
                    value={product.price} 
                    onChange={(e) => updateWindowFilmPrice(product.id, e.target.value)}
                    className="w-24 border rounded px-2 py-1 text-right font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seramik Ayarları */}
        <div className="bg-white p-6 rounded-lg shadow border border-green-100">
          <div className="flex items-center gap-2 mb-4 text-green-700">
            <Layers size={24} />
            <h3 className="text-xl font-bold">Seramik Kaplama Fiyatları</h3>
          </div>
          <div className="space-y-3">
            {products.ceramic.products.map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                   <p className="font-medium">{product.name}</p>
                   <p className="text-xs text-gray-500">{product.duration} Garanti</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">₺</span>
                  <input 
                    type="number" 
                    value={product.price} 
                    onChange={(e) => updateCeramicPrice(product.id, e.target.value)}
                    className="w-24 border rounded px-2 py-1 text-right font-bold text-green-700 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsView;
import React from "react";
import { Save, Car, Layers, Sun } from "lucide-react";

const SettingsView = () => {
  return (
    <div className="p-6 space-y-8 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fiyat Ayarları</h2>
          <p className="text-gray-500">Hizmet ve parça fiyatlarını buradan güncelleyebilirsiniz.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Save size={20} />
          <span>Kaydet (Simülasyon)</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border text-center text-gray-500">
          <p>Bu alan backend'e bağlandığında aktif olacaktır.</p>
          <div className="flex justify-center gap-4 mt-4 opacity-50">
              <Car size={32}/> <Layers size={32}/> <Sun size={32}/>
          </div>
      </div>
    </div>
  );
};

export default SettingsView;
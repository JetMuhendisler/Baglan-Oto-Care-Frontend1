import React, { useState } from "react";
import { Car, Loader2, AlertCircle } from "lucide-react";
import { authService } from "../api";

const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🔐 Login isteği gönderiliyor...", { username });
      
      // Backend'e istek atıyoruz
      const response = await authService.login(username, password);
      
      console.log("📦 Backend'den gelen response:", response);

      // Backend response yapısı: { Data: { Token, Role, FullName }, Success, Message }
      // Interceptor'dan sonra sadece Data kısmı gelir: { Token, Role, FullName }

      let token = null;
      let role = "Admin";
      let fullName = username;

      // Response yapısını kontrol et
      if (response && typeof response === "object") {
        // Pascal Case (C# backend)
        if (response.Token) {
          token = response.Token;
          role = response.Role || "Admin";
          fullName = response.FullName || username;
          console.log("✅ Token bulundu (Pascal Case):", token.substring(0, 50) + "...");
        }
        // Camel case (alternatif)
        else if (response.token) {
          token = response.token;
          role = response.role || "Admin";
          fullName = response.fullName || username;
          console.log("✅ Token bulundu (camel case):", token.substring(0, 50) + "...");
        }
        // Nested Data object (interceptor çalışmadıysa)
        else if (response.Data?.Token) {
          token = response.Data.Token;
          role = response.Data.Role || "Admin";
          fullName = response.Data.FullName || username;
          console.log("✅ Token bulundu (Nested Data):", token.substring(0, 50) + "...");
        }
      } 
      // String olarak token gelirse
      else if (typeof response === "string") {
        token = response;
        console.log("✅ Token (string):", token.substring(0, 50) + "...");
      }

      // Token kontrolü
      if (!token) {
        console.error("❌ Token bulunamadı! Response yapısı:", response);
        throw new Error("Token alınamadı. Lütfen backend yanıtını kontrol edin.");
      }

      // Token'ı localStorage'a kaydet
      localStorage.setItem("token", token);
      console.log("💾 Token localStorage'a kaydedildi");

      // Kullanıcı bilgisini oluştur
      const userData = {
        name: fullName,
        role: role,
        token: token
      };

      console.log("✅ Login başarılı! Kullanıcı bilgileri:", { name: fullName, role });
      
      // Ana bileşene bildir
      onLogin(userData);

    } catch (err) {
      console.error("❌ Login hatası:", err);
      
      // Hata mesajını belirle
      let errorMessage = "Giriş başarısız!";
      
      if (err.response?.status === 401) {
        errorMessage = "Kullanıcı adı veya şifre hatalı.";
      } else if (err.response?.status === 500) {
        errorMessage = "Sunucu hatası. Lütfen backend loglarını kontrol edin.";
      } else if (err.response?.data?.Message) {
        errorMessage = err.response.data.Message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (!navigator.onLine) {
        errorMessage = "İnternet bağlantınızı kontrol edin.";
      } else if (err.code === 'ERR_NETWORK') {
        errorMessage = "Backend'e bağlanılamıyor. Sunucunun çalıştığından emin olun.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">BAĞLAN OTO</h1>
          <p className="text-gray-600">Oto Care Center</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Giriş Yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        {/* Test Bilgileri */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-semibold mb-2">Test Kullanıcısı:</p>
          <p className="text-xs text-blue-700">Kullanıcı Adı: <code className="bg-blue-100 px-2 py-1 rounded">admin</code></p>
          <p className="text-xs text-blue-700">Şifre: <code className="bg-blue-100 px-2 py-1 rounded">admin123</code></p>
          <p className="text-xs text-blue-600 mt-2">⚠️ Backend'in çalıştığından emin olun!</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
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
      const response = await authService.login(username, password);
      console.log("Login Yanıtı:", response);

      // Yanıt boşsa veya null ise
      if (!response) throw new Error("Sunucudan yanıt alınamadı!");

      // Token'ı farklı formatlarda arayalım (Büyük/Küçük harf)
      const token = response.Token || response.token || response.data?.token;
      
      if (token) {
        const userData = {
          name: response.FullName || response.fullName || username,
          role: response.Role || response.role || "Admin",
          token: token
        };
        onLogin(userData);
      } else {
        throw new Error("Kullanıcı adı veya şifre hatalı!");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Car className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bağlan Oto</h1>
          <p className="text-gray-500">Yönetim Paneli Girişi</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2 disabled:opacity-70">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Giriş...</> : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
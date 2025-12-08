import React, { useState } from "react";
import { login } from "../api"; 
import { Loader2 } from "lucide-react";

const LoginView = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await login(username, password);
      
      // DÜZELTME: api.js zaten response.data döndürüyor, bu yüzden tekrar .data.data dememize gerek yok.
      // response yapısı: { success: true, message: "...", data: { token: "..." } } şeklinde geliyor.
      const userData = response?.data; 

      if (response.success && userData) {
        onLogin({
          name: userData.fullName || userData.username || "Kullanıcı",
          role: userData.role
        });
      } else {
        // Eğer success false ise veya veri yoksa mesajı göster
        setError(response.message || "Giriş Başarısız.");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı. Backend çalışıyor mu?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">Bağlan Oto Bakım</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-3 border rounded-md" placeholder="Kullanıcı Adı" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 border rounded-md" placeholder="Şifre" />
          {error && <p className={`p-2 rounded ${error === "Başarılı" ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>{error}</p>}
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {loading ? <Loader2 className="animate-spin" /> : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
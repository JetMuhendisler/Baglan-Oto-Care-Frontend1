import React, { useState } from "react";
import { authService } from "../api";
import { Car } from "lucide-react";

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await authService.login(username, password);
      // Backend yapına göre: Token, Role, FullName dönüyor
      if (data && data.Token) {
        localStorage.setItem("token", data.Token);
        localStorage.setItem("user", JSON.stringify({ name: data.FullName, role: data.Role }));
        onLoginSuccess();
      } else {
        setError("Giriş bilgileri alınamadı.");
      }
    } catch{
      setError("Kullanıcı adı veya şifre hatalı.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full mb-4 shadow-lg">
            <Car size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Bağlan Oto</h1>
          <p className="text-gray-500">Yönetim Paneli Girişi</p>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
            <input className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input type="password" className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
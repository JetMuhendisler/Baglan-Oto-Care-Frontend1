import React, { useState, useEffect } from "react";
import LoginView from "./views/Login";
import Dashboard from "./views/Dashboard";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Uygulama açılınca LocalStorage kontrolü
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch  {
        // Hatalı veri varsa temizle
        localStorage.clear();
      }
    }
  }, []);

  const handleLogin = (userData) => {
    // Token ve User bilgisini kaydet
    if (userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Tüm storage'ı temizle
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear(); // Session storage'ı da temizle
    setUser(null);
    setIsAuthenticated(false);
    
    // Sayfayı yenile ve login'e yönlendir
    window.location.href = "/";
  };

  return (
    <>
      {isAuthenticated ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <LoginView onLogin={handleLogin} />
      )}
    </>
  );
};

export default App;
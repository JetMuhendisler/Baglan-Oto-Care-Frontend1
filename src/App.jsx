import React, { useState, useEffect } from "react";
import LoginView from "./views/Login"; // Düzeltildi: "./components/..." yerine LoginView'i direkt import ediyoruz
import Dashboard from "./views/Dashboard"; // views klasöründen çağırıyoruz
import { olexProducts as initialProducts, carParts as initialParts } from "./data";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Ayarlar verilerini App'te tutmak ideal
  const [products, setProducts] = useState(initialProducts);
  const [parts, setParts] = useState(initialParts);

  const handleLogin = (userData) => {
    if (userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  // Sayfa yenilendiğinde kullanıcıyı kontrol et
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (token && savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);


  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout} 
      products={products}
      setProducts={setProducts}
      parts={parts}
      setParts={setParts}
    />
  );
};

export default App;
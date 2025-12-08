import React, { useState } from "react";
import LoginView from "./components/LoginView";
import Dashboard from "./Dashboard";
import { olexProducts as initialProducts, carParts as initialParts } from "./data";

const App = () => {
  const [currentView, setCurrentView] = useState("login");
  const [user, setUser] = useState(null);

  // Veriler
  const [products, setProducts] = useState(initialProducts);
  const [parts, setParts] = useState(initialParts);
  
  // Örnek veriler
  const [orders, setOrders] = useState([{
      id: 1,
      customer: "Ahmet Yılmaz",
      vehicle: "BMW 320i",
      plate: "06 ABC 123",
      status: "progress",
      date: "2025-10-20",
      services: ["Araba Yıkama", "PPF Kaplama - OLEX Carat"],
      assignedStaff: ["Mehmet Çelik"],
      totalPrice: 18300,
      payment: "paid",
  }]);

  const [staff, setStaff] = useState([{ 
      id: 1, name: "Mehmet Çelik", role: "PPF Uzmanı", salary: 25000, completedJobs: 15, jobs: [1] 
  }]);

  const [transactions, setTransactions] = useState([{ 
      id: 1, type: "income", description: "PPF Kaplama - Ahmet Yılmaz (#1)", amount: 18300, date: "2025-10-20", category: "Hizmet", orderId: 1 
  }]);

  // --- DEĞİŞİKLİK ---
  // Buradaki useEffect kaldırıldı. 
  // Böylece sayfa her yenilendiğinde state sıfırlanır ve uygulama 'login' ekranında başlar.

  const handleLogin = (userData) => {
    // Token'ı localStorage'a kaydediyoruz ki API istekleri çalışmaya devam etsin
    if (userData.token) {
        localStorage.setItem("token", userData.token);
    }
    
    // Kullanıcı bilgisini state'e atıyoruz ama localStorage'dan geri yükleme yapmayacağız
    setUser(userData);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Temizlik için silebiliriz
    setUser(null);
    setCurrentView("login");
  };

  if (currentView === "login") {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      setUser={(u) => {
        if (!u) handleLogout();
        else setUser(u);
      }}
      products={products}
      setProducts={setProducts}
      parts={parts}
      setParts={setParts}
      orders={orders}
      setOrders={setOrders}
      staff={staff}
      setStaff={setStaff}
      transactions={transactions}
      setTransactions={setTransactions}
    />
  );
};

export default App;
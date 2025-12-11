import axios from "axios";

// Backend adresinizin doğru olduğundan emin olun
const BASE_URL = "https://localhost:7047";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Token varsa header'a ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Backend'den gelen veriyi sadeleştirir
api.interceptors.response.use(
  (response) => {
    // Backend { Data: ... } şeklinde dönüyorsa Data'yı, yoksa direkt response.data'yı al
    if (response.data && response.data.Data !== undefined) return response.data.Data;
    if (response.data && response.data.data !== undefined) return response.data.data;
    return response.data;
  },
  (error) => {
    console.error("API Hatası Detay:", error.response || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Sadece dashboard'daysak redirect yap, login'de yapma (sonsuz döngü olmasın)
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

// --- SERVİSLER ---

export const authService = {
  login: async (username, password) => {
    // LoginDto backend'de { Username, Password } bekliyor
    return await api.post("/api/auth/login", { Username: username, Password: password });
  },
  register: async (data) => {
    return await api.post("/api/auth/register", data);
  },
};

export const orderService = {
  getAll: () => api.get("/api/siparis"),
  create: (data) => api.post("/api/siparis", data),
  delete: (id) => api.delete(`/api/siparis/${id}`),
  search: (text) => api.get(`/api/siparis/ara/${text}`),
  update: (data) => api.put("/api/siparis/guncelle", data),
};

export const personnelService = {
  getAll: () => api.get("/api/personel"),
  create: (data) => api.post("/api/personel", data),
  update: (data) => api.put("/api/personel", data),
  delete: (id) => api.delete(`/api/personel/${id}`),
};

export const expenseService = {
  getAll: () => api.get("/api/ek-muhasebe"),
  create: (data) => api.post("/api/ek-muhasebe", data),
  delete: (id) => api.delete(`/api/ek-muhasebe/${id}`),
};

export const dashboardService = {
  getStats: () => api.get("/api/dashboard/ozet"),
};

export const serviceDefService = {
  getAll: () => api.get("/api/hizmet-tanimlari"),
  create: (data) => api.post("/api/hizmet-tanimlari", data),
};

export default api;
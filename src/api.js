import axios from "axios";

const BASE_URL = "https://localhost:7047";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => {
    // Backend { Data: ... } dönüyorsa sadece Data'yı al
    if (response.data && response.data.Data !== undefined) return response.data.Data;
    if (response.data && response.data.data !== undefined) return response.data.data;
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

// İSİMLENDİRMELER DÜZELTİLDİ:
export const authService = {
  login: async (username, password) => await api.post("/api/auth/login", { username, password }),
};

export const orderService = {
  getAll: async () => await api.get("/api/siparis"),
  create: async (data) => await api.post("/api/siparis", data),
  delete: async (id) => await api.delete(`/api/siparis/${id}`),
  search: async (text) => await api.get(`/api/siparis/ara/${text}`),
  update: async (data) => await api.put("/api/siparis/guncelle", data), // Sipariş güncelleme
};

// Burada "staffService" değil "personnelService" kullanıyoruz
export const personnelService = {
  getAll: async () => await api.get("/api/personel"),
  create: async (data) => await api.post("/api/personel", data),
};

// Burada "financeService" değil "expenseService" kullanıyoruz
export const expenseService = {
  getAll: async () => await api.get("/api/ek-muhasebe"), // getExpenses yerine getAll standartlaştı
  create: async (data) => await api.post("/api/ek-muhasebe", data),
  delete: async (id) => await api.delete(`/api/ek-muhasebe/${id}`),
};

export const dashboardService = {
  getStats: async () => await api.get("/api/dashboard/ozet"),
};

export default api;
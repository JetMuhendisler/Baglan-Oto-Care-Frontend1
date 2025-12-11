import axios from "axios";

// Backend adresi
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
    // Backend veriyi { Data: ... } içinde gönderiyorsa onu çıkar
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

// --- SERVİSLER ---

export const authService = {
  login: (username, password) => api.post("/api/auth/login", { username, password }),
  register: (data) => api.post("/api/auth/register", data),
};

export const orderService = {
  getAll: () => api.get("/api/siparis"),
  create: (data) => api.post("/api/siparis", data),
  search: (text) => api.get(`/api/siparis/ara/${text}`),
  update: (data) => api.put("/api/siparis/guncelle", data),
  // SİLME FONKSİYONU BURADA:
  delete: (id) => api.delete(`/api/siparis/${id}`),
};

export const personnelService = {
  getAll: () => api.get("/api/personel"),
  create: (data) => api.post("/api/personel", data),
  update: (data) => api.put("/api/personel", data),
  // SİLME FONKSİYONU BURADA:
  delete: (id) => api.delete(`/api/personel/${id}`),
};

export const expenseService = {
  getAll: () => api.get("/api/ek-muhasebe"),
  create: (data) => api.post("/api/ek-muhasebe", data),
  // SİLME FONKSİYONU BURADA:
  delete: (id) => api.delete(`/api/ek-muhasebe/${id}`),
};

export const dashboardService = {
  getStats: () => api.get("/api/dashboard/ozet"),
};

export default api;
import axios from "axios";

// Swagger'daki Base URL
const BASE_URL = "https://localhost:7047";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Token varsa header'a ekle
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

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    // Backend standardına göre response parse işlemi
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      return response.data.data;
    }
    // Sadece success: true dönüyorsa
    if (response.data && response.data.success === true) {
        return true; 
    }
    return response.data;
  },
  (error) => {
    // Hata durumunda konsola bas, ama uygulamayı çökertme
    console.error("API Hatası:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

// --- AUTH SERVICES ---
export const authService = {
  login: async (username, password) => {
    const response = await api.post("/api/auth/login", { username, password });
    return response; 
  },
  register: async (data) => {
    const response = await api.post("/api/auth/register", data);
    return response;
  },
};

// --- CUSTOMER SERVICES ---
export const customerService = {
  getAll: async (search = "") => {
    return await api.get(`/api/musteri?search=${search}`);
  },
  create: async (data) => {
    return await api.post("/api/musteri", data);
  },
  update: async (data) => {
    return await api.put("/api/musteri", data);
  },
  delete: async (id) => {
    await api.delete(`/api/musteri/${id}`);
  },
};

// --- VEHICLE SERVICES ---
export const vehicleService = {
  getAll: async (search = "") => {
    return await api.get(`/api/arac?search=${search}`);
  },
  getByCustomerId: async (cid) => {
    return await api.get(`/api/arac/musteri/${cid}`);
  },
  create: async (data) => {
    return await api.post("/api/arac", data);
  },
};

// --- TRANSACTION (MUHASEBE/İŞLEM) SERVICES ---
export const transactionService = {
  getAll: async (search = "") => {
    return await api.get(`/api/islem?search=${search}`);
  },
  create: async (data) => {
    return await api.post("/api/islem", data);
  },
  updateStatus: async (data) => {
    return await api.put("/api/islem/durum", data);
  },
  delete: async (id) => {
    await api.delete(`/api/islem/${id}`);
  },
};

// --- ORDER (SİPARİŞ) SERVICES ---
export const orderService = {
  getAll: async () => {
    return await api.get("/api/siparis");
  },
  create: async (data) => {
    return await api.post("/api/siparis", data);
  },
  delete: async (id) => {
    await api.delete(`/api/siparis/${id}`);
  },
  search: async (text) => {
    return await api.get(`/api/siparis/ara/${text}`);
  }
};

// --- PERSONNEL SERVICES ---
export const personnelService = {
  getAll: async (search = "") => {
    return await api.get(`/api/personel?search=${search}`);
  },
  create: async (data) => {
    return await api.post("/api/personel", data);
  },
  delete: async (id) => {
    return await api.delete(`/api/personel/${id}`);
  }
};

export default api;
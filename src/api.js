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

// Response Interceptor: Gelen { data, success } yapısını çöz
api.interceptors.response.use(
  (response) => {
    // Eğer yanıt { data: ..., success: true } formatındaysa, sadece data'yı döndür
    if (response.data && response.data.success === true && response.data.data !== undefined) {
      return response.data.data;
    }
    // Eğer success true ama data yoksa (örn: silme işlemi), true dön
    if (response.data && response.data.success === true) {
        return true; 
    }
    // Diğer durumlar (örn: Auth endpointi farklı formatta olabilir)
    return response.data;
  },
  (error) => {
    // Hata mesajını yakala ve fırlat
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
    // Artık .data dememize gerek yok, interceptor hallediyor
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

// --- TRANSACTION (İŞLEM) SERVICES ---
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
   createFullOrder: async (orderPayload) => {
    // Backend controller'da oluşturduğumuz endpoint yolu: /api/transactions/create-full-order
    const response = await axios.post(`api/transactions/create-full-order`, orderPayload);
    return response.data;}

};

// --- PERSONNEL SERVICES ---
export const personnelService = {
  getAll: async (search = "") => {
    return await api.get(`/api/personel?search=${search}`);
  }
};

export default api;
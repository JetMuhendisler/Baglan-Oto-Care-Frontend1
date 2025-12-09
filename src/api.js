import axios from "axios";

// HTTPS sertifika hatası için - Sadece development ortamında
const BASE_URL = "https://localhost:7047";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // HTTPS sertifika hatası için geçici çözüm (production'da kaldırılmalı)
  httpsAgent: import.meta.env.DEV ? {
    rejectUnauthorized: false
  } : undefined
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

// Response Interceptor - Backend response yapısına göre
api.interceptors.response.use(
  (response) => {
    console.log("📦 Raw API Response:", response.data);
    
    // Backend formatı: { Data, Success, Message } (Pascal Case!)
    if (response.data) {
      const data = response.data;
      
      // Pascal Case kontrolü (Backend C# kullanıyor)
      if (data.Success === true && data.Data !== undefined) {
        console.log("✅ Response parsed (Data):", data.Data);
        return data.Data;
      }
      
      // Camel case kontrolü (alternatif)
      if (data.success === true && data.data !== undefined) {
        console.log("✅ Response parsed (data):", data.data);
        return data.data;
      }
      
      // Success var ama Data yok (delete işlemleri)
      if (data.Success === true || data.success === true) {
        console.log("✅ Response parsed (boolean):", true);
        return true;
      }
      
      // Diğer durumlarda tüm response'u dön
      console.log("⚠️ Response returned as-is:", data);
      return data;
    }
    
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.data?.Message || error.response?.data?.message || error.message);
    
    // 401 Unauthorized - Token geçersiz
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    
    return Promise.reject(error);
  }
);

// --- AUTH SERVICES ---
export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post("/api/auth/login", { username, password });
      console.log("🔐 Auth API Response:", response);
      
      // Response interceptor'dan geçmiş veriyi döndür
      // Backend formatı: { data: { token, role, fullName }, success: true, message }
      return response;
    } catch (error) {
      console.error("❌ Auth API Error:", error);
      throw error;
    }
  },
  register: async (data) => {
    return await api.post("/api/auth/register", data);
  },
};

// --- CUSTOMER SERVICES ---
export const customerService = {
  getAll: async (search = "") => {
    return await api.get(`/api/musteri${search ? `?search=${search}` : ""}`);
  },
  create: async (data) => {
    const payload = {
      FirstName: data.firstName || data.FirstName,
      LastName: data.lastName || data.LastName,
      PhoneNumber: data.phoneNumber || data.PhoneNumber,
      Email: data.email || data.Email
    };
    return await api.post("/api/musteri", payload);
  },
  update: async (data) => {
    const payload = {
      Id: data.id || data.Id,
      FirstName: data.firstName || data.FirstName,
      LastName: data.lastName || data.LastName,
      PhoneNumber: data.phoneNumber || data.PhoneNumber,
      Email: data.email || data.Email
    };
    return await api.put("/api/musteri", payload);
  },
  delete: async (id) => {
    return await api.delete(`/api/musteri/${id}`);
  },
};

// --- VEHICLE SERVICES ---
export const vehicleService = {
  getAll: async (search = "") => {
    return await api.get(`/api/arac${search ? `?search=${search}` : ""}`);
  },
  getByCustomerId: async (cid) => {
    return await api.get(`/api/arac/musteri/${cid}`);
  },
  create: async (data) => {
    return await api.post("/api/arac", data);
  },
  update: async (data) => {
    return await api.put("/api/arac", data);
  },
  delete: async (id) => {
    return await api.delete(`/api/arac/${id}`);
  },
};

// --- TRANSACTION (İŞLEM) SERVICES ---
export const transactionService = {
  getAll: async (search = "") => {
    return await api.get(`/api/islem${search ? `?search=${search}` : ""}`);
  },
  create: async (data) => {
    return await api.post("/api/islem", data);
  },
  updateStatus: async (data) => {
    return await api.put("/api/islem/durum", data);
  },
  updateDetails: async (data) => {
    return await api.put("/api/islem/duzenle", data);
  },
  delete: async (id) => {
    return await api.delete(`/api/islem/${id}`);
  },
  getHistory: async (vehicleId) => {
    return await api.get(`/api/islem/gecmis/${vehicleId}`);
  }
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
    return await api.delete(`/api/siparis/${id}`);
  },
  search: async (text) => {
    return await api.get(`/api/siparis/ara/${encodeURIComponent(text)}`);
  },
  updateDetails: async (data) => {
    return await api.put("/api/siparis/guncelle", data);
  }
};

// --- PERSONNEL SERVICES ---
export const personnelService = {
  getAll: async (search = "") => {
    return await api.get(`/api/personel${search ? `?search=${search}` : ""}`);
  },
  create: async (data) => {
    return await api.post("/api/personel", data);
  },
  update: async (data) => {
    return await api.put("/api/personel", data);
  },
  delete: async (id) => {
    return await api.delete(`/api/personel/${id}`);
  }
};

// --- EXPENSE (GİDER/GELİR) SERVICES ---
export const expenseService = {
  getAll: async () => {
    return await api.get("/api/ek-muhasebe");
  },
  create: async (data) => {
    return await api.post("/api/ek-muhasebe", data);
  },
  update: async (data) => {
    return await api.put("/api/ek-muhasebe", data);
  },
  delete: async (id) => {
    return await api.delete(`/api/ek-muhasebe/${id}`);
  }
};

// --- ACCOUNTING SERVICES ---
export const accountingService = {
  getReport: async (startDate, endDate) => {
    return await api.get("/api/muhasebe/rapor", {
      params: { start: startDate, end: endDate }
    });
  },
  updatePayment: async (data) => {
    return await api.post("/api/muhasebe/odeme-guncelle", data);
  }
};

// --- DASHBOARD SERVICES ---
export const dashboardService = {
  getStats: async () => {
    return await api.get("/api/dashboard/ozet");
  }
};

// --- MATERIAL SERVICES ---
export const materialService = {
  getAll: async () => {
    return await api.get("/api/malzeme");
  },
  create: async (data) => {
    return await api.post("/api/malzeme", data);
  },
  update: async (data) => {
    return await api.put("/api/malzeme", data);
  },
  delete: async (id) => {
    return await api.delete(`/api/malzeme/${id}`);
  }
};

// --- SERVICE DEFINITION SERVICES ---
export const serviceDefService = {
  getAll: async () => {
    return await api.get("/api/hizmet-tanimlari");
  },
  create: async (data) => {
    return await api.post("/api/hizmet-tanimlari", data);
  }
};

export default api;
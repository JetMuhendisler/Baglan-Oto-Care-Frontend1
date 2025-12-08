import axios from 'axios';

// Backend adresin (Swagger'daki port ile aynı olmalı, örn: 7047)
const API_URL = 'https://localhost:7047/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Otomatik Token Ekleme (Her istekte yetki kontrolü yapar)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- GİRİŞ İŞLEMİ ---
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('userRole', response.data.data.role);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// --- SİPARİŞ & İŞLEM YÖNETİMİ ---
export const getOrders = async () => {
  const response = await api.get('/siparis');
  return response.data.data || []; 
};

export const createOrder = async (orderData) => {
  const response = await api.post('/siparis', orderData);
  return response.data;
};

export const searchCustomer = async (text) => {
  const response = await api.get(`/siparis/ara/${text}`);
  return response.data.data; 
};

// --- PERSONEL ---
export const getStaff = async () => {
  const response = await api.get('/personel');
  return response.data.data || [];
};

export default api;
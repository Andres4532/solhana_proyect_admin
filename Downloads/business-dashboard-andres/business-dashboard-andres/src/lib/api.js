import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'variables' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === 'file' && data[key]) {
        formData.append('file', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'variables' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (key === 'file' && data[key]) {
        formData.append('file', data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories/all'),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status, driverId) => 
    api.patch(`/orders/${id}/status`, { status, driverId }),
  getStats: (period) => api.get('/orders/stats/overview', { params: { period } }),
};

// Moto API
export const motoAPI = {
  getAll: (params) => api.get('/moto', { params }),
  getById: (id) => api.get(`/moto/${id}`),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photos' && Array.isArray(data[key])) {
        data[key].forEach(photo => {
          formData.append('files', photo);
        });
      } else if (key === 'pickupCoords' || key === 'deliveryCoords') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    return api.post('/moto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateStatus: (id, status, driverId) => 
    api.patch(`/moto/${id}/status`, { status, driverId }),
  calculatePrice: (data) => api.post('/moto/calculate-price', data),
  getAvailableDrivers: (params) => api.get('/moto/drivers/available', { params }),
  getStats: (period) => api.get('/moto/stats/overview', { params: { period } }),
};

// Dashboard API
export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getStats: (period) => api.get('/dashboard/stats', { params: { period } }),
};

export default api; 
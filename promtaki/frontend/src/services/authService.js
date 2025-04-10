import axios from 'axios';

const API_URL = 'https://5000-idx-support-system-1744308464939.cluster-6frnii43o5blcu522sivebzpii.cloudworkstations.dev/api';

// Axios instance oluşturma
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - her istekte token ekler
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Kullanıcı kaydı
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Kullanıcı girişi
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Kullanıcı çıkışı
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Mevcut kullanıcı bilgilerini getir
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Kullanıcı oturum durumunu kontrol et
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Kullanıcı rolünü kontrol et
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || null;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  getUserRole,
  api
};

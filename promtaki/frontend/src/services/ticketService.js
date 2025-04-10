import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

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

// Yeni ticket oluşturma
export const createTicket = async (ticketData) => {
  try {
    const response = await api.post('/tickets', ticketData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Kullanıcının kendi ticket'larını listeleme
export const getMyTickets = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/tickets/my?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Operatörler için ticket kuyruğunu listeleme
export const getTicketQueue = async (filters = {}, page = 1, limit = 10) => {
  try {
    let queryString = `?page=${page}&limit=${limit}`;
    
    // Filtreler
    if (filters.statusId) queryString += `&statusId=${filters.statusId}`;
    if (filters.unassigned) queryString += '&unassigned=true';
    if (filters.assignedToMe) queryString += '&assignedToMe=true';
    
    const response = await api.get(`/tickets/queue${queryString}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Tek bir ticket'ın detaylarını getirme
export const getTicketById = async (id) => {
  try {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Ticket'a operatör atama
export const assignOperator = async (ticketId, operatorId) => {
  try {
    const response = await api.put(`/tickets/${ticketId}/assign`, { operatorId });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

// Ticket durumunu güncelleme
export const updateTicketStatus = async (ticketId, statusId) => {
  try {
    const response = await api.put(`/tickets/${ticketId}/status`, { statusId });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Sunucu hatası' };
  }
};

export default {
  createTicket,
  getMyTickets,
  getTicketQueue,
  getTicketById,
  assignOperator,
  updateTicketStatus,
  api
};

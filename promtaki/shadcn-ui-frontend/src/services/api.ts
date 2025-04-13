/**
 * API iletişim servislerini içeren temel modül
 */

import axios from 'axios'

// API temel URL değeri - gerçek uygulamada .env dosyasından gelir
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

// Axios istemcisini yapılandır
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// İstek interceptor'u - her istekte token ekler
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Yanıt interceptor'u - hataları işler ve oturumla ilgili sorunları yönetir
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Oturum süresi dolmuşsa
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      // Oturum süresi dolduğunda yönlendirme yapılabilir
      // window.location.href = '/auth/login'
    }
    return Promise.reject(error)
  }
)

// Hata günlüğü yardımcı fonksiyonu
const logApiError = (method: string, url: string, error: unknown) => {
  console.error(`API ${method} Error:`, error);
  
  // Axios hata nesnesinden daha fazla bilgi çıkar
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as any; // Axios hata nesnesi
    if (axiosError.response) {
      // Sunucu yanıtı aldık ama 2xx dışında bir durum kodu
      console.error(`API ${method} Error Status:`, axiosError.response.status);
      console.error(`API ${method} Error Data:`, axiosError.response.data);
    } else if (axiosError.request) {
      // İstek yapıldı ama yanıt alınamadı
      console.error(`API ${method} No Response:`, axiosError.request);
    } else {
      // İstek oluşturulurken bir şeyler yanlış gitti
      console.error(`API ${method} Request Error:`, axiosError.message);
    }
  }
};

// API isteği wrapper'ları
export const api = {
  // GET isteği
  async get(url: string, params = {}) {
    try {
      console.log(`API GET isteği: ${url}`, { params });
      const response = await apiClient.get(url, { params });
      console.log(`API GET yanıtı: ${url}`, response.data);
      return response.data;
    } catch (error: unknown) {
      logApiError('GET', url, error);
      throw error;
    }
  },

  // POST isteği
  async post(url: string, data = {}, config = {}) {
    try {
      console.log(`API POST isteği: ${url}`, data);
      const response = await apiClient.post(url, data, config);
      console.log(`API POST yanıtı: ${url}`, response.data);
      return response.data;
    } catch (error: unknown) {
      logApiError('POST', url, error);
      throw error;
    }
  },

  // PUT isteği
  async put(url: string, data = {}, config = {}) {
    try {
      console.log(`API PUT isteği: ${url}`, data);
      const response = await apiClient.put(url, data, config);
      console.log(`API PUT yanıtı: ${url}`, response.data);
      return response.data;
    } catch (error: unknown) {
      logApiError('PUT', url, error);
      throw error;
    }
  },

  // DELETE isteği
  async delete(url: string) {
    try {
      console.log(`API DELETE isteği: ${url}`);
      const response = await apiClient.delete(url);
      console.log(`API DELETE yanıtı: ${url}`, response.data);
      return response.data;
    } catch (error: unknown) {
      logApiError('DELETE', url, error);
      throw error;
    }
  },

  // PATCH isteği
  async patch(url: string, data = {}, config = {}) {
    try {
      console.log(`API PATCH isteği: ${url}`, data);
      const response = await apiClient.patch(url, data, config);
      console.log(`API PATCH yanıtı: ${url}`, response.data);
      return response.data;
    } catch (error: unknown) {
      logApiError('PATCH', url, error);
      throw error;
    }
  },
}

export default api

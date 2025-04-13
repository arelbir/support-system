/**
 * Kullanıcı (user) işlemleri için Backend uyumlu API servisi
 * Backend modeline göre uyumlaştırılmıştır
 */

import api from './api'

// Kullanıcı rolleri için tip tanımı
export type UserRole = 'admin' | 'operator' | 'customer'

// Kullanıcı verisi için tip tanımı (backend ile uyumlu)
export interface User {
  id: number
  username: string
  email: string
  fullName?: string
  role: UserRole
  isActive: boolean  // Backend'de isActive olarak geçiyor
  company?: string
  phone?: string
  department?: string
  avatarUrl?: string
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

// Kullanıcı oluşturma için tip tanımı
export interface RegisterUserData {
  username: string
  email: string
  password: string
  fullName?: string
  role?: UserRole
  company?: string
  phone?: string
  department?: string
  avatar?: File
}

// Kullanıcı güncellemesi için tip tanımı
export interface UpdateUserData {
  username?: string
  email?: string
  fullName?: string
  role?: UserRole
  isActive?: boolean
  company?: string
  phone?: string
  department?: string
  avatar?: File
}

// Şifre değiştirme için tip tanımı
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Kimlik doğrulama yanıtı için tip tanımı
export interface AuthResponse {
  token: string
  user: User
}

// Kullanıcılarla ilgili API işlemleri (backend ile uyumlu)
const userService = {
  /**
   * Kullanıcı kaydı
   */
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    // Eğer avatar dosyası varsa, formData ile göndermemiz gerekir
    if (userData.avatar) {
      const formData = new FormData()
      
      // Temel alanları ekleyin
      Object.entries(userData).forEach(([key, value]) => {
        if (key !== 'avatar' && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      
      // Avatar'ı ekleyin
      formData.append('avatar', userData.avatar)
      
      const response = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      // Token'ı locale kaydet
      if (response.token) {
        localStorage.setItem('auth_token', response.token)
      }
      
      return response
    }
    
    // Avatar yoksa normal JSON isteği gönderebiliriz
    const response = await api.post('/auth/register', userData)
    
    // Token'ı locale kaydet
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
    }
    
    return response
  },

  /**
   * Kullanıcı oturum açma
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Login isteği yapılıyor...', { email, url: '/auth/login' });
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('API ham yanıt:', response);
      
      // API yanıtını kontrol et
      if (!response) {
        console.error('API yanıtı alınamadı (undefined)');
        throw new Error('API yanıtı alınamadı');
      }
      
      // API response { message, user, token } formatında olmalı
      const { user, token } = response;
      
      console.log('Yanıttaki user:', user);
      console.log('Yanıttaki token:', token);
      
      if (!user || !token) {
        console.error('Geçersiz API yanıt formatı:', response);
        throw new Error('Oturum açılamadı: Eksik kullanıcı bilgisi veya token');
      }
      
      // Token'ı locale kaydet
      localStorage.setItem('auth_token', token);
      console.log('Token kaydedildi');
      
      return { token, user };
    } catch (error) {
      console.error('Login işlemi sırasında hata:', error);
      throw error;
    }
  },

  /**
   * Kullanıcı çıkış yapma
   */
  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      // Token'ı locale'den kaldır
      localStorage.removeItem('auth_token')
    }
  },
  
  /**
   * Mevcut kullanıcı bilgilerini getirir
   */
  async getCurrentUser(): Promise<User> {
    try {
      console.log('getCurrentUser çağrıldı');
      const response = await api.get('/auth/me');
      console.log('Current user response tam veri:', response);
      
      // API yanıtında user objesi direkt olarak mevcut
      if (response && response.user) {
        console.log('User verileri alındı:', response.user);
        return response.user;
      } else {
        console.error('Geçerli kullanıcı yanıtında user objesi bulunamadı:', response);
        throw new Error('Kullanıcı bilgileri alınamadı: Geçersiz yanıt formatı');
      }
    } catch (error) {
      console.error('getCurrentUser fonksiyonunda hata:', error);
      throw error;
    }
  },
  
  /**
   * Tüm kullanıcıları getirir, opsiyonel olarak filtreleme yapabilir
   */
  async getUsers(params: {
    role?: UserRole | UserRole[]
    isActive?: boolean
    searchQuery?: string
    page?: number
    limit?: number
  } = {}) {
    return api.get('/users', params)
  },

  /**
   * Kullanıcı ID'sine göre tek bir kullanıcıyı getirir
   */
  async getUserById(id: number): Promise<User> {
    return api.get(`/users/${id}`)
  },

  /**
   * Yeni bir kullanıcı oluşturur (admin tarafından)
   */
  async createUser(userData: RegisterUserData): Promise<User> {
    // Eğer avatar dosyası varsa, formData ile göndermemiz gerekir
    if (userData.avatar) {
      const formData = new FormData()
      
      // Temel alanları ekleyin
      Object.entries(userData).forEach(([key, value]) => {
        if (key !== 'avatar' && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      
      // Avatar'ı ekleyin
      formData.append('avatar', userData.avatar)
      
      return api.post('/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    
    // Avatar yoksa normal JSON isteği gönderebiliriz
    return api.post('/users', userData)
  },

  /**
   * Mevcut bir kullanıcıyı günceller
   */
  async updateUser(id: number, updateData: UpdateUserData): Promise<User> {
    // Eğer avatar dosyası varsa, formData ile göndermemiz gerekir
    if (updateData.avatar) {
      const formData = new FormData()
      
      // Temel alanları ekleyin
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'avatar' && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      
      // Avatar'ı ekleyin
      formData.append('avatar', updateData.avatar)
      
      return api.put(`/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    
    // Avatar yoksa normal JSON isteği gönderebiliriz
    return api.put(`/users/${id}`, updateData)
  },

  /**
   * Bir kullanıcıyı siler
   */
  async deleteUser(id: number) {
    return api.delete(`/users/${id}`)
  },

  /**
   * Şifremi unuttum
   */
  async forgotPassword(email: string) {
    return api.post('/auth/forgot-password', { email })
  },

  /**
   * Şifre sıfırlama
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    return api.post('/auth/reset-password', { token, newPassword, confirmPassword })
  },

  /**
   * Mevcut kullanıcının şifresini değiştirir
   */
  async changePassword(data: ChangePasswordData) {
    return api.post('/auth/change-password', data)
  },
  
  /**
   * Kullanıcı durumunu günceller (aktif/inaktif)
   */
  async updateUserStatus(userId: number, isActive: boolean) {
    return api.patch(`/users/${userId}/status`, { isActive })
  },
  
  /**
   * Kullanıcı rolünü günceller
   */
  async updateUserRole(userId: number, role: UserRole) {
    return api.patch(`/users/${userId}/role`, { role })
  },
  
  /**
   * Toplu SMS/Email gönderimi için kullanıcıları listeler
   */
  async getUsersForNotification(params: {
    role?: UserRole | UserRole[]
    isActive?: boolean
    hasEmail?: boolean
    hasPhone?: boolean
    page?: number
    limit?: number
  } = {}) {
    return api.get('/users/for-notification', params)
  }
}

export default userService

/**
 * Kullanıcı (user) işlemleri için API servisi
 */

import api from './api'

// Kullanıcı rolleri için tip tanımı
export type UserRole = 'admin' | 'operator' | 'customer'

// Kullanıcı durumları için tip tanımı
export type UserStatus = 'active' | 'inactive' | 'suspended'

// Kullanıcı verisi için tip tanımı
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  department?: string
  company?: string
  phone?: string
  avatar?: string
  lastActive?: string
  createdAt: string
  updatedAt: string
}

// Kullanıcı oluşturma için tip tanımı
export interface CreateUserData {
  name: string
  email: string
  password: string
  role: UserRole
  status?: UserStatus
  department?: string
  company?: string
  phone?: string
  avatar?: File
}

// Kullanıcı güncellemesi için tip tanımı
export interface UpdateUserData {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
  department?: string
  company?: string
  phone?: string
  avatar?: File
}

// Kimlik doğrulama yanıtı için tip tanımı
export interface AuthResponse {
  token: string
  user: User
  expiresAt: string
}

// Kullanıcılarla ilgili API işlemleri
const userService = {
  /**
   * Tüm kullanıcıları getirir, opsiyonel olarak filtreleme yapabilir
   */
  async getUsers(params: {
    role?: UserRole | UserRole[]
    status?: UserStatus
    searchQuery?: string
    page?: number
    limit?: number
  } = {}) {
    return api.get('/users', params)
  },

  /**
   * Kullanıcı ID'sine göre tek bir kullanıcıyı getirir
   */
  async getUserById(id: string) {
    return api.get(`/users/${id}`)
  },

  /**
   * Yeni bir kullanıcı oluşturur
   */
  async createUser(userData: CreateUserData) {
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
  async updateUser(id: string, updateData: UpdateUserData) {
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
   * Bir kullanıcıyı siler (soft-delete gerçekleştirir)
   */
  async deleteUser(id: string) {
    return api.delete(`/users/${id}`)
  },

  /**
   * Kullanıcı oturum açma
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password })
    
    // Token'ı locale kaydet
    if (response.token) {
      localStorage.setItem('auth_token', response.token)
    }
    
    return response
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
   * Şifremi unuttum
   */
  async forgotPassword(email: string) {
    return api.post('/auth/forgot-password', { email })
  },

  /**
   * Şifre sıfırlama
   */
  async resetPassword(token: string, newPassword: string) {
    return api.post('/auth/reset-password', { token, newPassword })
  },

  /**
   * Mevcut kullanıcı bilgilerini getirir
   */
  async getCurrentUser() {
    return api.get('/auth/me')
  },

  /**
   * Mevcut kullanıcının şifresini değiştirir
   */
  async changePassword(currentPassword: string, newPassword: string) {
    return api.post('/auth/change-password', { currentPassword, newPassword })
  },
  
  /**
   * Kullanıcı durumunu günceller (aktif, inaktif veya askıya alınmış)
   */
  async updateUserStatus(userId: string, status: UserStatus) {
    return api.patch(`/users/${userId}/status`, { status })
  }
}

export default userService

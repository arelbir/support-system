/**
 * Bilet (ticket) işlemleri için Backend uyumlu API servisi
 * Backend modeline göre uyumlaştırılmıştır
 */

import api from './api'

// Bilet durumları için tip tanımı
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting_customer' | 'waiting_third_party' | 'resolved' | 'closed'

// Bilet önceliği için tip tanımı
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// Bilet verisi için tip tanımı (backend ile uyumlu)
export interface Ticket {
  id: number
  subject: string
  description: string  // Backend'de description olarak geçiyor
  priority: TicketPriority
  category?: string
  type?: string
  userId: number  // Backend'de userId olarak geçiyor
  statusId: number
  assignedOperatorId?: number  // Backend'de assignedOperatorId olarak geçiyor
  isResolved: boolean
  company?: string
  productId?: number
  moduleId?: number
  createdAt: string
  updatedAt: string
  dueDate?: string
  firstResponseDueDate?: string
  lastReplyAt?: string
  tags?: Tag[]
  Status?: Status  // Backend'de property büyük harfle başlıyor
  Product?: Product 
  Module?: Module
  product?: Product  // Backend hem Product hem product gönderebiliyor  
  module?: Module
  timeMetrics?: any  // SLA zaman metrikleri
  timeSpent?: number
  notifyEmails?: string[]
  history?: any[]
  User?: User   // Backend'de User objesi büyük harfle
  assignedOperator?: User
}

// Backend ile uyumlu alt tipler
export interface Status {
  id: number
  name: string
  description?: string
  category: 'open' | 'pending' | 'solved' | 'closed'
  color: string
  isDefault: boolean
  isActive?: boolean
  order?: number
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface Product {
  id: number
  name: string
  description?: string
}

export interface Module {
  id: number
  name: string
  description?: string
  productId: number
}

export interface User {
  id: number
  name?: string
  username?: string
  email: string
  role?: 'admin' | 'operator' | 'customer'
}

// Bilet oluşturma için tip tanımı (backend ile uyumlu)
export interface CreateTicketData {
  subject: string
  description: string  // Backend'de description olarak geçiyor
  priority: TicketPriority
  category?: string
  type?: string
  company?: string
  notifyEmails?: string[]
  productId?: number
  moduleId?: number
  tagIds?: number[]  // Backend'de tagIds olarak geçiyor
  attachments?: File[]
}

// Bilet güncellemesi için tip tanımı
export interface UpdateTicketData {
  subject?: string
  description?: string
  priority?: TicketPriority
  category?: string
  type?: string
  company?: string
  productId?: number
  moduleId?: number
}

// Operatör atama için tip tanımı
export interface AssignOperatorData {
  operatorId: number
  ticketId: number
}

// Çoklu operatör atama için tip tanımı
export interface AssignMultipleOperatorsData {
  operatorIds: number[]
  ticketId: number
  isPrimary?: boolean[]
}

// Bilet yanıtı için tip tanımı
export interface Message {
  id: number
  content: string
  ticketId: number
  userId: number
  isInternal: boolean
  attachmentUrls?: string[]
  createdAt: string
  updatedAt: string
  user?: User
}

// Bilet yanıtı oluşturma için tip tanımı
export interface CreateMessageData {
  content: string
  ticketId: number
  isInternal: boolean
  attachments?: File[]
}

// Zaman kaydı için tip tanımı
export interface TimeLog {
  id: number
  ticketId: number
  userId: number
  minutes: number
  description?: string
  createdAt: string
}

// SLA işlemleri için tip tanımları
export interface SLAPauseData {
  ticketId: number
  reason: string
}

// Biletlerle ilgili API işlemleri (backend ile uyumlu)
const ticketService = {
  /**
   * Tüm biletleri getirir, opsiyonel olarak filtreleme yapabilir
   */
  async getTickets(params: {
    status?: string | string[]
    priority?: TicketPriority | TicketPriority[]
    assignedOperatorId?: number
    userId?: number
    searchQuery?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    return api.get('/tickets', params)
  },
  
  /**
   * Bilet kuyruğunu getirir (genişletilmiş filtreleme seçenekleri ile)
   */
  async getTicketQueue(params: {
    status?: string | string[]
    priority?: TicketPriority | TicketPriority[]
    assignedOperatorId?: number
    department?: string
    userId?: number
    productId?: number
    moduleId?: number
    tagIds?: number[]
    searchQuery?: string
    hasSLAViolation?: boolean
    dueDateStart?: string
    dueDateEnd?: string
    createdAtStart?: string
    createdAtEnd?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    return api.get('/tickets/queue', params)
  },

  /**
   * Bilet ID'sine göre tek bir bileti getirir
   */
  async getTicketById(id: number) {
    const response = await api.get(`/tickets/${id}`)
    // API tek bir bileti "ticket" özelliği içinde döndürüyor, direkt bileti döndürelim
    return response.ticket
  },
  
  /**
   * Kullanıcının kendi biletlerini getirir
   */
  async getMyTickets(params: {
    status?: string | string[]
    priority?: TicketPriority | TicketPriority[]
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    try {
      // Parametreleri hazırla
      const page = params.page || 1;
      const limit = params.limit || 10;
      
      let queryString = `?page=${page}&limit=${limit}`;
      
      // Statü isimlerini ilgili ID'lere dönüştür
      // Not: Bu mapping backend'e göre güncellenmelidir
      const statusMap: Record<string, number> = {
        'open': 1,      // 'Açık' statüsü ID'si
        'pending': 2,   // 'Beklemede' statüsü ID'si
        'closed': 3     // 'Kapalı' statüsü ID'si
      };
      
      // Filtreler
      if (params.status) {
        if (Array.isArray(params.status)) {
          params.status.forEach(s => {
            // String statü adını ID'ye çevir veya olduğu gibi kullan (ID zaten sayı olarak gönderilmişse)
            const statusId = statusMap[s] || s;
            queryString += `&statusId=${statusId}`;
          });
        } else {
          // String statü adını ID'ye çevir veya olduğu gibi kullan
          const statusId = statusMap[params.status] || params.status;
          queryString += `&statusId=${statusId}`;
        }
      }
      
      if (params.priority) {
        if (Array.isArray(params.priority)) {
          params.priority.forEach(p => {
            queryString += `&priority=${p}`;
          });
        } else {
          queryString += `&priority=${params.priority}`;
        }
      }
      
      if (params.sortBy) queryString += `&sortBy=${params.sortBy}`;
      if (params.sortOrder) queryString += `&sortOrder=${params.sortOrder}`;
      
      console.log('Biletler API çağrısı:', `/tickets/my${queryString}`);
      
      // API çağrısı yap
      const response = await api.get(`/tickets/my${queryString}`);
      console.log('Biletler API yanıtı:', response);
      
      // API yanıt formatı: { tickets: [...], currentPage, totalPages, totalItems }
      const { tickets, currentPage, totalPages, totalItems } = response;
      
      if (!Array.isArray(tickets)) {
        console.error('API yanıtında biletler dizisi bulunamadı:', response);
        throw new Error('Biletler geçersiz formatta');
      }
      
      console.log(`${tickets.length} adet bilet alındı`);
      
      return {
        data: tickets,
        meta: {
          currentPage,
          totalPages,
          totalItems,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1
        }
      };
    } catch (error) {
      console.error('getMyTickets hatası:', error);
      throw error;
    }
  },

  /**
   * Yeni bir bilet oluşturur
   */
  async createTicket(ticketData: CreateTicketData) {
    // Eğer dosya ekleri varsa, formData ile göndermemiz gerekir
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      const formData = new FormData()
      
      // Temel alanları ekleyin
      Object.entries(ticketData).forEach(([key, value]) => {
        if (key !== 'attachments' && value !== undefined) {
          if (key === 'tagIds' || key === 'notifyEmails') {
            // Dizileri JSON olarak gönder
            formData.append(key, JSON.stringify(value))
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })
      
      // Dosyaları ekleyin
      ticketData.attachments.forEach(file => {
        formData.append('attachments', file)
      })
      
      return api.post('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    
    // Dosya ekleri yoksa normal JSON isteği gönderebiliriz
    return api.post('/tickets', ticketData)
  },

  /**
   * Mevcut bir bileti günceller
   */
  async updateTicket(id: number, updateData: UpdateTicketData) {
    return api.put(`/tickets/${id}`, updateData)
  },

  /**
   * Bir bileti siler
   */
  async deleteTicket(id: number) {
    return api.delete(`/tickets/${id}`)
  },

  /**
   * Bilet durumunu günceller
   */
  async updateTicketStatus(ticketId: number, statusId: number) {
    return api.put(`/tickets/${ticketId}/status`, { statusId })
  },

  /**
   * Bilete bir operatör atar
   */
  async assignOperator(data: AssignOperatorData) {
    return api.post('/tickets/assign', data)
  },

  /**
   * Bilete birden fazla operatör atar
   */
  async assignMultipleOperators(data: AssignMultipleOperatorsData) {
    return api.post('/tickets/assign-multiple', data)
  },

  /**
   * Bilete etiket ekler
   */
  async addTagsToTicket(ticketId: number, tagIds: number[]) {
    return api.post(`/tickets/${ticketId}/tags`, { tagIds })
  },

  /**
   * Biletten etiket kaldırır
   */
  async removeTagFromTicket(ticketId: number, tagId: number) {
    return api.delete(`/tickets/${ticketId}/tags/${tagId}`)
  },

  /**
   * Bir bilete zaman kaydı ekler
   */
  async addTimeLog(data: { ticketId: number, minutes: number, description?: string }) {
    return api.post('/tickets/time-log', data)
  },

  /**
   * SLA süresini duraklatır
   */
  async pauseSLA(data: SLAPauseData) {
    return api.post('/tickets/pause-sla', data)
  },

  /**
   * SLA süresini devam ettirir
   */
  async resumeSLA(ticketId: number) {
    return api.post(`/tickets/${ticketId}/resume-sla`)
  },
  
  /**
   * Bir biletteki tüm mesajları getirir
   */
  async getMessages(ticketId: number, includeInternal: boolean = false) {
    // 404 hatasını düzeltmek için endpoint yapısını değiştiriyoruz
    // İstek URL'i /tickets/63/messages yerine /messages?ticketId=63 şeklinde olmalı
    return api.get(`/messages`, { ticketId, includeInternal })
  },
  
  /**
   * Bir bilete yeni mesaj ekler
   */
  async addMessage(messageData: CreateMessageData) {
    // Eğer dosya ekleri varsa, formData ile göndermemiz gerekir
    if (messageData.attachments && messageData.attachments.length > 0) {
      const formData = new FormData()
      
      // Temel alanları ekleyin
      Object.entries(messageData).forEach(([key, value]) => {
        if (key !== 'attachments' && value !== undefined) {
          formData.append(key, value.toString())
        }
      })
      
      // Dosyaları ekleyin
      messageData.attachments.forEach(file => {
        formData.append('attachments', file)
      })
      
      return api.post('/messages', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    
    // Dosya ekleri yoksa normal JSON isteği gönderebiliriz
    return api.post('/messages', messageData)
  }
}

export default ticketService

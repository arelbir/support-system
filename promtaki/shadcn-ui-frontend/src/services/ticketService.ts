/**
 * Bilet (ticket) işlemleri için API servisi
 */

import api from './api'

// Bilet durumları için tip tanımı
export type TicketStatus = 'new' | 'assigned' | 'in_progress' | 'waiting_customer' | 'waiting_third_party' | 'resolved' | 'closed'

// Bilet önceliği için tip tanımı
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

// Bilet verisi için tip tanımı
export interface Ticket {
  id: string
  subject: string
  content: string
  status: TicketStatus
  priority: TicketPriority
  category?: string
  product?: string
  module?: string
  type?: string
  customerId: string
  customerName: string
  assignedToId?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
  lastReplyAt?: string
  dueDate?: string
  slaStatus?: 'normal' | 'warning' | 'overdue'
  tags?: string[]
  attachments?: { id: string, fileName: string, url: string }[]
}

// Bilet oluşturma için tip tanımı
export interface CreateTicketData {
  subject: string
  content: string
  priority: TicketPriority
  category?: string
  product?: string
  module?: string
  type?: string
  tags?: string[]
  attachments?: File[]
}

// Bilet güncellemesi için tip tanımı
export interface UpdateTicketData {
  subject?: string
  content?: string
  status?: TicketStatus
  priority?: TicketPriority
  category?: string
  product?: string
  module?: string
  type?: string
  assignedToId?: string
  tags?: string[]
}

// Bilet yanıtı için tip tanımı
export interface TicketReply {
  id: string
  ticketId: string
  content: string
  isInternal: boolean
  authorId: string
  authorName: string
  authorType: 'customer' | 'operator' | 'system'
  createdAt: string
  attachments?: { id: string, fileName: string, url: string }[]
}

// Bilet yanıtı oluşturma için tip tanımı
export interface CreateTicketReplyData {
  ticketId: string
  content: string
  isInternal: boolean
  attachments?: File[]
}

// Biletlerle ilgili API işlemleri
const ticketService = {
  /**
   * Tüm biletleri getirir, opsiyonel olarak filtreleme yapabilir
   */
  async getTickets(params: {
    status?: TicketStatus | TicketStatus[]
    priority?: TicketPriority | TicketPriority[]
    assignedToId?: string
    customerId?: string
    searchQuery?: string
    page?: number
    limit?: number
  } = {}) {
    return api.get('/tickets', params)
  },

  /**
   * Bilet ID'sine göre tek bir bileti getirir
   */
  async getTicketById(id: string) {
    return api.get(`/tickets/${id}`)
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
          if (typeof value === 'object') {
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
  async updateTicket(id: string, updateData: UpdateTicketData) {
    return api.put(`/tickets/${id}`, updateData)
  },

  /**
   * Bir bileti siler (soft-delete gerçekleştirir)
   */
  async deleteTicket(id: string) {
    return api.delete(`/tickets/${id}`)
  },

  /**
   * Bir bilete yeni yanıt ekler
   */
  async addReply(replyData: CreateTicketReplyData) {
    // Eğer dosya ekleri varsa, formData ile göndermemiz gerekir
    if (replyData.attachments && replyData.attachments.length > 0) {
      const formData = new FormData()
      
      // Temel alanları ekleyin
      Object.entries(replyData).forEach(([key, value]) => {
        if (key !== 'attachments' && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value))
          } else {
            formData.append(key, value.toString())
          }
        }
      })
      
      // Dosyaları ekleyin
      replyData.attachments.forEach(file => {
        formData.append('attachments', file)
      })
      
      return api.post('/ticket-replies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    
    // Dosya ekleri yoksa normal JSON isteği gönderebiliriz
    return api.post('/ticket-replies', replyData)
  },

  /**
   * Bir biletteki tüm yanıtları getirir
   */
  async getTicketReplies(ticketId: string) {
    return api.get(`/tickets/${ticketId}/replies`)
  },

  /**
   * Bir bileti belirli bir operatöre atar
   */
  async assignTicket(ticketId: string, operatorId: string) {
    return api.post(`/tickets/${ticketId}/assign`, { operatorId })
  },
  
  /**
   * Bir biletin durumunu günceller
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    return api.patch(`/tickets/${ticketId}/status`, { status })
  }
}

export default ticketService

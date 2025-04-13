/**
 * Ticket işlemleri için yardımcı fonksiyonlar
 */
const { Ticket, TicketTimeMetrics, SLA, BusinessHours, Holiday } = require('../models');
const { Op } = require('sequelize');
const { calculateDueDate } = require('./slaUtils');

/**
 * Ticket'ın SLA durumunu hesaplar
 * @param {Object} ticket - Ticket objesi
 * @param {Object} timeMetrics - TicketTimeMetrics objesi
 * @returns {Object} SLA durum bilgisi
 */
const calculateSLAStatus = (ticket, timeMetrics) => {
  // Ticket çözülmüşse SLA durumu hesaplanmaz
  if (ticket.isResolved) {
    return {
      responseStatus: 'completed',
      resolutionStatus: 'completed',
      responseRemainingTime: 0,
      resolutionRemainingTime: 0,
      responseDueDate: timeMetrics.responseDueDate,
      resolutionDueDate: timeMetrics.resolutionDueDate,
      responseOverdue: false,
      resolutionOverdue: false,
      slaPaused: false
    };
  }

  // SLA duraklatılmışsa durum bilgisi
  if (ticket.slaPaused) {
    return {
      responseStatus: timeMetrics.responseCompletedAt ? 'completed' : 'paused',
      resolutionStatus: 'paused',
      responseRemainingTime: timeMetrics.responseCompletedAt ? 0 : null,
      resolutionRemainingTime: null,
      responseDueDate: timeMetrics.responseDueDate,
      resolutionDueDate: timeMetrics.resolutionDueDate,
      responseOverdue: timeMetrics.responseCompletedAt ? false : (timeMetrics.responseDueDate && new Date() > timeMetrics.responseDueDate),
      resolutionOverdue: false,
      slaPaused: true,
      slaPausedAt: ticket.slaPausedAt,
      slaPausedReason: ticket.slaPausedReason
    };
  }

  const now = new Date();
  const responseCompleted = !!timeMetrics.responseCompletedAt;
  const responseOverdue = timeMetrics.responseDueDate && now > timeMetrics.responseDueDate;
  const resolutionOverdue = timeMetrics.resolutionDueDate && now > timeMetrics.resolutionDueDate;
  
  // İlk yanıt için kalan süre hesaplaması
  let responseRemainingTime = null;
  if (!responseCompleted && timeMetrics.responseDueDate) {
    responseRemainingTime = Math.max(0, timeMetrics.responseDueDate - now);
  }
  
  // Çözüm için kalan süre hesaplaması
  let resolutionRemainingTime = null;
  if (timeMetrics.resolutionDueDate) {
    resolutionRemainingTime = Math.max(0, timeMetrics.resolutionDueDate - now);
  }
  
  // SLA durumu
  let responseStatus = responseCompleted ? 'completed' : (responseOverdue ? 'overdue' : 'active');
  let resolutionStatus = ticket.isResolved ? 'completed' : (resolutionOverdue ? 'overdue' : 'active');
  
  return {
    responseStatus,
    resolutionStatus,
    responseRemainingTime,
    resolutionRemainingTime,
    responseDueDate: timeMetrics.responseDueDate,
    resolutionDueDate: timeMetrics.resolutionDueDate,
    responseOverdue,
    resolutionOverdue,
    slaPaused: false
  };
};

/**
 * SLA durum bilgisini insan tarafından okunabilir formata dönüştürür
 * @param {Object} slaStatus - SLA durum bilgisi
 * @returns {Object} İnsan tarafından okunabilir SLA durum bilgisi
 */
const formatSLAStatus = (slaStatus) => {
  const formatTimeRemaining = (milliseconds) => {
    if (milliseconds === null) return null;
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    let result = '';
    if (days > 0) result += `${days} gün `;
    if (hours > 0) result += `${hours} saat `;
    if (minutes > 0) result += `${minutes} dakika`;
    
    return result.trim() || '< 1 dakika';
  };
  
  // Durum açıklamaları
  const statusMap = {
    'active': 'Aktif',
    'overdue': 'Gecikmiş',
    'completed': 'Tamamlandı',
    'paused': 'Duraklatıldı'
  };
  
  return {
    responseStatus: statusMap[slaStatus.responseStatus] || slaStatus.responseStatus,
    resolutionStatus: statusMap[slaStatus.resolutionStatus] || slaStatus.resolutionStatus,
    responseRemainingTime: formatTimeRemaining(slaStatus.responseRemainingTime),
    resolutionRemainingTime: formatTimeRemaining(slaStatus.resolutionRemainingTime),
    responseDueDate: slaStatus.responseDueDate,
    resolutionDueDate: slaStatus.resolutionDueDate,
    responseOverdue: slaStatus.responseOverdue,
    resolutionOverdue: slaStatus.resolutionOverdue,
    slaPaused: slaStatus.slaPaused,
    slaPausedAt: slaStatus.slaPausedAt,
    slaPausedReason: slaStatus.slaPausedReason
  };
};

/**
 * Ticket'ın SLA süresini günceller
 * @param {Number} ticketId - Ticket ID
 * @returns {Object} Güncellenmiş SLA bilgisi
 */
const updateTicketSLATimes = async (ticketId) => {
  const ticket = await Ticket.findByPk(ticketId, {
    include: [
      {
        model: TicketTimeMetrics,
        as: 'timeMetrics'
      }
    ]
  });
  
  if (!ticket) {
    throw new Error('Ticket bulunamadı.');
  }
  
  // Ticket'a SLA tanımlanmamışsa
  if (!ticket.productId || !ticket.priorityLevel) {
    return null;
  }
  
  // İlgili SLA'yı bul
  const sla = await SLA.findOne({
    where: {
      productId: ticket.productId,
      priorityLevel: ticket.priorityLevel,
      isActive: true
    }
  });
  
  if (!sla) {
    return null;
  }
  
  // İş saatleri ve tatil günlerini getir
  const businessHours = await BusinessHours.findAll();
  const holidays = await Holiday.findAll();
  
  // Ticket oluşturulma zamanı
  const createdAt = new Date(ticket.createdAt);
  
  // Yanıt ve çözüm tarihleri
  const responseDueDate = calculateDueDate(createdAt, sla.responseTimeMinutes, businessHours, holidays);
  const resolutionDueDate = calculateDueDate(createdAt, sla.resolutionTimeMinutes, businessHours, holidays);
  
  // Mevcut time metrics var mı kontrol et
  let timeMetrics;
  if (ticket.timeMetrics) {
    // Güncelle
    timeMetrics = await ticket.timeMetrics.update({
      responseDueDate,
      resolutionDueDate,
      slaId: sla.id
    });
  } else {
    // Yeni oluştur
    timeMetrics = await TicketTimeMetrics.create({
      ticketId: ticket.id,
      responseDueDate,
      resolutionDueDate,
      slaId: sla.id
    });
  }
  
  // SLA durum bilgisini hesapla
  const slaStatus = calculateSLAStatus(ticket, timeMetrics);
  
  return {
    timeMetrics,
    slaStatus,
    formattedSLAStatus: formatSLAStatus(slaStatus)
  };
};

/**
 * Gecikmiş ticket'ları listeler
 * @param {Object} options - Filtre seçenekleri
 * @returns {Array} Gecikmiş ticket'lar
 */
const getOverdueTickets = async (options = {}) => {
  const now = new Date();
  
  const { limit = 10, productId, priorityLevel, assignedToId } = options;
  
  // Filtreler
  const ticketFilters = {
    isResolved: false,
    slaPaused: false
  };
  
  // Ürün filtresi
  if (productId) {
    ticketFilters.productId = productId;
  }
  
  // Öncelik filtresi
  if (priorityLevel) {
    ticketFilters.priorityLevel = priorityLevel;
  }
  
  // Atanmış operatör filtresi
  if (assignedToId) {
    ticketFilters.assignedToId = assignedToId;
  }
  
  // Gecikmiş ticket'ları bul
  const overdueTickets = await Ticket.findAll({
    where: ticketFilters,
    include: [
      {
        model: TicketTimeMetrics,
        as: 'timeMetrics',
        where: {
          [Op.or]: [
            { responseDueDate: { [Op.lt]: now }, responseCompletedAt: null },
            { resolutionDueDate: { [Op.lt]: now } }
          ]
        }
      }
    ],
    limit: parseInt(limit),
    order: [
      ['priorityLevel', 'DESC'],
      [{ model: TicketTimeMetrics, as: 'timeMetrics' }, 'responseDueDate', 'ASC'],
      [{ model: TicketTimeMetrics, as: 'timeMetrics' }, 'resolutionDueDate', 'ASC']
    ]
  });
  
  return overdueTickets;
};

module.exports = {
  calculateSLAStatus,
  formatSLAStatus,
  updateTicketSLATimes,
  getOverdueTickets
};

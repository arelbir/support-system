/**
 * SLA Cron Servisi
 * SLA'ların düzenli olarak kontrol edilmesini ve ihlal durumlarının işlenmesini sağlar
 */

const cron = require('node-cron');
const slaService = require('./slaService');
const { TicketTimeMetrics, Ticket, Status, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Yaklaşan SLA ihlallerini kontrol eder
 * @returns {Array} İhlali yaklaşan biletler
 */
const checkUpcomingSLABreaches = async () => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  
  // Bir saat içinde SLA'sı dolacak biletleri bul
  const upcomingResponseBreaches = await TicketTimeMetrics.findAll({
    where: {
      slaResponseDue: {
        [Op.between]: [now, oneHourLater] 
      },
      slaResponseBreached: false,
      firstResponseAt: null,
      currentlyPaused: false
    },
    include: [
      {
        model: Ticket,
        as: 'ticket',
        include: [
          {
            model: User,
            as: 'assignedOperator',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Status
          }
        ]
      }
    ]
  });
  
  console.log(`${upcomingResponseBreaches.length} adet yaklaşan ilk yanıt SLA ihlali tespit edildi.`);
  
  // Bir saat içinde çözüm SLA'sı dolacak biletleri bul
  const upcomingResolutionBreaches = await TicketTimeMetrics.findAll({
    where: {
      slaResolutionDue: {
        [Op.between]: [now, oneHourLater] 
      },
      slaResolutionBreached: false,
      resolvedAt: null,
      currentlyPaused: false
    },
    include: [
      {
        model: Ticket,
        as: 'ticket',
        include: [
          {
            model: User,
            as: 'assignedOperator',
            attributes: ['id', 'username', 'email']
          },
          {
            model: Status
          }
        ]
      }
    ]
  });
  
  console.log(`${upcomingResolutionBreaches.length} adet yaklaşan çözüm SLA ihlali tespit edildi.`);
  
  // TODO: Yaklaşan SLA ihlalleri için bildirim gönder
  // Operatörlere bildirim, eposta vs.
  
  return [...upcomingResponseBreaches, ...upcomingResolutionBreaches];
};

/**
 * Tüm biletlerin SLA metriklerini kontrol eder ve günler
 * @returns {Object} İşlem sonuçları
 */
const runDailyCheck = async () => {
  const results = {
    totalTickets: 0,
    processedTickets: 0,
    errors: []
  };

  try {
    // İşlenmemiş biletleri bul (SLA metrikleri eksik olanlar)
    const tickets = await Ticket.findAll({
      where: {
        isResolved: false
      },
      include: [
        {
          model: TicketTimeMetrics,
          required: false
        }
      ]
    });
    
    results.totalTickets = tickets.length;
    
    // SLA atanmamış biletlere SLA ata
    for (const ticket of tickets) {
      try {
        if (!ticket.TicketTimeMetrics || 
            (!ticket.TicketTimeMetrics.slaResponseDue && !ticket.TicketTimeMetrics.slaResolutionDue)) {
          await slaService.assignSLAToTicket(ticket);
        }
        results.processedTickets++;
      } catch (error) {
        results.errors.push({
          ticketId: ticket.id,
          error: error.message
        });
      }
    }

    // SLA ihlallerini kontrol et
    const breaches = await slaService.checkSLABreaches();
    results.slaBreachers = breaches.length;

    return results;
  } catch (error) {
    console.error('Günlük SLA kontrolü hatası:', error);
    throw error;
  }
};

/**
 * SLA cron işlerini başlatır
 */
const startSLACronJobs = () => {
  // Her 15 dakikada bir SLA ihlallerini kontrol et
  cron.schedule('*/15 * * * *', async () => {
    console.log('[SLA Cron] SLA ihlallerini kontrol ediyor...');
    try {
      const breaches = await slaService.checkSLABreaches();
      console.log(`[SLA Cron] ${breaches.length} adet SLA ihlali işlendi.`);
      
      // Yaklaşan SLA ihlallerini de kontrol et
      const upcomingBreaches = await checkUpcomingSLABreaches();
      console.log(`[SLA Cron] ${upcomingBreaches.length} adet yaklaşan SLA ihlali tespit edildi.`);
    } catch (error) {
      console.error('[SLA Cron] SLA ihlali kontrolü hatası:', error);
    }
  });
  
  // Her gece yarısı tüm biletlerin SLA durumunu kontrol et
  cron.schedule('0 0 * * *', async () => {
    console.log('[SLA Cron] Günlük SLA kontrolü başlatılıyor...');
    try {
      const results = await runDailyCheck();
      console.log(`[SLA Cron] Günlük SLA kontrolü tamamlandı. ${results.totalTickets} bilet kontrol edildi, ${results.processedTickets} bilet işlendi, ${results.errors.length} hata oluştu.`);
    } catch (error) {
      console.error('[SLA Cron] Günlük SLA kontrolü hatası:', error);
    }
  });
  
  console.log('SLA cron işleri başlatıldı.');
};

module.exports = {
  startSLACronJobs,
  checkUpcomingSLABreaches,
  runDailyCheck
};

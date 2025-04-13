/**
 * SLA atama ve izleme servisi
 * Bu servis, biletlere otomatik SLA atama ve SLA ihlallerini izleme işlevlerini sağlar
 */

const { SLA, TicketTimeMetrics, BusinessHours, Holiday, Ticket, User } = require('../models');
const { sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;
const { calculateSLADueDates } = require('./slaUtils');

/**
 * Bilete SLA kurallarını otomatik olarak atar
 * @param {Object} ticket - Bilet objesi veya bilet ID'si
 * @param {Boolean} forceUpdate - Mevcut SLA'yı yeniden hesapla
 * @param {Object} transaction - Sequelize transaction objesi
 * @returns {Object} Hesaplanan SLA süreleri
 */
const assignSLAToTicket = async (ticket, forceUpdate = false, transaction = null) => {
  try {
    let ticketData;
    
    // Eğer ticket bir sayı ise, ticket ID olarak kabul et ve bileti getir
    if (typeof ticket === 'number') {
      ticketData = await Ticket.findByPk(ticket, { transaction });
      if (!ticketData) {
        throw new Error(`ID'si ${ticket} olan bilet bulunamadı.`);
      }
    } else {
      ticketData = ticket;
    }

    // Mevcut SLA metriklerini kontrol et (güncelleme yoksa)
    if (!forceUpdate) {
      const existingMetrics = await TicketTimeMetrics.findOne({
        where: { ticketId: ticketData.id },
        transaction
      });
      
      // Zaten SLA süreleri atanmışsa ve zorla güncelleme istenmediyse çık
      if (existingMetrics && existingMetrics.slaResponseDue && existingMetrics.slaResolutionDue) {
        console.log(`Bilet #${ticketData.id} için SLA zaten atanmış. Atlıyorum.`);
        return {
          responseDueDate: existingMetrics.slaResponseDue,
          resolutionDueDate: existingMetrics.slaResolutionDue
        };
      }
    }

    // İlgili ürün ve öncelik için SLA kuralını bul
    const slaRule = await SLA.findOne({
      where: {
        productId: ticketData.productId,
        priorityLevel: ticketData.priority,
        isActive: true
      },
      transaction
    });

    // İş saatleri ve tatilleri getir
    const businessHours = await BusinessHours.findAll({ transaction });
    const holidays = await Holiday.findAll({ transaction });

    // Varsayılan SLA süreleri (eğer özel kural bulunamazsa)
    const defaultResponseTimes = {
      low: 480, // 8 saat (dakika cinsinden)
      medium: 240, // 4 saat
      high: 60, // 1 saat
      urgent: 30 // 30 dakika
    };

    const defaultResolutionTimes = {
      low: 2880, // 48 saat (dakika cinsinden)
      medium: 1440, // 24 saat
      high: 720, // 12 saat
      urgent: 240 // 4 saat
    };

    // SLA hesaplama
    const responseTime = slaRule?.responseTimeMinutes || defaultResponseTimes[ticketData.priority];
    const resolutionTime = slaRule?.resolutionTimeMinutes || defaultResolutionTimes[ticketData.priority];
    const businessHoursOnly = slaRule?.businessHoursOnly ?? true;

    // SLA son tarihlerini hesapla
    const { responseDueDate, resolutionDueDate } = calculateSLADueDates(
      new Date(ticketData.createdAt),
      responseTime,
      resolutionTime,
      businessHoursOnly,
      businessHours,
      holidays
    );

    // TicketTimeMetrics'i güncelle
    const [metrics, created] = await TicketTimeMetrics.findOrCreate({
      where: { ticketId: ticketData.id },
      defaults: {
        ticketId: ticketData.id,
        slaResponseDue: responseDueDate,
        slaResolutionDue: resolutionDueDate,
        slaResponseBreached: false,
        slaResolutionBreached: false,
        currentlyPaused: false,
        totalPausedTimeMinutes: 0,
        pauseHistory: []
      },
      transaction
    });

    if (!created) {
      await metrics.update({
        slaResponseDue: responseDueDate,
        slaResolutionDue: resolutionDueDate
      }, { transaction });
    }

    console.log(`Bilet #${ticketData.id} için SLA atandı: İlk yanıt: ${responseDueDate}, Çözüm: ${resolutionDueDate}`);
    return { responseDueDate, resolutionDueDate };
  } catch (error) {
    console.error(`Ticket #${typeof ticket === 'object' ? ticket.id : ticket} için SLA atama hatası:`, error);
    throw error;
  }
};

/**
 * SLA ihlali kontrolü yapar ve işaretler
 * @param {Date} currentTime - Şimdiki zaman (test için override edilebilir)
 * @param {Object} transaction - Sequelize transaction objesi
 * @returns {Array} İhlal edilen biletler
 */
const checkSLABreaches = async (currentTime = new Date(), transaction = null) => {
  try {
    // İhlal edilmiş fakat işaretlenmemiş yanıt SLA'larını bul
    const responseBreaches = await TicketTimeMetrics.findAll({
      where: {
        slaResponseDue: { [Op.lt]: currentTime }, // Süresi geçmiş
        slaResponseBreached: false, // Henüz işaretlenmemiş
        currentlyPaused: false // Duraklatılmamış
      },
      include: [
        {
          model: Ticket,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ],
      transaction
    });

    // Yanıt SLA ihlali bildirimleri
    for (const metric of responseBreaches) {
      // İhlal olarak işaretle
      await metric.update({ slaResponseBreached: true }, { transaction });
      
      // TODO: Bildirim gönder
      console.log(`İlk yanıt SLA ihlali: Bilet #${metric.ticketId}`);
    }

    // İhlal edilmiş fakat işaretlenmemiş çözüm SLA'larını bul
    const resolutionBreaches = await TicketTimeMetrics.findAll({
      where: {
        slaResolutionDue: { [Op.lt]: currentTime }, // Süresi geçmiş
        slaResolutionBreached: false, // Henüz işaretlenmemiş
        currentlyPaused: false // Duraklatılmamış
      },
      include: [
        {
          model: Ticket,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'email']
            }
          ]
        }
      ],
      transaction
    });

    // Çözüm SLA ihlali bildirimleri
    for (const metric of resolutionBreaches) {
      // İhlal olarak işaretle
      await metric.update({ slaResolutionBreached: true }, { transaction });
      
      // TODO: Bildirim gönder
      console.log(`Çözüm SLA ihlali: Bilet #${metric.ticketId}`);
    }

    return [...responseBreaches, ...resolutionBreaches];
  } catch (error) {
    console.error('SLA ihlali kontrolü hatası:', error);
    throw error;
  }
};

/**
 * Bilet SLA'sını duraklatır
 * @param {Number} ticketId - Bilet ID
 * @param {String} reason - Duraklatma nedeni
 * @param {Object} transaction - Sequelize transaction objesi
 * @returns {Object} Güncellenen TimeMetrics
 */
const pauseSLA = async (ticketId, reason, transaction = null) => {
  try {
    const metrics = await TicketTimeMetrics.findOne({
      where: { ticketId },
      transaction
    });

    if (!metrics) {
      throw new Error(`Bilet #${ticketId} için zaman metrikleri bulunamadı.`);
    }

    // Zaten duraklatılmışsa hata ver
    if (metrics.currentlyPaused) {
      throw new Error(`Bilet #${ticketId} için SLA zaten duraklatılmış.`);
    }

    // Duraklatma geçmişini güncelle
    const pauseHistory = [...(metrics.pauseHistory || [])];
    pauseHistory.push({
      startTime: new Date(),
      reason: reason || 'Manuel duraklatma'
    });

    // Metrikleri güncelle
    await metrics.update({
      currentlyPaused: true,
      pauseHistory
    }, { transaction });

    console.log(`Bilet #${ticketId} için SLA duraklatıldı. Neden: ${reason}`);
    return metrics;
  } catch (error) {
    console.error('SLA duraklatma hatası:', error);
    throw error;
  }
};

/**
 * Bilet SLA'sını devam ettirir
 * @param {Number} ticketId - Bilet ID
 * @param {Object} transaction - Sequelize transaction objesi
 * @returns {Object} Güncellenen TimeMetrics
 */
const resumeSLA = async (ticketId, transaction = null) => {
  try {
    const metrics = await TicketTimeMetrics.findOne({
      where: { ticketId },
      transaction
    });

    if (!metrics) {
      throw new Error(`Bilet #${ticketId} için zaman metrikleri bulunamadı.`);
    }

    // Duraklatılmamışsa hata ver
    if (!metrics.currentlyPaused) {
      throw new Error(`Bilet #${ticketId} için SLA duraklatılmamış.`);
    }

    // Duraklatma geçmişini güncelle
    const pauseHistory = [...(metrics.pauseHistory || [])];
    const lastPause = pauseHistory[pauseHistory.length - 1];
    
    if (lastPause && !lastPause.endTime) {
      const now = new Date();
      const startTime = new Date(lastPause.startTime);
      
      // Duraklatma süresini dakika cinsinden hesapla
      const pauseTimeMinutes = Math.floor((now - startTime) / (1000 * 60));
      
      // Son duraklatmayı güncelle
      lastPause.endTime = now;
      lastPause.durationMinutes = pauseTimeMinutes;
      
      // Toplam duraklatma süresini güncelle
      const totalPausedTimeMinutes = (metrics.totalPausedTimeMinutes || 0) + pauseTimeMinutes;
      
      // SLA son tarihlerini uzat
      let slaResponseDue = metrics.slaResponseDue;
      let slaResolutionDue = metrics.slaResolutionDue;
      
      // SLA henüz dolmadıysa süreyi uzat
      if (slaResponseDue && slaResponseDue > startTime && !metrics.slaResponseBreached) {
        slaResponseDue = new Date(slaResponseDue.getTime() + pauseTimeMinutes * 60 * 1000);
      }
      
      if (slaResolutionDue && slaResolutionDue > startTime && !metrics.slaResolutionBreached) {
        slaResolutionDue = new Date(slaResolutionDue.getTime() + pauseTimeMinutes * 60 * 1000);
      }
      
      // Metrikleri güncelle
      await metrics.update({
        currentlyPaused: false,
        pauseHistory,
        totalPausedTimeMinutes,
        slaResponseDue,
        slaResolutionDue
      }, { transaction });
      
      console.log(`Bilet #${ticketId} için SLA devam ettiriliyor. Duraklatma süresi: ${pauseTimeMinutes} dakika`);
    } else {
      // Geçmişte duraklatma bulunamadı veya zaten kapatılmış
      await metrics.update({
        currentlyPaused: false
      }, { transaction });
      
      console.log(`Bilet #${ticketId} için SLA devam ettiriliyor.`);
    }
    
    return metrics;
  } catch (error) {
    console.error('SLA devam ettirme hatası:', error);
    throw error;
  }
};

/**
 * İlk yanıt verildiğinde SLA günceller
 * @param {Number} ticketId - Bilet ID
 * @param {Number} responderId - Yanıt veren kullanıcı ID
 * @param {Object} transaction - Sequelize transaction objesi
 * @returns {Object} Güncellenen TimeMetrics
 */
const recordFirstResponse = async (ticketId, responderId, transaction = null) => {
  try {
    const metrics = await TicketTimeMetrics.findOne({
      where: { ticketId },
      transaction
    });

    if (!metrics) {
      throw new Error(`Bilet #${ticketId} için zaman metrikleri bulunamadı.`);
    }

    // İlk yanıt zaten kaydedilmişse güncelleme
    if (metrics.firstResponseAt) {
      return metrics;
    }

    // Şimdiki zamanı kaydet
    const now = new Date();
    
    // Yanıt SLA'sı aşıldı mı kontrol et
    const slaResponseBreached = metrics.slaResponseDue && now > metrics.slaResponseDue;
    
    // Metrikleri güncelle
    await metrics.update({
      firstResponseAt: now,
      slaResponseBreached: slaResponseBreached
    }, { transaction });
    
    console.log(`Bilet #${ticketId} için ilk yanıt kaydedildi.`);
    return metrics;
  } catch (error) {
    console.error('İlk yanıt kaydı hatası:', error);
    throw error;
  }
};

module.exports = {
  assignSLAToTicket,
  checkSLABreaches,
  pauseSLA,
  resumeSLA,
  recordFirstResponse
};

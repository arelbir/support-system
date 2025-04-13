const { Ticket, User, Message, Tag, TimeLog, SLA, TicketTimeMetrics, sequelize } = require('../models');
const { Op, fn, col, literal, where } = require('sequelize');
const reportService = require('../utils/reportService');
const fs = require('fs');
const path = require('path');

// Özelleştirilmiş rapor üret
exports.generateCustomReport = async (req, res) => {
  try {
    const { startDate, endDate, interval = 'custom', includeDetails = false } = req.body;
    
    // Tarih kontrolü
    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Başlangıç ve bitiş tarihleri gereklidir.'
      });
    }
    
    // Raporu oluştur
    const report = await reportService.generateTicketReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      interval,
      userId: req.user.id
    });
    
    res.status(200).json({
      message: 'Rapor başarıyla oluşturuldu.',
      report
    });
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    res.status(500).json({
      message: 'Rapor oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yanıtsız bilet raporu
exports.getUnrespondedTickets = async (req, res) => {
  try {
    const { thresholdHours = 24 } = req.query;
    
    // Yanıtsız biletleri getir
    const unrespondedTickets = await reportService.generateUnrespondedTicketsReport({
      thresholdHours: parseInt(thresholdHours, 10) || 24
    });
    
    res.status(200).json({
      unrespondedTickets,
      count: unrespondedTickets.length,
      thresholdHours: parseInt(thresholdHours, 10) || 24
    });
  } catch (error) {
    console.error('Yanıtsız bilet raporu hatası:', error);
    res.status(500).json({
      message: 'Yanıtsız bilet raporu oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// İstatistik özeti
exports.getDashboardStats = async (req, res) => {
  try {
    // Zaman aralığı için filtreler
    const { period = 'week' } = req.query;
    
    let startDate = new Date();
    const endDate = new Date();
    
    // Zaman aralığını ayarla
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }
    
    // Tarih aralığı filtresi
    const dateFilter = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    // Status modeli üzerinden kapalı ve çözülmüş durum ID'lerini al
    let closedResolvedStatusIds = [];
    try {
      const closedResolvedStatuses = await sequelize.models.Status.findAll({
        where: {
          name: {
            [Op.in]: ['Kapatıldı', 'Çözüldü', 'closed', 'resolved', 'kapalı', 'çözüldü']  // Tam tablodaki adlar eklendi
          }
        },
        attributes: ['id']
      });
      
      if (closedResolvedStatuses && closedResolvedStatuses.length > 0) {
        closedResolvedStatusIds = closedResolvedStatuses.map(status => status.id);
      } else {
        // Hiç statü bulunamadığında, tüm statüleri çek ve ilk 2'sini varsayılan olarak kullan
        console.warn('Kapalı veya çözüldü statüleri bulunamadı! Tüm statüler getiriliyor...');
        const allStatuses = await sequelize.models.Status.findAll({
          attributes: ['id', 'name']
        });
        
        if (allStatuses && allStatuses.length > 0) {
          console.log('Sistemdeki tüm statüler:', allStatuses.map(s => `${s.id}: ${s.name}`).join(', '));
          // Varsayılan olarak ilk iki statüyü kullan (sıralamaya göre)
          closedResolvedStatusIds = allStatuses.slice(0, 2).map(status => status.id);
        } else {
          console.error('Hiç statü bulunamadı! Raporlama doğru çalışmayabilir.');
        }
      }
    } catch (error) {
      console.error('Statü bilgileri alınırken hata:', error);
    }
    
    // 1. Bilet sayıları
    const totalTickets = await Ticket.count({
      where: dateFilter
    });
    
    let openTicketsWhere = { ...dateFilter };
    let closedResolvedWhere = { ...dateFilter };
    
    // statusId filtresini güvenli şekilde ekle
    if (closedResolvedStatusIds.length > 0) {
      openTicketsWhere.statusId = { [Op.notIn]: closedResolvedStatusIds };
      closedResolvedWhere.statusId = { [Op.in]: closedResolvedStatusIds };
    }
    
    const openTickets = await Ticket.count({
      where: openTicketsWhere
    });
    
    const resolvedTickets = await Ticket.count({
      where: closedResolvedWhere
    });
    
    const closedTickets = await Ticket.count({
      where: closedResolvedWhere
    });
    
    // 2. SLA İstatistikleri
    const slaBreaches = await TicketTimeMetrics.count({
      where: {
        [Op.or]: [
          { slaResponseBreached: true },
          { slaResolutionBreached: true }
        ]
      },
      include: [{
        model: Ticket,
        as: 'Ticket',  
        where: dateFilter,
        attributes: []
      }]
    });
    
    // 3. Etiket İstatistikleri
    const tagStats = await Tag.findAll({
      attributes: [
        'id',
        'name',
        'color',
        'category',
        [fn('COUNT', col('tickets.id')), 'ticketCount']
      ],
      include: [{
        model: Ticket,
        as: 'tickets',  
        where: dateFilter,
        attributes: [],
        through: { attributes: [] }
      }],
      group: ['Tag.id'],
      having: literal('COUNT("tickets"."id") > 0'),
      order: [[fn('COUNT', col('tickets.id')), 'DESC']],
      limit: 10
    });
    
    // 4. Günlük Trend
    const dailyStats = await Ticket.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'day', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'count']
      ],
      where: dateFilter,
      group: [fn('DATE_TRUNC', 'day', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'day', col('createdAt')), 'ASC']],
      raw: true
    });
    
    // 5. Operatör İstatistikleri
    const operatorStats = await Ticket.findAll({
      attributes: [
        'assignedOperatorId',
        [fn('COUNT', col('Ticket.id')), 'ticketCount'],  
        // closedResolvedStatusIds güvenli kontrolü
        [fn('SUM', literal(closedResolvedStatusIds.length > 0 
          ? `CASE WHEN "Ticket"."statusId" IN (${closedResolvedStatusIds.join(',')}) THEN 1 ELSE 0 END` 
          : '0')), 'resolvedCount']
      ],
      where: {
        ...dateFilter,
        assignedOperatorId: { [Op.not]: null }
      },
      include: [
        {
          model: User,
          as: 'assignedOperator',
          attributes: ['username']
        }
      ],
      group: ['assignedOperatorId', 'assignedOperator.id', 'assignedOperator.username'],
      having: literal('COUNT("Ticket"."id") > 0'),  
      raw: false
    });
    
    // Sonuçları formatla
    const results = {
      ticketStats: {
        total: totalTickets,
        open: openTickets,
        resolved: resolvedTickets,
        closed: closedTickets,
        resolutionRate: totalTickets > 0 ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100) : 0
      },
      slaStats: {
        totalBreaches: slaBreaches,
        breachRate: totalTickets > 0 ? Math.round((slaBreaches / totalTickets) * 100) : 0
      },
      tagStats: tagStats.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        category: tag.category,
        count: parseInt(tag.dataValues.ticketCount, 10)
      })),
      operatorStats: operatorStats.map(op => ({
        id: op.assignedOperatorId,
        name: op.assignedOperator ? op.assignedOperator.username : 'Bilinmeyen',
        ticketCount: parseInt(op.dataValues.ticketCount, 10),
        resolvedCount: parseInt(op.dataValues.resolvedCount, 10),
        resolutionRate: parseInt(op.dataValues.ticketCount, 10) > 0 ? 
          Math.round((parseInt(op.dataValues.resolvedCount, 10) / parseInt(op.dataValues.ticketCount, 10)) * 100) : 0
      })),
      dailyTrend: dailyStats.map(day => ({
        date: day.date,
        count: parseInt(day.count, 10)
      })),
      period,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
    
    res.status(200).json(results);
  } catch (error) {
    console.error('Dashboard istatistikleri hatası:', error);
    res.status(500).json({
      message: 'İstatistikler alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// PDF raporunu indir
exports.downloadReport = async (req, res) => {
  try {
    const { reportPath } = req.params;
    
    // Geçerli bir rapor dosya yolu olup olmadığını kontrol et
    if (!reportPath || !reportPath.endsWith('.pdf')) {
      return res.status(400).json({
        message: 'Geçersiz rapor dosyası.'
      });
    }
    
    // Dosya yolunu oluştur
    const fullPath = path.join(__dirname, '../reports', reportPath);
    
    // Dosyanın var olup olmadığını kontrol et
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        message: 'Rapor dosyası bulunamadı.'
      });
    }
    
    // PDF dosyasını indir
    res.download(fullPath);
  } catch (error) {
    console.error('Rapor indirme hatası:', error);
    res.status(500).json({
      message: 'Rapor indirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Rapor bildirimlerini listele
exports.getReportNotifications = async (req, res) => {
  try {
    // Kullanıcının rapor bildirimlerini getir
    const notifications = await sequelize.models.Notification.findAll({
      where: {
        userId: req.user.id,
        type: 'report',
        readAt: null
      },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Rapor bildirimleri hatası:', error);
    res.status(500).json({
      message: 'Rapor bildirimleri alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

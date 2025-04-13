/**
 * Otomatik rapor oluşturma ve gönderme servisi
 */
const { Op, fn, col, literal } = require('sequelize');
const { Ticket, User, Message, Tag, TimeLog, SLA, TicketTimeMetrics, Status } = require('../models');
const notificationService = require('./notificationService');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

/**
 * Belirli bir zaman aralığı için bilet istatistikleri raporu oluşturur
 * @param {Object} options - Rapor seçenekleri
 * @param {Date} options.startDate - Başlangıç tarihi
 * @param {Date} options.endDate - Bitiş tarihi
 * @param {String} options.interval - Aralık (daily, weekly, monthly)
 * @param {Number} options.userId - Raporu alacak kullanıcı ID
 * @returns {Object} Oluşturulan rapor bilgileri
 */
const generateTicketReport = async (options) => {
  try {
    const { startDate, endDate, interval, userId } = options;
    
    // Zaman aralığı kontrolü
    if (!startDate || !endDate) {
      throw new Error('Başlangıç ve bitiş tarihleri belirtilmelidir.');
    }
    
    // Tarih aralığı filtresi
    const dateFilter = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    };
    
    // 1. Genel bilet istatistikleri
    const totalTickets = await Ticket.count({
      where: dateFilter
    });
    
    // Öncelikle Status modelinden 'closed' ve 'resolved' statülerinin ID'lerini bulma
    let closedResolvedStatusIds = [];
    try {
      const closedResolvedStatuses = await Status.findAll({
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
        const allStatuses = await Status.findAll({
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
      where: {
        ...dateFilter,
        statusId: closedResolvedStatusIds[0]
      }
    });
    
    // 2. Yanıt istatistikleri
    let avgResponseMinutes = 0;
    let avgResolutionMinutes = 0;
    
    try {
      const responseResult = await TicketTimeMetrics.findAll({
        attributes: [
          [fn('AVG', 
            literal('EXTRACT(EPOCH FROM "TicketTimeMetrics"."firstResponseAt" - "Ticket"."createdAt") / 60')
          ), 'avgResponseMinutes']
        ],
        where: {
          firstResponseAt: { [Op.not]: null }
        },
        include: [{
          model: Ticket,
          as: 'Ticket',  // Alias belirtiyoruz
          where: dateFilter,
          attributes: []
        }],
        raw: true
      });
      
      if (responseResult && responseResult.length > 0 && responseResult[0].avgResponseMinutes !== null) {
        avgResponseMinutes = parseFloat(responseResult[0].avgResponseMinutes) || 0;
      }
    } catch (error) {
      console.error('Yanıt süresi hesaplama hatası:', error);
      // Hata durumunda varsayılan değerleri kullan
    }
    
    try {
      const resolutionResult = await TicketTimeMetrics.findAll({
        attributes: [
          [fn('AVG', 
            literal('EXTRACT(EPOCH FROM "TicketTimeMetrics"."resolvedAt" - "Ticket"."createdAt") / 60')
          ), 'avgResolutionMinutes']
        ],
        where: {
          resolvedAt: { [Op.not]: null }
        },
        include: [{
          model: Ticket,
          as: 'Ticket',  // Alias belirtiyoruz
          where: dateFilter,
          attributes: []
        }],
        raw: true
      });
      
      if (resolutionResult && resolutionResult.length > 0 && resolutionResult[0].avgResolutionMinutes !== null) {
        avgResolutionMinutes = parseFloat(resolutionResult[0].avgResolutionMinutes) || 0;
      }
    } catch (error) {
      console.error('Çözüm süresi hesaplama hatası:', error);
      // Hata durumunda varsayılan değerleri kullan
    }
    
    // 3. SLA istatistikleri
    let slaBreaches = 0;
    
    try {
      slaBreaches = await TicketTimeMetrics.count({
        where: {
          [Op.or]: [
            { slaResponseBreached: true },
            { slaResolutionBreached: true }
          ]
        },
        include: [{
          model: Ticket,
          as: 'Ticket',  // Alias belirtiyoruz
          where: dateFilter,
          attributes: []
        }]
      });
    } catch (error) {
      console.error('SLA ihlal sayısı hesaplama hatası:', error);
    }
    
    // 4. Operatör istatistikleri
    const operatorStats = await Ticket.findAll({
      attributes: [
        'assignedOperatorId',
        [fn('COUNT', col('Ticket.id')), 'ticketCount'],  // Tabloya spesifik ref
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
          attributes: ['username', 'email']
        },
        {
          model: TicketTimeMetrics,
          as: 'timeMetrics',  // Alias belirtiyoruz
          attributes: [],
          required: false
        }
      ],
      group: ['assignedOperatorId', 'assignedOperator.id', 'assignedOperator.username', 'assignedOperator.email'],
      having: literal('COUNT("Ticket"."id") > 0'),  // Tabloya spesifik ref
      order: [[col('ticketCount'), 'DESC']]
    });
    
    // 5. Etiket istatistikleri
    const tagStats = await Tag.findAll({
      attributes: [
        'id',
        'name',
        'color',
        'category',
        [fn('COUNT', col('tickets->TicketTag.tagId')), 'ticketCount']
      ],
      include: [{
        model: Ticket,
        as: 'tickets',
        attributes: [],
        through: { 
          attributes: []
        },
        where: dateFilter,
        required: true
      }],
      group: ['Tag.id', 'Tag.name', 'Tag.color', 'Tag.category'],
      order: [[literal('ticketCount'), 'DESC']],
      limit: 10
    });
    

    // Rapor nesnesi oluştur
    const report = {
      period: {
        interval,
        startDate,
        endDate
      },
      summary: {
        totalTickets,
        openTickets,
        resolvedTickets,
        closedTickets,
        resolutionRate: totalTickets > 0 ? Math.round(((resolvedTickets + closedTickets) / totalTickets) * 100) : 0
      },
      responseTimes: {
        averageFirstResponse: Math.round(avgResponseMinutes) || 0,
        averageResolution: Math.round(avgResolutionMinutes) || 0
      },
      sla: {
        totalBreaches: slaBreaches,
        breachRate: totalTickets > 0 ? Math.round((slaBreaches / totalTickets) * 100) : 0
      },
      operators: operatorStats.map(stat => ({
        id: stat.assignedOperatorId,
        name: stat.assignedOperator?.username || 'Bilinmeyen',
        email: stat.assignedOperator?.email || '',
        ticketCount: parseInt(stat.dataValues.ticketCount, 10),
        avgResolutionHours: Math.round(stat.dataValues.avgResolutionHours || 0)
      })),
      tags: tagStats.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        category: tag.category,
        ticketCount: parseInt(tag.dataValues.ticketCount, 10)
      }))
    };
    
    // Kullanıcıya bildirim gönder
    if (userId) {
      await notifyReportReady(report, userId);
    }
    
    console.log(`${interval} raporu oluşturuldu - ${startDate.toISOString()} - ${endDate.toISOString()}`);
    
    return report;
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Yanıtsız biletler listesi oluşturur ve hatırlatma gönderir
 * @param {Object} options - Rapor seçenekleri
 * @param {Number} options.thresholdHours - Eşik saati (bu süreden fazla yanıtsız kalmışsa)
 * @returns {Array} Yanıtsız biletler listesi
 */
const generateUnrespondedTicketsReport = async (options) => {
  try {
    const { thresholdHours = 24 } = options;
    
    // Eşik tarihi
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - thresholdHours);
    
    // Yanıtsız biletleri bul
    const unrespondedTickets = await Ticket.findAll({
      attributes: ['id', 'subject', 'createdAt', 'userId', 'assignedOperatorId', 'statusId'],
      where: {
        statusId: { [Op.notIn]: [1, 2] },
        updatedAt: { [Op.lt]: thresholdDate }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email']
        },
        {
          model: User,
          as: 'assignedOperator',
          attributes: ['username', 'email']
        },
        {
          model: Status,
          as: 'status',
          attributes: ['name', 'color']
        }
      ],
      order: [['updatedAt', 'ASC']]
    });
    
    // Her bilet için son mesaj gönderen kontrolü
    const result = await Promise.all(unrespondedTickets.map(async (ticket) => {
      // Son mesajı kontrol et
      const lastMessage = ticket.Messages && ticket.Messages.length > 0 ? ticket.Messages[0] : null;
      const lastMessageByCustomer = lastMessage ? lastMessage.senderId === ticket.userId : true;
      
      // Hatırlatma gönder
      if (lastMessageByCustomer && ticket.assignedOperatorId) {
        await notificationService.createNotification({
          userId: ticket.assignedOperatorId,
          title: `Yanıtsız Bilet Hatırlatması: #${ticket.id}`,
          message: `"${ticket.subject}" konulu bilet ${thresholdHours} saatten uzun süredir yanıt bekliyor.`,
          type: 'reminder',
          priority: 'high',
          resourceType: 'ticket',
          resourceId: ticket.id,
          channels: ['in-app', 'email']
        });
      }
      
      return {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status.name,
        priority: ticket.priority,
        customer: {
          id: ticket.user?.id,
          name: ticket.user?.username || 'Bilinmeyen',
          email: ticket.user?.email || ''
        },
        assignedOperator: ticket.assignedOperator ? {
          id: ticket.assignedOperator.id,
          name: ticket.assignedOperator.username,
          email: ticket.assignedOperator.email
        } : null,
        lastUpdateDays: Math.round((new Date() - new Date(ticket.updatedAt)) / (1000 * 60 * 60 * 24)),
        lastMessageByCustomer
      };
    }));
    
    console.log(`${result.length} yanıtsız bilet tespit edildi. Hatırlatmalar gönderildi.`);
    
    return result;
  } catch (error) {
    console.error('Yanıtsız bilet raporu oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Rapor hazır olduğunda kullanıcıyı bilgilendirir
 * @param {Object} report - Oluşturulan rapor
 * @param {Number} userId - Bildirim gönderilecek kullanıcı
 */
const notifyReportReady = async (report, userId) => {
  try {
    // Rapor PDF'i oluştur
    const pdfPath = report.pdfPath || await generatePdfReport(report);
    
    // Rapor için benzersiz bir resourceId oluştur
    const reportId = new Date().getTime();
    
    // Kullanıcıya bildirim gönder
    await notificationService.createNotification({
      userId,
      title: `${report.period.interval.charAt(0).toUpperCase() + report.period.interval.slice(1)} Rapor Hazır`,
      message: `${formatDate(report.period.startDate)} - ${formatDate(report.period.endDate)} tarihleri arası bilet raporu hazırlandı.`,
      type: 'report',
      priority: 'normal',
      // resourceId ve resourceType ekleyelim - bildirim kategorisi için
      resourceType: 'report',
      resourceId: reportId,
      // JSON veri olarak kaydedilecek bilgiler
      data: {
        reportId: reportId,
        reportPeriod: {
          start: report.period.startDate,
          end: report.period.endDate,
          interval: report.period.interval
        },
        pdfPath: pdfPath,
        summary: report.summary,
        // Ek rapor bilgileri
        unrespondedTickets: report.unrespondedTickets || null,
        longStandingTickets: report.longStandingTickets || null
      },
      // Bildirim kanalları - nesne formatında
      channels: {
        inApp: true,
        email: true,
        push: false
      }
    });
    
    return true;
  } catch (error) {
    console.error('Rapor bildirimi gönderme hatası:', error);
    return false;
  }
};

/**
 * Rapor verilerinden PDF oluşturur
 * @param {Object} report - Rapor verileri
 * @returns {String} PDF dosya yolu
 */
const generatePdfReport = async (report) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      
      // PDF dosyası için dizin ve dosya adı
      const reportsDir = path.join(__dirname, '../reports');
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const timestamp = new Date().getTime();
      const fileName = `report_${report.period.interval}_${timestamp}.pdf`;
      const filePath = path.join(reportsDir, fileName);
      
      // PDF'i dosyaya yaz
      doc.pipe(fs.createWriteStream(filePath));
      
      // PDF içeriği
      doc.fontSize(25).text('Destek Sistemi Raporu', { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(14).text(`Rapor Dönemi: ${formatDate(report.period.startDate)} - ${formatDate(report.period.endDate)}`, { align: 'center' });
      
      doc.moveDown();
      doc.fontSize(16).text('Genel Özet');
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Toplam Bilet: ${report.summary.totalTickets}`);
      doc.fontSize(12).text(`Açık Bilet: ${report.summary.openTickets}`);
      doc.fontSize(12).text(`Çözülmüş Bilet: ${report.summary.resolvedTickets}`);
      doc.fontSize(12).text(`Kapatılmış Bilet: ${report.summary.closedTickets}`);
      doc.fontSize(12).text(`Çözüm Oranı: %${report.summary.resolutionRate}`);
      
      doc.moveDown();
      doc.fontSize(16).text('Yanıt Süreleri');
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Ortalama İlk Yanıt: ${report.responseTimes.averageFirstResponse} dakika`);
      doc.fontSize(12).text(`Ortalama Çözüm: ${report.responseTimes.averageResolution} dakika`);
      
      doc.moveDown();
      doc.fontSize(16).text('SLA İstatistikleri');
      doc.moveDown(0.5);
      doc.fontSize(12).text(`Toplam SLA İhlali: ${report.sla.totalBreaches}`);
      doc.fontSize(12).text(`İhlal Oranı: %${report.sla.breachRate}`);
      
      // Operatör İstatistikleri
      if (report.operators && report.operators.length > 0) {
        doc.moveDown();
        doc.fontSize(16).text('Operatör İstatistikleri');
        doc.moveDown(0.5);
        
        report.operators.forEach(op => {
          doc.fontSize(12).text(`${op.name}: ${op.ticketCount} bilet, Ortalama çözüm: ${op.avgResolutionHours} saat`);
        });
      }
      
      // Etiket İstatistikleri
      if (report.tags && report.tags.length > 0) {
        doc.moveDown();
        doc.fontSize(16).text('En Çok Kullanılan Etiketler');
        doc.moveDown(0.5);
        
        report.tags.forEach(tag => {
          doc.fontSize(12).text(`${tag.name}: ${tag.ticketCount} bilet`);
        });
      }
      
      // PDF'i tamamla
      doc.end();
      
      doc.on('end', () => {
        console.log(`Rapor PDF'i oluşturuldu: ${filePath}`);
        resolve(filePath);
      });
      
      doc.on('error', (err) => {
        console.error('PDF oluşturma hatası:', err);
        reject(err);
      });
      
    } catch (error) {
      console.error('PDF raporu oluşturma hatası:', error);
      reject(error);
    }
  });
};

/**
 * Tarihi okunabilir formata dönüştürür
 * @param {Date} date - Tarih
 * @returns {String} Formatlanmış tarih
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
};

module.exports = {
  generateTicketReport,
  generateUnrespondedTicketsReport,
  notifyReportReady
};

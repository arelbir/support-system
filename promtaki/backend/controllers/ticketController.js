const { 
  Ticket, 
  User, 
  Status, 
  TicketAssignment, 
  Tag, 
  Product, 
  Module, 
  TicketTimeMetrics,
  TimeLog,
  SLA,
  BusinessHours,
  Holiday,
  sequelize  
} = require('../models');
const { Op } = require('sequelize');
const { calculateSLADueDates } = require('../utils/slaUtils');
const slaService = require('../utils/slaService');
const systemMessageService = require('../utils/systemMessageService');
const tagRuleService = require('../utils/tagRuleService');

// Yeni ticket oluşturma
exports.createTicket = async (req, res) => {
  try {
    const { 
      subject, 
      description, 
      priority, 
      category, 
      type, 
      company, 
      notifyEmails, 
      productId, 
      moduleId,
      tagIds
    } = req.body;
    
    // Varsayılan durum ID'sini al (örn. "Açık" durumu)
    const defaultStatus = await Status.findOne({ 
      where: { isDefault: true } 
    });
    
    if (!defaultStatus) {
      return res.status(500).json({
        message: 'Varsayılan durum bulunamadı. Lütfen yönetici ile iletişime geçin.'
      });
    }

    // Ürün ve modül kontrolü
    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) {
        return res.status(404).json({
          message: 'Belirtilen ürün bulunamadı.'
        });
      }
      
      // Modül belirtilmişse ve bu ürüne ait değilse hata ver
      if (moduleId) {
        const module = await Module.findByPk(moduleId);
        if (!module || module.productId !== parseInt(productId)) {
          return res.status(400).json({
            message: 'Belirtilen modül geçersiz veya bu ürüne ait değil.'
          });
        }
      }
    }

    // İşlemleri transaction içinde yap
    const result = await sequelize.transaction(async (t) => {
      // Yeni ticket oluştur
      const ticket = await Ticket.create({
        subject,
        description,
        priority: priority || 'medium',
        category,
        type: type || 'other',
        company: company || null,
        notifyEmails: notifyEmails || [],
        productId: productId || null,
        moduleId: moduleId || null,
        userId: req.user.id,
        statusId: defaultStatus.id,
        isResolved: false
      }, { transaction: t });
      
      // SLA hesaplama ve atama - transaction içinde
      let slaTargets = null;
      try {
        slaTargets = await slaService.assignSLAToTicket(ticket, false, t);
        console.log(`Ticket #${ticket.id} için SLA atandı: İlk yanıt: ${slaTargets?.responseDueDate}, Çözüm: ${slaTargets?.resolutionDueDate}`);
      } catch (slaError) {
        console.error(`Ticket #${ticket.id} için SLA atama hatası:`, slaError);
        // SLA hatası işlemi durdurmayacak
      }
      
      // Etiketler eklendiyse bağla
      if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
        const tags = await Tag.findAll({
          where: {
            id: {
              [Op.in]: tagIds
            },
            isActive: true
          },
          transaction: t
        });
        
        if (tags.length > 0) {
          await ticket.setTags(tags, { transaction: t });
        }
      }
      
      // Otomatik etiketleme kurallarını uygula - transaction içinde
      try {
        await tagRuleService.autoTagNewTicket(ticket, t);
      } catch (tagError) {
        console.error(`Ticket #${ticket.id} için etiket kuralları uygulama hatası:`, tagError);
        // Etiket hatası işlemi durdurmayacak
      }
      
      return ticket;
    });

    // Oluşturulan ticket'ı ilişkili verilerle birlikte getir
    const newTicket = await Ticket.findByPk(result.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { model: Tag, as: 'tags' },
        { model: Product },
        { model: Module },
        { model: TicketTimeMetrics, as: 'timeMetrics' }
      ]
    });

    res.status(201).json({
      message: 'Ticket başarıyla oluşturuldu.',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Ticket oluşturma hatası:', error);
    res.status(500).json({
      message: 'Ticket oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket durumunu güncelle
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusId } = req.body;
    
    // Status ID kontrolü
    if (!statusId) {
      return res.status(400).json({
        message: 'Durum ID\'si belirtilmelidir.'
      });
    }
    
    // Durumun var olup olmadığını kontrol et
    const status = await Status.findByPk(statusId);
    if (!status) {
      return res.status(404).json({
        message: 'Belirtilen durum bulunamadı.'
      });
    }
    
    // Ticket'ı bul
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Destek talebi bulunamadı.'
      });
    }
    
    // Çözüldü statüsü ise ve ticket'ın SLA'sı duraklatılmışsa, SLA'yı aktifleştir
    let slaPaused = ticket.slaPaused;
    let slaPausedAt = ticket.slaPausedAt;
    let slaPausedReason = ticket.slaPausedReason;
    
    if (status.isResolved && ticket.slaPaused) {
      slaPaused = false;
      slaPausedAt = null;
      slaPausedReason = null;
    }
    
    // Ticket'ı güncelle
    await ticket.update({
      statusId,
      isResolved: status.isResolved || false,
      slaPaused,
      slaPausedAt,
      slaPausedReason,
      updatedBy: req.user.id
    });
    
    // Duruma bağlı SLA işlemleri
    try {
      // Durum müşteri yanıtı bekleniyor ise SLA duraklatma
      if (status.name.toLowerCase().includes('müşteri yanıtı') || status.name.toLowerCase().includes('bekl')) {
        await slaService.pauseSLA(ticket.id, `Durum değişikliği: ${status.name}`);
      }
      // Durumda çözüldü flag'i var ise
      else if (status.isResolved) {
        if (ticket.slaPaused) {
          await slaService.resumeSLA(ticket.id);
        }
        // Çözüm zamanını kaydet
        const timeMetrics = await TicketTimeMetrics.findOne({
          where: { ticketId: ticket.id }
        });
        if (timeMetrics && !timeMetrics.resolvedAt) {
          await timeMetrics.update({
            resolvedAt: new Date()
          });
        }
      }
      // Durum yeniden açılmışsa ve SLA duraklatılmışsa devam ettir
      else if (!status.isResolved && ticket.slaPaused) {
        await slaService.resumeSLA(ticket.id);
      }
    } catch (slaError) {
      console.error(`Durum değişikliğinde SLA işlemi hatası (Ticket #${ticket.id}):`, slaError);
      // SLA hatası işlemi durdurmayacak
    }
    
    // Otomatik etiketleme kurallarını uygula
    await tagRuleService.autoTagUpdatedTicket(ticket);
    
    // Sistem mesajı oluştur
    await systemMessageService.createSystemMessage({
      ticketId: ticket.id,
      message: `Durum değişikliği: ${status.name}`,
      userId: req.user.id
    });
    
    // Güncellenmiş ticket'ı getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    res.json({
      message: 'Destek talebi durumu başarıyla güncellendi.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Ticket durum güncelleme hatası:', error);
    res.status(500).json({
      message: 'Destek talebi durumu güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket'a operatör atama
exports.assignOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatorId } = req.body;
    
    // Ticket'ı kontrol et
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // Operatörü kontrol et (operatorId null olabilir - atamayı kaldırmak için)
    if (operatorId) {
      const operator = await User.findOne({
        where: {
          id: operatorId,
          role: {
            [Op.or]: ['operator', 'admin']
          }
        }
      });
      
      if (!operator) {
        return res.status(400).json({
          message: 'Geçerli bir operatör seçilmelidir.'
        });
      }
    }
    
    // Ticket'ı güncelle
    await ticket.update({
      assignedOperatorId: operatorId
    });
    
    // Sistem mesajı oluştur
    await systemMessageService.createSystemMessage({
      ticketId: ticket.id,
      message: `Operatör ataması: ${operatorId ? `Operatör ${operatorId} atanmıştır.` : 'Operatör ataması kaldırılmıştır.'}`,
      userId: req.user.id
    });
    
    // Güncellenmiş ticket'ı getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ]
    });

    res.status(200).json({
      message: operatorId ? 'Operatör başarıyla atandı.' : 'Operatör ataması kaldırıldı.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Operatör atama hatası:', error);
    res.status(500).json({
      message: 'Operatör atanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket'a birden fazla operatör atama
exports.assignMultipleOperators = async (req, res) => {
  try {
    const { id } = req.params;
    const { operators } = req.body;
    
    // Operators dizisi validasyonu
    if (!Array.isArray(operators) || operators.length === 0) {
      return res.status(400).json({
        message: 'Operatör listesi geçerli değil. En az bir operatör belirtilmelidir.'
      });
    }
    
    // Ticket'ı kontrol et
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // İşlemi bir transaction içinde yap
    const result = await sequelize.transaction(async (t) => {
      // Mevcut tüm atamaları kaldır
      await TicketAssignment.destroy({
        where: { ticketId: id },
        transaction: t
      });
      
      // Yeni atamaları oluştur
      const assignments = [];
      
      for (const op of operators) {
        // Operatör validasyonu
        const operator = await User.findOne({
          where: {
            id: op.operatorId,
            role: {
              [Op.or]: ['operator', 'admin']
            }
          },
          transaction: t
        });
        
        if (!operator) {
          throw new Error(`Operatör bulunamadı: ${op.operatorId}`);
        }
        
        // Atamayı oluştur
        const assignment = await TicketAssignment.create({
          ticketId: id,
          operatorId: op.operatorId,
          isPrimary: !!op.isPrimary,
          assignedBy: req.user.id,
          notes: op.notes || null
        }, { transaction: t });
        
        assignments.push(assignment);
      }
      
      // Ana operatörü güncelle (birincil olarak işaretlenen operatör)
      const primaryAssignment = assignments.find(a => a.isPrimary);
      
      if (primaryAssignment) {
        await ticket.update({
          assignedOperatorId: primaryAssignment.operatorId
        }, { transaction: t });
      } else if (assignments.length > 0) {
        // Birincil operatör belirtilmemişse, ilk operatörü birincil olarak ata
        await TicketAssignment.update(
          { isPrimary: true },
          { 
            where: { id: assignments[0].id },
            transaction: t
          }
        );
        
        await ticket.update({
          assignedOperatorId: assignments[0].operatorId
        }, { transaction: t });
      } else {
        // Hiç operatör atanmadıysa, assignedOperatorId'yi null yap
        await ticket.update({
          assignedOperatorId: null
        }, { transaction: t });
      }
      
      return { ticket, assignments };
    });
    
    // Sistem mesajı oluştur
    await systemMessageService.createSystemMessage({
      ticketId: result.ticket.id,
      message: `Operatörler atanmıştır: ${result.assignments.map(a => a.operatorId).join(', ')}`,
      userId: req.user.id
    });
    
    // Güncellenmiş ticket ve atamaları getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { 
          model: User, 
          as: 'assignedOperators',
          attributes: ['id', 'username', 'email'],
          through: { 
            attributes: ['isPrimary', 'assignedAt', 'notes'] 
          }
        }
      ]
    });
    
    res.status(200).json({
      message: 'Ticket\'a operatörler başarıyla atandı.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Çoklu operatör atama hatası:', error);
    res.status(500).json({
      message: 'Operatörler atanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket'a etiket ekleme
exports.addTagsToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { tagIds } = req.body;
    
    // tagIds validasyonu
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
      return res.status(400).json({
        message: 'Etiket listesi geçerli değil. En az bir etiket ID\'si belirtilmelidir.'
      });
    }
    
    // Ticket'ı kontrol et
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // Etiketleri doğrula
    const tags = await Tag.findAll({
      where: {
        id: {
          [Op.in]: tagIds
        },
        isActive: true
      }
    });
    
    if (tags.length === 0) {
      return res.status(404).json({
        message: 'Hiçbir geçerli etiket bulunamadı.'
      });
    }
    
    // Etiketleri ekle
    await ticket.setTags(tags);
    
    // Sistem mesajı oluştur
    await systemMessageService.createSystemMessage({
      ticketId: ticket.id,
      message: `Etiketler eklendi: ${tags.map(t => t.name).join(', ')}`,
      userId: req.user.id
    });
    
    // Güncellenmiş ticket'ı etiketleriyle birlikte getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { model: Tag, as: 'tags' }
      ]
    });
    
    res.status(200).json({
      message: 'Etiketler başarıyla eklendi.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Etiket ekleme hatası:', error);
    res.status(500).json({
      message: 'Etiketler eklenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket'a harcanan zaman ekleme
exports.addTimeLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSpent, description, activityType, startTime, endTime, isBillable } = req.body;
    
    // Time spent validasyonu
    if (!timeSpent || !Number.isInteger(timeSpent) || timeSpent <= 0) {
      return res.status(400).json({
        message: 'Geçerli bir süre (dakika olarak) belirtilmelidir.'
      });
    }
    
    // Ticket'ı kontrol et
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // Zaman kaydını oluştur
    const timeLog = await TimeLog.create({
      ticketId: id,
      userId: req.user.id,
      timeSpent,
      description: description || null,
      activityType: activityType || null,
      startTime: startTime || null,
      endTime: endTime || null,
      isBillable: isBillable !== undefined ? isBillable : true
    });
    
    // Ticket'ın toplam süresini güncelle
    await ticket.update({
      timeSpent: ticket.timeSpent + timeSpent
    });
    
    // Sistem mesajı oluştur
    await systemMessageService.createSystemMessage({
      ticketId: ticket.id,
      message: `Zaman kaydı eklendi: ${timeSpent} dakika`,
      userId: req.user.id
    });
    
    // Güncellenmiş ticket'ı getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { model: TimeLog, include: [{ model: User, attributes: ['id', 'username', 'email'] }] }
      ]
    });
    
    res.status(201).json({
      message: 'Zaman kaydı başarıyla eklendi.',
      timeLog,
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Zaman kaydı ekleme hatası:', error);
    res.status(500).json({
      message: 'Zaman kaydı eklenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// SLA'yı duraklat
exports.pauseSLA = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Reason kontrolü
    if (!reason) {
      return res.status(400).json({
        message: 'Duraklatma nedeni belirtilmelidir.'
      });
    }
    
    // Ticket'ı bul
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Destek talebi bulunamadı.'
      });
    }
    
    // Zaten duraklatılmışsa hata ver
    if (ticket.slaPaused) {
      return res.status(409).json({
        message: 'SLA zaten duraklatılmış durumda.'
      });
    }

    // Yeni SLA servisi ile duraklatma işlemini yap
    await slaService.pauseSLA(id, reason);
    
    // Ticket üzerinde de duraklatma bilgilerini güncelle (veritabanı tutarlılığı için)
    await ticket.update({
      slaPaused: true,
      slaPausedAt: new Date(),
      slaPausedReason: reason
    });
    
    // Sistem mesajı oluştur
    await systemMessageService.createSystemMessage({
      ticketId: ticket.id,
      message: `SLA duraklatıldı: ${reason}`,
      userId: req.user.id
    });
    
    // Güncellenmiş ticket'ı getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { model: TicketTimeMetrics }
      ]
    });
    
    res.json({
      message: 'SLA başarıyla duraklatıldı.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('SLA duraklatma hatası:', error);
    res.status(500).json({
      message: 'SLA duraklatılırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// SLA'yı devam ettir
exports.resumeSLA = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ticket'ı bul
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Destek talebi bulunamadı.'
      });
    }
    
    // Duraklatılmamışsa hata ver
    if (!ticket.slaPaused) {
      return res.status(409).json({
        message: 'SLA duraklatılmış durumda değil.'
      });
    }

    // Yeni SLA servisi ile devam ettirme işlemini yap
    await slaService.resumeSLA(id);
    
    // Ticket üzerinde de duraklatma bilgilerini sıfırla
    await ticket.update({
      slaPaused: false,
      slaPausedAt: null,
      slaPausedReason: null
    });
    
    // Sistem mesajı oluştur
    await systemMessageService.createSystemMessage({
      ticketId: ticket.id,
      message: 'SLA devam ettirildi',
      userId: req.user.id
    });
    
    // Güncellenmiş ticket'ı getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { model: TicketTimeMetrics }
      ]
    });
    
    res.json({
      message: 'SLA başarıyla devam ettirildi.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('SLA devam ettirme hatası:', error);
    res.status(500).json({
      message: 'SLA devam ettirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket listelemeyi genişlet
exports.getTicketQueue = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtreler
    const filters = {};
    
    // Durum filtresi
    if (req.query.statusId) {
      filters.statusId = req.query.statusId;
    }
    
    // Atanmamış ticket'lar filtresi
    if (req.query.unassigned === 'true') {
      filters.assignedOperatorId = null;
    }
    
    // Operatöre atanmış ticket'lar filtresi
    if (req.query.assignedToMe === 'true' && req.user.role !== 'customer') {
      filters.assignedOperatorId = req.user.id;
    }
    
    // SLA aşılmış ticket'lar filtresi
    if (req.query.slaBreached === 'true') {
      // Alt sorgu kullanarak SLA'sı aşılmış ticket'ları seç
      const breachedTicketIds = await TicketTimeMetrics.findAll({
        attributes: ['ticketId'],
        where: {
          [Op.or]: [
            { slaResponseBreached: true },
            { slaResolutionBreached: true }
          ]
        }
      }).map(metric => metric.ticketId);
      
      if (breachedTicketIds.length > 0) {
        filters.id = {
          [Op.in]: breachedTicketIds
        };
      } else {
        // Hiç SLA aşılmış ticket yoksa boş sonuç döndür
        return res.status(200).json({
          tickets: [],
          totalPages: 0,
          currentPage: page,
          totalItems: 0
        });
      }
    }
    
    // Ürün filtresi
    if (req.query.productId) {
      filters.productId = req.query.productId;
    }
    
    // Modül filtresi
    if (req.query.moduleId) {
      filters.moduleId = req.query.moduleId;
    }
    
    // Tip filtresi
    if (req.query.type) {
      filters.type = req.query.type;
    }
    
    // Öncelik filtresi
    if (req.query.priority) {
      filters.priority = req.query.priority;
    }
    
    // Arama filtresi
    if (req.query.search) {
      filters[Op.or] = [
        { subject: { [Op.iLike]: `%${req.query.search}%` } },
        { description: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: filters,
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { model: Tag, as: 'tags' },
        { model: Product },
        { model: Module },
        { model: TicketTimeMetrics }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error('Ticket kuyruğu listeleme hatası:', error);
    res.status(500).json({
      message: 'Ticket kuyruğu listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Tek bir ticket detayını güncelleyelim
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'role'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email', 'role'] },
        { 
          model: User, 
          as: 'assignedOperators',
          attributes: ['id', 'username', 'email', 'role'],
          through: { 
            attributes: ['isPrimary', 'assignedAt', 'notes'] 
          }
        },
        { model: Tag, as: 'tags' },
        { model: Product },
        { model: Module },
        { model: TicketTimeMetrics, as: 'timeMetrics' },
        { 
          model: TimeLog,
          include: [{ model: User, attributes: ['id', 'username', 'email'] }]
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // Kullanıcı yetkisi kontrolü
    // Müşteri sadece kendi ticket'larını görebilir
    if (req.user.role === 'customer' && ticket.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu ticket\'ı görüntüleme yetkiniz yok.'
      });
    }

    res.status(200).json({
      ticket
    });
  } catch (error) {
    console.error('Ticket detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Ticket detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcının kendi ticketlarını listele
exports.getMyTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, product } = req.query;
    const offset = (page - 1) * limit;
    
    // Filtreler
    const filters = { userId: req.user.id };
    
    // Durum filtreleme
    if (status) {
      filters.statusId = status;
    }
    
    // Öncelik filtreleme
    if (priority) {
      filters.priority = priority;
    }
    
    // Ürün filtreleme
    if (product) {
      filters.productId = product;
    }
    
    // Toplam kayıt sayısını al
    const totalItems = await Ticket.count({ where: filters });
    const totalPages = Math.ceil(totalItems / limit);
    
    // Ticket'ları getir
    const tickets = await Ticket.findAll({
      where: filters,
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] },
        { 
          model: Product,
          attributes: ['id', 'name']
        },
        {
          model: TicketTimeMetrics,
          as: 'timeMetrics'
        }
      ],
      order: [['updatedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      tickets,
      currentPage: parseInt(page),
      totalPages,
      totalItems
    });
  } catch (error) {
    console.error('Ticket listeleme hatası:', error);
    res.status(500).json({
      message: 'Destek talepleri listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

module.exports = exports;

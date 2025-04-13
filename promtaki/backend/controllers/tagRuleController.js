const { TagRule, Tag, Ticket, User, sequelize } = require('../models');
const tagRuleService = require('../utils/tagRuleService');
const { Op } = require('sequelize');

// Tüm etiket kurallarını listele
exports.getAllRules = async (req, res) => {
  try {
    const { active, tagId } = req.query;
    
    // Filtreler
    const filters = {};
    
    // Aktiflik filtresi
    if (active !== undefined) {
      filters.isActive = active === 'true';
    }
    
    // Etiket filtresi
    if (tagId) {
      filters.tagId = tagId;
    }
    
    // Kuralları getir
    const rules = await TagRule.findAll({
      where: filters,
      attributes: ['id', 'name', 'description', 'conditions', 'tagId', 'isActive', 
                   'priority', 'createdBy', 'lastAppliedAt', 'applicationCount', 
                   'createdAt', 'updatedAt'],
      include: [
        { model: Tag, as: 'tag' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] }
      ],
      order: [['priority', 'ASC'], ['createdAt', 'DESC']]
    });
    
    res.status(200).json({ rules });
  } catch (error) {
    console.error('Etiket kuralı listeleme hatası:', error);
    res.status(500).json({
      message: 'Etiket kuralları listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Etiket kuralı detayı
exports.getRuleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kuralı getir
    const rule = await TagRule.findByPk(id, {
      attributes: ['id', 'name', 'description', 'conditions', 'tagId', 'isActive', 
                  'priority', 'createdBy', 'lastAppliedAt', 'applicationCount', 
                  'createdAt', 'updatedAt'],
      include: [
        { model: Tag, as: 'tag' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    if (!rule) {
      return res.status(404).json({
        message: 'Etiket kuralı bulunamadı.'
      });
    }
    
    res.status(200).json({ rule });
  } catch (error) {
    console.error('Etiket kuralı getirme hatası:', error);
    res.status(500).json({
      message: 'Etiket kuralı alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni etiket kuralı oluştur
exports.createRule = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      conditions, 
      tagId, 
      priority = 10,
      applyToExisting 
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!name || !tagId || !conditions) {
      return res.status(400).json({
        message: 'İsim, etiket ID ve koşullar zorunludur.'
      });
    }
    
    // Etiketin varlığını kontrol et
    const tag = await Tag.findByPk(tagId);
    if (!tag) {
      return res.status(404).json({
        message: 'Belirtilen etiket bulunamadı.'
      });
    }
    
    // Koşulların geçerliliğini kontrol et
    if (typeof conditions !== 'object' || Array.isArray(conditions) || Object.keys(conditions).length === 0) {
      return res.status(400).json({
        message: 'Geçerli koşullar belirtilmelidir (nesne formatında).'
      });
    }
    
    // Yeni kural oluştur
    const ruleData = {
      name,
      description,
      conditions,
      tagId,
      priority,
      isActive: true,
      createdBy: req.user.id
    };
    
    const rule = await TagRule.create(ruleData);
    
    // Oluşturulan kuralı ilişkileriyle getir
    const newRule = await TagRule.findByPk(rule.id, {
      attributes: ['id', 'name', 'description', 'conditions', 'tagId', 'isActive', 
                  'priority', 'createdBy', 'lastAppliedAt', 'applicationCount', 
                  'createdAt', 'updatedAt'],
      include: [
        { model: Tag, as: 'tag' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    // Eğer mevcut biletlere uygulanması isteniyorsa
    let appliedResult = null;
    if (applyToExisting) {
      appliedResult = await tagRuleService.applyRuleToAllTickets(rule.id);
    }
    
    res.status(201).json({
      message: 'Etiket kuralı başarıyla oluşturuldu.',
      rule: newRule,
      applied: appliedResult
    });
  } catch (error) {
    console.error('Etiket kuralı oluşturma hatası:', error);
    res.status(500).json({
      message: 'Etiket kuralı oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Etiket kuralını güncelle
exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      conditions, 
      tagId, 
      isActive,
      priority,
      applyToExisting
    } = req.body;
    
    // Kuralı bul
    const rule = await TagRule.findByPk(id);
    
    if (!rule) {
      return res.status(404).json({
        message: 'Etiket kuralı bulunamadı.'
      });
    }
    
    // Etiket değiştiyse varlığını kontrol et
    if (tagId && tagId !== rule.tagId) {
      const tag = await Tag.findByPk(tagId);
      if (!tag) {
        return res.status(404).json({
          message: 'Belirtilen etiket bulunamadı.'
        });
      }
    }
    
    // Koşullar değiştiyse geçerliliğini kontrol et
    if (conditions && (typeof conditions !== 'object' || Array.isArray(conditions) || Object.keys(conditions).length === 0)) {
      return res.status(400).json({
        message: 'Geçerli koşullar belirtilmelidir (nesne formatında).'
      });
    }
    
    // Kuralı güncelle
    const updateData = {
      name: name !== undefined ? name : rule.name,
      description: description !== undefined ? description : rule.description,
      conditions: conditions !== undefined ? conditions : rule.conditions,
      tagId: tagId !== undefined ? tagId : rule.tagId,
      isActive: isActive !== undefined ? isActive : rule.isActive,
      priority: priority !== undefined ? priority : rule.priority
    };
    
    await rule.update(updateData);
    
    // Güncellenmiş kuralı getir
    const updatedRule = await TagRule.findByPk(id, {
      attributes: ['id', 'name', 'description', 'conditions', 'tagId', 'isActive', 
                  'priority', 'createdBy', 'lastAppliedAt', 'applicationCount', 
                  'createdAt', 'updatedAt'],
      include: [
        { model: Tag, as: 'tag' },
        { model: User, as: 'creator', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    res.status(200).json({
      message: 'Etiket kuralı başarıyla güncellendi.',
      rule: updatedRule
    });
  } catch (error) {
    console.error('Etiket kuralı güncelleme hatası:', error);
    res.status(500).json({
      message: 'Etiket kuralı güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Etiket kuralını sil
exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kuralı bul
    const rule = await TagRule.findByPk(id);
    
    if (!rule) {
      return res.status(404).json({
        message: 'Etiket kuralı bulunamadı.'
      });
    }
    
    // Kuralı sil
    await rule.destroy();
    
    res.status(200).json({
      message: 'Etiket kuralı başarıyla silindi.'
    });
  } catch (error) {
    console.error('Etiket kuralı silme hatası:', error);
    res.status(500).json({
      message: 'Etiket kuralı silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kuralı test et
exports.testRule = async (req, res) => {
  try {
    const { conditions, ticketId } = req.body;
    
    // Koşulların geçerliliğini kontrol et
    if (typeof conditions !== 'object' || Array.isArray(conditions) || Object.keys(conditions).length === 0) {
      return res.status(400).json({
        message: 'Geçerli koşullar belirtilmelidir (nesne formatında).'
      });
    }
    
    // Ticket belirtilmişse varlığını kontrol et
    let ticket = null;
    if (ticketId) {
      ticket = await Ticket.findByPk(ticketId, {
        include: [
          { model: User, attributes: ['id', 'username', 'email', 'role'] },
          { model: Tag, as: 'tags' }
        ]
      });
      
      if (!ticket) {
        return res.status(404).json({
          message: 'Belirtilen bilet bulunamadı.'
        });
      }
    } else {
      // Rastgele bir bilet al
      ticket = await Ticket.findOne({
        include: [
          { model: User, attributes: ['id', 'username', 'email', 'role'] },
          { model: Tag, as: 'tags' }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      if (!ticket) {
        return res.status(404).json({
          message: 'Test için bilet bulunamadı.'
        });
      }
    }
    
    // Koşulları kontrol et
    const result = tagRuleService.checkConditions(ticket, conditions);
    
    res.status(200).json({
      result,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        priority: ticket.priority,
        status: ticket.status,
        tags: ticket.tags.map(tag => ({ id: tag.id, name: tag.name }))
      }
    });
  } catch (error) {
    console.error('Etiket kuralı test etme hatası:', error);
    res.status(500).json({
      message: 'Etiket kuralı test edilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kuralı biletlere uygula
exports.applyRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Sonuçları al
    const results = await tagRuleService.applyRuleToAllTickets(id);
    
    res.status(200).json({
      message: `Kural başarıyla uygulandı. ${results.appliedCount} bilete "${results.tagName}" etiketi eklendi.`,
      results
    });
  } catch (error) {
    console.error('Etiket kuralı uygulama hatası:', error);
    res.status(500).json({
      message: 'Etiket kuralı uygulanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Tüm kuralları yeniden uygula
exports.reapplyAllRules = async (req, res) => {
  try {
    const results = await tagRuleService.reapplyAllRules();
    
    res.status(200).json({
      message: `Tüm kurallar yeniden uygulandı. ${results.processedTickets} bilet işlendi, ${results.appliedTags} etiket eklendi.`,
      results
    });
  } catch (error) {
    console.error('Tüm kuralları yeniden uygulama hatası:', error);
    res.status(500).json({
      message: 'Kurallar yeniden uygulanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Etiket bazlı raporlama
exports.getTagStats = async (req, res) => {
  try {
    // Tüm etiketleri ve kullanım sayılarını getir
    const tagStats = await Tag.findAll({
      attributes: [
        'id', 
        'name', 
        'color',
        'category',
        [sequelize.fn('COUNT', sequelize.col('tickets.id')), 'ticketCount']
      ],
      include: [
        { 
          model: Ticket, 
          as: 'tickets',
          attributes: [], 
          through: { attributes: [] }
        }
      ],
      group: ['Tag.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('tickets.id')), 'DESC']]
    });
    
    // Kategori bazlı istatistikler - raw SQL ile çözelim
    const categoryStatsQuery = `
      SELECT 
        "category", 
        COUNT(*) as "tagCount", 
        SUM(
          (SELECT COUNT(*) FROM "TicketTags" 
           WHERE "TicketTags"."tagId" = "Tags"."id")
        ) as "ticketCount"
      FROM "Tags"
      WHERE "category" IS NOT NULL
      GROUP BY "category"
      ORDER BY "ticketCount" DESC;
    `;
    
    const categoryStats = await sequelize.query(categoryStatsQuery, { 
      type: sequelize.QueryTypes.SELECT
    });
    
    // Kural istatistikleri
    const ruleStats = await TagRule.findAll({
      attributes: [
        'id',
        'name',
        'applicationCount',
        'lastAppliedAt',
        'isActive',
        'priority'
      ],
      include: [
        { model: Tag, as: 'tag', attributes: ['id', 'name', 'color'] }
      ],
      order: [['applicationCount', 'DESC']]
    });
    
    res.status(200).json({
      tagStats,
      categoryStats,
      ruleStats
    });
  } catch (error) {
    console.error('Etiket istatistikleri alma hatası:', error);
    res.status(500).json({
      message: 'Etiket istatistikleri alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

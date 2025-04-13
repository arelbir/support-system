/**
 * Etiket Kuralları Servisi
 * Otomatik etiketleme kurallarını yönetir ve uygular
 */

const { Tag, TagRule, Ticket, User } = require('../models');
const { Op, Sequelize } = require('sequelize');

/**
 * Bilete koşulların uyup uymadığını kontrol eder
 * @param {Object} ticket Bilet objesi
 * @param {Object} conditions Kural koşulları
 * @returns {Boolean} Koşullar uyuyor mu?
 */
const checkConditions = (ticket, conditions) => {
  try {
    if (!conditions || Object.keys(conditions).length === 0) {
      return false;
    }

    // Her koşulu kontrol et ve tümü uyuyorsa true döndür
    const allConditionsMet = Object.entries(conditions).every(([field, condition]) => {
      const { operator, value } = condition;
      
      if (!operator || value === undefined) {
        return true; // Hatalı koşul yapısı, geç
      }
      
      // Bilet alanını al
      let fieldValue = null;
      
      // Alan yolunu analiz et (örn: "user.email" -> ticket.user.email)
      const fieldPath = field.split('.');
      if (fieldPath.length === 1) {
        fieldValue = ticket[field];
      } else if (fieldPath.length > 1) {
        let current = ticket;
        for (const pathPart of fieldPath) {
          if (current && current[pathPart] !== undefined) {
            current = current[pathPart];
          } else {
            current = null;
            break;
          }
        }
        fieldValue = current;
      }
      
      // Null değerler için kontroller
      if (fieldValue === null || fieldValue === undefined) {
        return operator === 'isNull';
      }
      
      // Operatöre göre karşılaştırma yap
      switch (operator) {
        case 'equals':
          return fieldValue === value;
        case 'notEquals':
          return fieldValue !== value;
        case 'contains':
          return typeof fieldValue === 'string' && fieldValue.toLowerCase().includes(value.toLowerCase());
        case 'notContains':
          return typeof fieldValue === 'string' && !fieldValue.toLowerCase().includes(value.toLowerCase());
        case 'startsWith':
          return typeof fieldValue === 'string' && fieldValue.toLowerCase().startsWith(value.toLowerCase());
        case 'endsWith':
          return typeof fieldValue === 'string' && fieldValue.toLowerCase().endsWith(value.toLowerCase());
        case 'greaterThan':
          return typeof fieldValue === 'number' && fieldValue > value;
        case 'lessThan':
          return typeof fieldValue === 'number' && fieldValue < value;
        case 'inList':
          return Array.isArray(value) && value.includes(fieldValue);
        case 'notInList':
          return Array.isArray(value) && !value.includes(fieldValue);
        case 'isNull':
          return fieldValue === null || fieldValue === undefined;
        case 'isNotNull':
          return fieldValue !== null && fieldValue !== undefined;
        case 'regex':
          try {
            const regex = new RegExp(value, 'i');
            return typeof fieldValue === 'string' && regex.test(fieldValue);
          } catch (e) {
            console.error('Regex hatası:', e);
            return false;
          }
        default:
          return false;
      }
    });
    
    return allConditionsMet;
  } catch (error) {
    console.error('Koşul kontrolü hatası:', error);
    return false;
  }
};

/**
 * Verilen bilete tüm kuralları uygular
 * @param {Object} ticket Bilet objesi
 * @param {Object} transaction Sequelize transaction objesi
 * @returns {Array} Uygulanan etiketler
 */
const applyRulesToTicket = async (ticket, transaction = null) => {
  try {
    // Tam verileri içeren bileti getir
    const fullTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'role'] },
        { model: Tag, as: 'tags' }
      ],
      transaction
    });
    
    if (!fullTicket) {
      throw new Error(`Bilet bulunamadı: ${ticket.id}`);
    }
    
    // Aktif kuralları öncelik sırasına göre getir
    const rules = await TagRule.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'conditions', 'tagId', 'isActive', 'priority', 'createdBy', 'lastAppliedAt', 'applicationCount', 'createdAt', 'updatedAt'],
      include: [{ model: Tag, as: 'tag' }],
      order: [['priority', 'ASC']],
      transaction
    });
    
    // Mevcut etiketleri al
    const currentTagIds = fullTicket.tags.map(tag => tag.id);
    const appliedTags = [];
    
    // Her kural için koşulları kontrol et
    for (const rule of rules) {
      // Kural zaten uygulanmışsa atla
      if (currentTagIds.includes(rule.tagId)) {
        continue;
      }
      
      // Koşulları kontrol et
      if (checkConditions(fullTicket, rule.conditions)) {
        // Etiketi uygula
        await fullTicket.addTag(rule.tagId, { transaction });
        
        // Kural uygulama sayısını artır
        await rule.increment('applicationCount', { transaction });
        await rule.update({ lastAppliedAt: new Date() }, { transaction });
        
        appliedTags.push(rule.tag);
      }
    }
    
    return appliedTags;
  } catch (error) {
    console.error('Bilete kural uygulama hatası:', error);
    return [];
  }
};

/**
 * Belirli bir kuralı tüm biletlere uygular
 * @param {Number} ruleId Kural ID
 * @param {Object} transaction Sequelize transaction objesi
 * @returns {Object} Sonuç bilgileri
 */
const applyRuleToAllTickets = async (ruleId, transaction = null) => {
  try {
    // Kuralı getir
    const rule = await TagRule.findByPk(ruleId, {
      attributes: ['id', 'name', 'description', 'conditions', 'tagId', 'isActive', 'priority', 'createdBy', 'lastAppliedAt', 'applicationCount', 'createdAt', 'updatedAt'],
      include: [{ model: Tag, as: 'tag' }],
      transaction
    });
    
    if (!rule || !rule.isActive) {
      throw new Error(`Aktif kural bulunamadı: ${ruleId}`);
    }
    
    // Tüm biletleri getir
    const tickets = await Ticket.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'role'] },
        { model: Tag, as: 'tags' }
      ],
      transaction
    });
    
    let appliedCount = 0;
    
    // Her bilet için kuralı uygula
    for (const ticket of tickets) {
      // Bilet zaten bu etikete sahipse atla
      const hasTag = ticket.tags.some(tag => tag.id === rule.tagId);
      if (hasTag) {
        continue;
      }
      
      // Koşulları kontrol et
      if (checkConditions(ticket, rule.conditions)) {
        // Etiketi uygula
        await ticket.addTag(rule.tagId, { transaction });
        appliedCount++;
      }
    }
    
    // Kural uygulama sayısını güncelle
    await rule.increment('applicationCount', { by: appliedCount, transaction });
    await rule.update({ lastAppliedAt: new Date() }, { transaction });
    
    return {
      appliedCount,
      tagName: rule.tag.name,
      ruleName: rule.name
    };
  } catch (error) {
    console.error('Tüm biletlere kural uygulama hatası:', error);
    throw error;
  }
};

/**
 * Tüm kuralları varolan biletlere yeniden uygular
 * @param {Object} transaction Sequelize transaction objesi
 * @returns {Object} Sonuç bilgileri
 */
const reapplyAllRules = async (transaction = null) => {
  try {
    // Aktif kuralları getir
    const rules = await TagRule.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'description', 'conditions', 'tagId', 'isActive', 'priority', 'createdBy', 'lastAppliedAt', 'applicationCount', 'createdAt', 'updatedAt'],
      include: [{ model: Tag, as: 'tag' }],
      order: [['priority', 'ASC']],
      transaction
    });
    
    // Tüm biletleri getir
    const tickets = await Ticket.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'role'] },
        { model: Tag, as: 'tags' }
      ],
      transaction
    });
    
    const results = {
      processedTickets: tickets.length,
      appliedRules: 0,
      appliedTags: 0
    };
    
    // Her bilet için tüm kuralları kontrol et
    for (const ticket of tickets) {
      const currentTagIds = ticket.tags.map(tag => tag.id);
      
      for (const rule of rules) {
        // Bilet zaten bu etikete sahipse atla
        if (currentTagIds.includes(rule.tagId)) {
          continue;
        }
        
        // Koşulları kontrol et
        if (checkConditions(ticket, rule.conditions)) {
          // Etiketi uygula
          await ticket.addTag(rule.tagId, { transaction });
          
          // İstatistikleri güncelle
          results.appliedTags++;
          
          // Kural uygulama sayısını artır
          await rule.increment('applicationCount', { transaction });
          await rule.update({ lastAppliedAt: new Date() }, { transaction });
        }
      }
    }
    
    results.appliedRules = rules.length;
    
    return results;
  } catch (error) {
    console.error('Tüm kuralları yeniden uygulama hatası:', error);
    throw error;
  }
};

/**
 * Yeni bilet oluşturulduğunda otomatik etiketleme yapar
 * @param {Object} ticket Yeni oluşturulan bilet
 * @param {Object} transaction Sequelize transaction objesi
 * @returns {Array} Uygulanan etiketler
 */
const autoTagNewTicket = async (ticket, transaction = null) => {
  try {
    return await applyRulesToTicket(ticket, transaction);
  } catch (error) {
    console.error('Yeni bilet otomatik etiketleme hatası:', error);
    return [];
  }
};

/**
 * Bilet güncellendiğinde otomatik etiketleme yapar
 * @param {Object} ticket Güncellenen bilet
 * @param {Object} transaction Sequelize transaction objesi
 * @returns {Array} Uygulanan etiketler
 */
const autoTagUpdatedTicket = async (ticket, transaction = null) => {
  try {
    return await applyRulesToTicket(ticket, transaction);
  } catch (error) {
    console.error('Bilet güncelleme otomatik etiketleme hatası:', error);
    return [];
  }
};

module.exports = {
  applyRulesToTicket,
  applyRuleToAllTickets,
  reapplyAllRules,
  autoTagNewTicket,
  autoTagUpdatedTicket,
  checkConditions
};

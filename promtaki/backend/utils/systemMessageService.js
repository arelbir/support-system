/**
 * Sistem mesajları servisi
 * Otomatik oluşturulan sistem mesajlarını yönetir
 */

const { Message, User } = require('../models');
const socketManager = require('./socketManager');

/**
 * Sistem kullanıcısını döndürür, yoksa oluşturur
 * @returns {Promise<User>} Sistem kullanıcısı
 */
const getSystemUser = async () => {
  let systemUser = await User.findOne({
    where: { username: 'system' }
  });
  
  if (!systemUser) {
    // Sistem kullanıcısını oluştur
    systemUser = await User.create({
      username: 'system',
      email: 'system@promtaki.com',
      password: 'no-login-' + Math.random().toString(36).substring(2, 15),
      role: 'system',
      isActive: true
    });
  }
  
  return systemUser;
};

/**
 * Bilet için sistem mesajı oluşturur
 * @param {Number} ticketId Bilet ID
 * @param {String} message Mesaj içeriği
 * @param {Boolean} isInternal Dahili mesaj mı?
 * @param {Object} attachments Ekler
 * @returns {Promise<Message>} Oluşturulan mesaj
 */
const createSystemMessage = async (ticketId, message, isInternal = false, attachments = []) => {
  try {
    const systemUser = await getSystemUser();
    
    // Mesajı oluştur
    const systemMessage = await Message.create({
      content: message,
      ticketId,
      senderId: systemUser.id,
      isInternal,
      isSystem: true,
      readAt: null, // Sistem mesajları başlangıçta okunmamış olarak işaretlenir
      attachments
    });
    
    // Kaydedilen mesajı ilişkili verilerle birlikte getir
    const newMessage = await Message.findByPk(systemMessage.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'role'] }
      ]
    });
    
    // Socket üzerinden tüm bağlı kullanıcılara gönder
    const io = socketManager.getIO();
    if (io) {
      // Mesajı odadaki kullanıcılara gönder
      if (isInternal) {
        // Operatörlere özel sistem mesajı
        io.to(`ticket_${ticketId}`).emit('receive_message', {
          ...newMessage.toJSON(),
          isOperatorOnly: true
        });
      } else {
        // Herkese açık sistem mesajı
        io.to(`ticket_${ticketId}`).emit('receive_message', newMessage);
      }
    }
    
    return newMessage;
  } catch (error) {
    console.error('Sistem mesajı oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Durum değişikliği mesajı oluşturur
 * @param {Number} ticketId Bilet ID
 * @param {String} oldStatus Eski durum
 * @param {String} newStatus Yeni durum
 * @param {String} username Değişikliği yapan kullanıcı
 * @returns {Promise<Message>} Oluşturulan mesaj
 */
const createStatusChangeMessage = async (ticketId, oldStatus, newStatus, username) => {
  const message = `Destek talebi durumu değiştirildi: ${oldStatus} ➔ ${newStatus} (${username} tarafından)`;
  return await createSystemMessage(ticketId, message, false);
};

/**
 * Operatör atama mesajı oluşturur
 * @param {Number} ticketId Bilet ID
 * @param {String} operatorName Atanan operatör adı
 * @param {String} assignedBy Atamayı yapan kullanıcı
 * @returns {Promise<Message>} Oluşturulan mesaj
 */
const createAssignmentMessage = async (ticketId, operatorName, assignedBy) => {
  const message = `Destek talebi ${operatorName} operatörüne atandı (${assignedBy} tarafından)`;
  return await createSystemMessage(ticketId, message, false);
};

/**
 * SLA değişikliği mesajı oluşturur
 * @param {Number} ticketId Bilet ID
 * @param {String} event SLA olayı ('paused', 'resumed', 'breached')
 * @param {String} reason Neden
 * @returns {Promise<Message>} Oluşturulan mesaj
 */
const createSLAMessage = async (ticketId, event, reason = null) => {
  let message = '';
  let isInternal = true;
  
  switch (event) {
    case 'paused':
      message = `SLA duraklattıldı${reason ? `: ${reason}` : ''}`;
      break;
    case 'resumed':
      message = 'SLA devam ettiriliyor';
      break;
    case 'response_breached':
      message = 'İlk yanıt SLA süresi aşıldı!';
      isInternal = false; // Müşterinin de görmesi gerekiyor
      break;
    case 'resolution_breached':
      message = 'Çözüm SLA süresi aşıldı!';
      isInternal = false; // Müşterinin de görmesi gerekiyor
      break;
    default:
      message = `SLA durumu değişti: ${event}`;
  }
  
  return await createSystemMessage(ticketId, message, isInternal);
};

/**
 * Bilet çözüldü mesajı oluşturur
 * @param {Number} ticketId Bilet ID
 * @param {String} resolvedBy Çözen kullanıcı adı
 * @returns {Promise<Message>} Oluşturulan mesaj
 */
const createResolutionMessage = async (ticketId, resolvedBy) => {
  const message = `Destek talebi çözüldü (${resolvedBy} tarafından)`;
  return await createSystemMessage(ticketId, message, false);
};

/**
 * Öncelik değişikliği mesajı oluşturur
 * @param {Number} ticketId Bilet ID
 * @param {String} oldPriority Eski öncelik
 * @param {String} newPriority Yeni öncelik
 * @param {String} username Değişikliği yapan kullanıcı
 * @returns {Promise<Message>} Oluşturulan mesaj
 */
const createPriorityChangeMessage = async (ticketId, oldPriority, newPriority, username) => {
  const message = `Destek talebi önceliği değiştirildi: ${oldPriority} ➔ ${newPriority} (${username} tarafından)`;
  return await createSystemMessage(ticketId, message, false);
};

module.exports = {
  createSystemMessage,
  createStatusChangeMessage,
  createAssignmentMessage,
  createSLAMessage,
  createResolutionMessage,
  createPriorityChangeMessage
};

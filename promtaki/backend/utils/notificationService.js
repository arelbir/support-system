/**
 * Bildirim Servisi
 * Farklı kanallar üzerinden bildirim gönderme işlemlerini yönetir
 */

const { User, Notification, NotificationPreference } = require('../models');
const socketManager = require('./socketManager');
const nodemailer = require('nodemailer');

// E-posta transporter yapılandırması
let transporter = null;

/**
 * E-posta transporter'ını yapılandırır
 */
const initializeEmailTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('E-posta yapılandırması eksik. E-posta bildirimleri devre dışı.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Servisi başlatır
 */
const initialize = () => {
  // E-posta transporterını başlat
  transporter = initializeEmailTransporter();
  console.log('Bildirim servisi başlatıldı.');
};

/**
 * Bildirim tercihleri kontrolü
 * @param {Object} user Kullanıcı
 * @param {String} notificationType Bildirim tipi
 * @param {String} channel Kanal (email, push, inApp)
 * @returns {Boolean} Bildirim gönderilebilir mi?
 */
const shouldSendNotification = async (user, notificationType, channel) => {
  try {
    // Kullanıcı bildirim tercihleri
    let prefs = await NotificationPreference.findOne({
      where: { userId: user.id }
    });

    // Kullanıcının tercihleri yoksa varsayılan değerlerle oluştur
    if (!prefs) {
      prefs = await NotificationPreference.create({
        userId: user.id
      });
    }

    // Sessiz saatler kontrolü
    if (prefs.quietHoursEnabled) {
      const now = new Date();
      const nowTime = now.getHours() * 100 + now.getMinutes();
      
      let startTime = prefs.quietHoursStart.split(':');
      let endTime = prefs.quietHoursEnd.split(':');
      
      const startMinutes = parseInt(startTime[0]) * 100 + parseInt(startTime[1]);
      const endMinutes = parseInt(endTime[0]) * 100 + parseInt(endTime[1]);
      
      // Sessiz saatler içindeyse ve önemli bir bildirim değilse, gönderme
      if (
        (startMinutes < endMinutes && nowTime >= startMinutes && nowTime <= endMinutes) ||
        (startMinutes > endMinutes && (nowTime >= startMinutes || nowTime <= endMinutes))
      ) {
        if (notificationType !== 'high') {
          return false;
        }
      }
    }

    // Kanal tercihleri kontrolü - yeni sütun adlarını kullan
    if (channel === 'email' && !prefs.emailEnabled) return false;
    if (channel === 'push' && !prefs.pushEnabled) return false;
    if (channel === 'inApp' && !prefs.inAppEnabled) return false;

    // Tip kontrolü - eğer bildirim tercihi tipi 'none' ise hiçbir bildirim gönderilmez
    if (prefs.type === 'none') return false;
    
    // Tip kontrolü - eğer 'all' ise tüm bildirimler gönderilir
    if (prefs.type === 'all') return true;
    
    // Tip 'custom' ise ve ticketNotifications vb. kolonlar yoksa,
    // varsayılan olarak bildirim göndermesine izin verelim
    return true;
  } catch (error) {
    console.error('Bildirim tercihleri kontrolü hatası:', error);
    // Hata durumunda varsayılan olarak bildirim gönder
    return true;
  }
};

/**
 * Uygulama içi bildirim gönderir
 * @param {Number} userId Kullanıcı ID
 * @param {Object} notification Bildirim verileri
 */
const sendInAppNotification = async (userId, notification) => {
  try {
    // WebSocket üzerinden gerçek zamanlı bildirim
    socketManager.notifyUser(userId, 'notification', notification);
    
    // Bildirim durumunu güncelle - JSONB formatına uygun olarak
    await Notification.update(
      { 
        deliveryStatus: {
          inApp: 'delivered',
          email: notification.deliveryStatus?.email || 'disabled',
          push: notification.deliveryStatus?.push || 'disabled'
        },
        channels: {
          ...notification.channels,
          inApp: true
        }
      },
      { where: { id: notification.id } }
    );
    
    return true;
  } catch (error) {
    console.error('Uygulama içi bildirim gönderme hatası:', error);
    
    // Bildirim durumunu güncelle - JSONB formatına uygun olarak
    await Notification.update(
      { 
        deliveryStatus: {
          inApp: 'failed',
          email: notification.deliveryStatus?.email || 'disabled',
          push: notification.deliveryStatus?.push || 'disabled'
        },
        channels: {
          ...notification.channels,
          inApp: false
        }
      },
      { where: { id: notification.id } }
    );
    
    return false;
  }
};

/**
 * E-posta bildirimi gönderir
 * @param {Object} user Kullanıcı
 * @param {Object} notification Bildirim verileri
 */
const sendEmailNotification = async (user, notification) => {
  try {
    if (!transporter) {
      console.warn('E-posta transporterı yapılandırılmamış.');
      return false;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@promtaki.com',
      to: user.email,
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f2f2f2; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333;">${notification.title}</h2>
            <p style="color: #666;">${notification.message}</p>
            ${notification.resourceId ? `<a href="${process.env.FRONTEND_URL}/customer/tickets/${notification.resourceId}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px;">Destek Talebini Görüntüle</a>` : ''}
            <div style="margin-top: 20px; font-size: 12px; color: #999;">
              <p>Bu e-posta Promtaki Destek Sistemi tarafından otomatik olarak gönderilmiştir.</p>
            </div>
          </div>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Bildirim durumunu güncelle
    await Notification.update(
      { 
        deliveryStatus: {
          inApp: notification.deliveryStatus?.inApp || 'disabled',
          email: 'delivered',
          push: notification.deliveryStatus?.push || 'disabled'
        },
        channels: {
          ...notification.channels,
          email: true
        }
      },
      { where: { id: notification.id } }
    );
    
    return true;
  } catch (error) {
    console.error('E-posta bildirimi gönderme hatası:', error);
    
    // Bildirim durumunu güncelle
    await Notification.update(
      { 
        deliveryStatus: {
          inApp: notification.deliveryStatus?.inApp || 'disabled',
          email: 'failed',
          push: notification.deliveryStatus?.push || 'disabled'
        },
        channels: {
          ...notification.channels,
          email: false
        }
      },
      { where: { id: notification.id } }
    );
    
    return false;
  }
};

/**
 * Bildirim oluşturur ve gönderir
 * @param {Object} options Bildirim seçenekleri
 * @returns {Object} Oluşturulan bildirim
 */
const createNotification = async (options) => {
  try {
    const {
      userId,
      title,
      message,
      type = 'system',
      priority = 'medium',
      resourceId = null,
      resourceType = null,
      data = {},
      channels = { inApp: true, email: false, push: false }
    } = options;
    
    // Kullanıcıyı kontrol et
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error(`Kullanıcı bulunamadı: ${userId}`);
    }
    
    // Bildirim oluştur
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      priority,
      resourceId,
      resourceType,
      data,
      channels,
      deliveryStatus: {
        inApp: channels.inApp ? 'pending' : 'disabled',
        email: channels.email ? 'pending' : 'disabled',
        push: channels.push ? 'pending' : 'disabled'
      }
    });
    
    // Bildirim gönderme (her kanal için ayrı tercih kontrolü)
    if (channels.inApp && await shouldSendNotification(user, type, 'inApp')) {
      await sendInAppNotification(userId, notification);
    }
    
    if (channels.email && await shouldSendNotification(user, type, 'email')) {
      await sendEmailNotification(user, notification);
    }
    
    // Push bildirimleri (gelecekte eklenebilir)
    
    return notification;
  } catch (error) {
    console.error('Bildirim oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Bilet oluşturulduğunda bildirim gönderir
 * @param {Object} ticket Bilet
 * @param {Object} creator Oluşturan kullanıcı
 */
const notifyTicketCreated = async (ticket, creator) => {
  try {
    // Operatörlere bildirim
    const operators = await User.findAll({
      where: {
        role: ['operator', 'admin'],
        isActive: true
      }
    });
    
    for (const operator of operators) {
      await createNotification({
        userId: operator.id,
        title: 'Yeni Destek Talebi',
        message: `${creator.username} tarafından "${ticket.subject}" konulu yeni bir destek talebi oluşturuldu.`,
        type: 'ticket',
        priority: ticket.priority === 'high' ? 'high' : 'medium',
        resourceId: ticket.id,
        resourceType: 'ticket',
        data: {
          ticketId: ticket.id,
          subject: ticket.subject,
          priority: ticket.priority
        },
        channels: { inApp: true, email: true }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Bilet oluşturma bildirimi hatası:', error);
    return false;
  }
};

/**
 * Bilet durumu değiştiğinde bildirim gönderir
 * @param {Object} ticket Bilet
 * @param {String} oldStatus Eski durum
 * @param {String} newStatus Yeni durum
 * @param {Object} changer Değiştiren kullanıcı
 */
const notifyStatusChanged = async (ticket, oldStatus, newStatus, changer) => {
  try {
    // Müşteriye bildirim
    await createNotification({
      userId: ticket.userId,
      title: 'Destek Talebi Durumu Değişti',
      message: `"${ticket.subject}" konulu destek talebinizin durumu ${oldStatus} -> ${newStatus} olarak güncellendi.`,
      type: 'status',
      priority: 'medium',
      resourceId: ticket.id,
      resourceType: 'ticket',
      data: {
        ticketId: ticket.id,
        subject: ticket.subject,
        oldStatus,
        newStatus,
        changedBy: {
          id: changer.id,
          username: changer.username
        }
      },
      channels: { inApp: true, email: true }
    });
    
    // Atanan operatöre bildirim (eğer varsa ve değiştiren kişi değilse)
    if (ticket.assignedOperatorId && ticket.assignedOperatorId !== changer.id) {
      await createNotification({
        userId: ticket.assignedOperatorId,
        title: 'Destek Talebi Durumu Değişti',
        message: `Size atanan "${ticket.subject}" konulu destek talebinin durumu ${oldStatus} -> ${newStatus} olarak güncellendi.`,
        type: 'status',
        priority: 'medium',
        resourceId: ticket.id,
        resourceType: 'ticket',
        data: {
          ticketId: ticket.id,
          subject: ticket.subject,
          oldStatus,
          newStatus,
          changedBy: {
            id: changer.id,
            username: changer.username
          }
        },
        channels: { inApp: true, email: false }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Durum değişikliği bildirimi hatası:', error);
    return false;
  }
};

/**
 * Yeni mesaj geldiğinde bildirim gönderir
 * @param {Object} message Mesaj
 * @param {Object} ticket Bilet
 */
const notifyNewMessage = async (message, ticket) => {
  try {
    const sender = await User.findByPk(message.senderId);
    
    // Mesaj dahili ise ve gönderen müşteri değilse
    if (message.isInternal && sender.role !== 'customer') {
      // Operatörlere bildirim
      const operators = await User.findAll({
        where: {
          role: ['operator', 'admin'],
          isActive: true,
          id: { [Op.ne]: message.senderId } // Gönderen hariç
        }
      });
      
      for (const operator of operators) {
        await createNotification({
          userId: operator.id,
          title: 'Yeni Dahili Mesaj',
          message: `${sender.username} tarafından "${ticket.subject}" konulu destek talebine yeni bir dahili mesaj gönderildi.`,
          type: 'message',
          priority: 'medium',
          resourceId: ticket.id,
          resourceType: 'ticket',
          data: {
            ticketId: ticket.id,
            messageId: message.id,
            subject: ticket.subject,
            sender: {
              id: sender.id,
              username: sender.username
            }
          },
          channels: { inApp: true, email: false }
        });
      }
    } else if (!message.isInternal) { // Herkese açık mesaj
      // Mesajı gönderen müşteri ise operatörlere bildirim
      if (sender.role === 'customer') {
        const operators = await User.findAll({
          where: {
            role: ['operator', 'admin'],
            isActive: true
          }
        });
        
        for (const operator of operators) {
          await createNotification({
            userId: operator.id,
            title: 'Müşteriden Yeni Mesaj',
            message: `${sender.username} tarafından "${ticket.subject}" konulu destek talebine yeni bir mesaj gönderildi.`,
            type: 'message',
            priority: ticket.priority === 'high' ? 'high' : 'medium',
            resourceId: ticket.id,
            resourceType: 'ticket',
            data: {
              ticketId: ticket.id,
              messageId: message.id,
              subject: ticket.subject,
              priority: ticket.priority,
              sender: {
                id: sender.id,
                username: sender.username
              }
            },
            channels: { inApp: true, email: true }
          });
        }
      } else if (sender.role !== 'customer') { // Mesajı gönderen operatör ise müşteriye bildirim
        await createNotification({
          userId: ticket.userId,
          title: 'Destek Talebinize Yanıt Geldi',
          message: `"${ticket.subject}" konulu destek talebinize ${sender.username} tarafından yeni bir yanıt gönderildi.`,
          type: 'message',
          priority: 'medium',
          resourceId: ticket.id,
          resourceType: 'ticket',
          data: {
            ticketId: ticket.id,
            messageId: message.id,
            subject: ticket.subject,
            sender: {
              id: sender.id,
              username: sender.username
            }
          },
          channels: { inApp: true, email: true }
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Yeni mesaj bildirimi hatası:', error);
    return false;
  }
};

/**
 * SLA ihlali durumunda bildirim gönderir
 * @param {Object} ticket Bilet
 * @param {String} slaType SLA türü ('response', 'resolution')
 */
const notifySLABreach = async (ticket, slaType) => {
  try {
    const typeText = slaType === 'response' ? 'İlk Yanıt' : 'Çözüm';
    
    // Operatörlere bildirim
    const operators = await User.findAll({
      where: {
        role: ['operator', 'admin'],
        isActive: true
      }
    });
    
    for (const operator of operators) {
      await createNotification({
        userId: operator.id,
        title: `SLA İhlali: ${typeText}`,
        message: `"${ticket.subject}" konulu destek talebi için ${typeText} SLA süresi aşıldı!`,
        type: 'sla',
        priority: 'high',
        resourceId: ticket.id,
        resourceType: 'ticket',
        data: {
          ticketId: ticket.id,
          subject: ticket.subject,
          slaType,
          priority: ticket.priority
        },
        channels: { inApp: true, email: true }
      });
    }
    
    return true;
  } catch (error) {
    console.error('SLA ihlali bildirimi hatası:', error);
    return false;
  }
};

/**
 * Operatör atama durumunda bildirim gönderir
 * @param {Object} ticket Bilet
 * @param {Object} operator Atanan operatör
 * @param {Object} assigner Atamayı yapan kullanıcı
 */
const notifyAssignment = async (ticket, operator, assigner) => {
  try {
    // Atanan operatöre bildirim
    await createNotification({
      userId: operator.id,
      title: 'Destek Talebi Ataması',
      message: `"${ticket.subject}" konulu destek talebi size atandı.`,
      type: 'assignment',
      priority: ticket.priority === 'high' ? 'high' : 'medium',
      resourceId: ticket.id,
      resourceType: 'ticket',
      data: {
        ticketId: ticket.id,
        subject: ticket.subject,
        priority: ticket.priority,
        assignedBy: {
          id: assigner.id,
          username: assigner.username
        }
      },
      channels: { inApp: true, email: false }
    });
    
    return true;
  } catch (error) {
    console.error('Operatör atama bildirimi hatası:', error);
    return false;
  }
};

/**
 * Bildirimlerinizi okur
 * @param {Number} userId Kullanıcı ID
 * @param {Number} notificationId Belirli bir bildirim ID (opsiyonel)
 */
const markNotificationsAsRead = async (userId, notificationId = null) => {
  try {
    const where = { 
      userId, 
      readAt: null 
    };
    
    // Belirli bir bildirim için
    if (notificationId) {
      where.id = notificationId;
    }
    
    // Bildirim(ler)i okundu olarak işaretle
    await Notification.update(
      { 
        readAt: new Date() 
      },
      { where }
    );
    
    return true;
  } catch (error) {
    console.error('Bildirimleri okundu işaretleme hatası:', error);
    return false;
  }
};

/**
 * İşlenmeyen bildirimleri işler
 */
const processUndeliveredNotifications = async () => {
  try {
    // İşlenmeyen bildirimleri al
    const pendingNotifications = await Notification.findAll({
      where: { deliveryStatus: { [Op.contains]: { inApp: 'pending' } } },
      include: [{ model: User }]
    });
    
    console.log(`${pendingNotifications.length} adet işlenmeyen bildirim bulundu.`);
    
    for (const notification of pendingNotifications) {
      console.log(`Bildirim işleniyor: ${notification.id}`);
      
      // Bildirim kanallarını kontrol et
      if (notification.channels.inApp) {
        await sendInAppNotification(notification.userId, notification);
      }
      
      if (notification.channels.email) {
        await sendEmailNotification(notification.User, notification);
      }
    }
    
    return true;
  } catch (error) {
    console.error('İşlenmeyen bildirimler işlenirken hata:', error);
    return false;
  }
};

module.exports = {
  initialize,
  createNotification,
  notifyTicketCreated,
  notifyStatusChanged,
  notifyNewMessage,
  notifySLABreach,
  notifyAssignment,
  markNotificationsAsRead,
  processUndeliveredNotifications
};

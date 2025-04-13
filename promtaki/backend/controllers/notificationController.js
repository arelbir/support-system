const { User, Notification, NotificationPreference } = require('../models');
const notificationService = require('../utils/notificationService');
const { Op } = require('sequelize');

// Kullanıcının bildirimlerini getir
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;
    
    // Bildirim filtresi
    const where = { 
      userId: req.user.id
    };
    
    // Sadece okunmamış bildirimleri iste
    if (unreadOnly === 'true') {
      where.readAt = null; 
    }
    
    // Bildirimleri getir
    const notifications = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    // Okunmamış bildirim sayısı
    const unreadCount = await Notification.count({
      where: {
        userId: req.user.id,
        readAt: null 
      }
    });
    
    res.json({
      notifications: notifications.rows,
      totalCount: notifications.count,
      unreadCount,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Bildirimleri getirme hatası:', error);
    res.status(500).json({
      message: 'Bildirimler alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Bildirim(ler)i okundu olarak işaretle
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tek bir bildirim için
    if (id !== 'all') {
      // Bildirimi bul
      const notification = await Notification.findOne({
        where: {
          id,
          userId: req.user.id
        }
      });
      
      if (!notification) {
        return res.status(404).json({
          message: 'Bildirim bulunamadı.'
        });
      }
      
      // Bildirim zaten okunmuşsa
      if (notification.readAt) {
        return res.json({
          message: 'Bildirim zaten okunmuş.',
          notification
        });
      }
      
      // Okundu olarak işaretle
      notification.readAt = new Date();
      await notification.save();
      
      return res.json({
        message: 'Bildirim okundu olarak işaretlendi.',
        notification
      });
    }
    
    // Tüm bildirimler için
    await Notification.update(
      { readAt: new Date() },
      { 
        where: { 
          userId: req.user.id,
          readAt: null
        } 
      }
    );
    
    return res.json({
      message: 'Tüm bildirimler okundu olarak işaretlendi.'
    });
  } catch (error) {
    console.error('Bildirimi okundu işaretleme hatası:', error);
    res.status(500).json({
      message: 'Bildirim okundu işaretlenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcı bildirim tercihlerini getir
exports.getNotificationPreferences = async (req, res) => {
  try {
    // Bildirim tercihlerini bul - sadece var olan sütunları seçerek
    let preferences = await NotificationPreference.findOne({
      where: { userId: req.user.id },
      attributes: [
        'id', 'userId', 'emailEnabled', 'pushEnabled', 'inAppEnabled', 
        'type', 'quietHoursEnabled', 'quietHoursStart', 'quietHoursEnd', 
        'quietHoursDays', 'createdAt', 'updatedAt'
      ]
    });
    
    // Eğer yoksa oluştur
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: req.user.id
      });
    }
    
    res.json({
      message: 'Bildirim tercihleri başarıyla getirildi.',
      preferences
    });
  } catch (error) {
    console.error('Bildirim tercihlerini getirme hatası:', error);
    res.status(500).json({
      message: 'Bildirim tercihleri alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcı bildirim tercihlerini güncelle
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const {
      emailEnabled,
      pushEnabled,
      inAppEnabled,
      type,
      quietHoursEnabled,
      quietHoursStart,
      quietHoursEnd,
      quietHoursDays
    } = req.body;
    
    // Bildirim tercihlerini bul
    let preferences = await NotificationPreference.findOne({
      where: { userId: req.user.id }
    });
    
    // Eğer yoksa oluştur, varsa güncelle
    if (!preferences) {
      preferences = await NotificationPreference.create({
        userId: req.user.id,
        emailEnabled,
        pushEnabled,
        inAppEnabled,
        type,
        quietHoursEnabled,
        quietHoursStart,
        quietHoursEnd,
        quietHoursDays
      });
    } else {
      await preferences.update({
        emailEnabled: emailEnabled !== undefined ? emailEnabled : preferences.emailEnabled,
        pushEnabled: pushEnabled !== undefined ? pushEnabled : preferences.pushEnabled,
        inAppEnabled: inAppEnabled !== undefined ? inAppEnabled : preferences.inAppEnabled,
        type: type !== undefined ? type : preferences.type,
        quietHoursEnabled: quietHoursEnabled !== undefined ? quietHoursEnabled : preferences.quietHoursEnabled,
        quietHoursStart: quietHoursStart !== undefined ? quietHoursStart : preferences.quietHoursStart,
        quietHoursEnd: quietHoursEnd !== undefined ? quietHoursEnd : preferences.quietHoursEnd,
        quietHoursDays: quietHoursDays !== undefined ? quietHoursDays : preferences.quietHoursDays
      });
    }
    
    res.json({
      message: 'Bildirim tercihleri güncellendi.',
      preferences: await NotificationPreference.findOne({
        where: { userId: req.user.id }
      })
    });
  } catch (error) {
    console.error('Bildirim tercihlerini güncelleme hatası:', error);
    res.status(500).json({
      message: 'Bildirim tercihleri güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Test bildirimi gönder (sadece geliştirme ortamında)
exports.sendTestNotification = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({
        message: 'Bu endpoint sadece geliştirme ortamında kullanılabilir.'
      });
    }
    
    // Channels parametresi dizi veya nesne olabilir, düzgün formata dönüştürüyoruz
    let channels = {
      inApp: true,
      email: false, 
      push: false
    };
    
    // Gelen istekte channels varsa
    if (req.body.channels) {
      // Eğer channels bir dizi ise (["in-app", "email"] gibi)
      if (Array.isArray(req.body.channels)) {
        channels = {
          inApp: req.body.channels.includes('in-app') || req.body.channels.includes('inApp'),
          email: req.body.channels.includes('email'),
          push: req.body.channels.includes('push')
        };
      } 
      // Eğer doğrudan nesne olarak gönderilmişse
      else if (typeof req.body.channels === 'object') {
        channels = req.body.channels;
      }
    }
    
    const notification = await notificationService.createNotification({
      userId: req.user.id,
      title: req.body.title || 'Test Bildirimi',
      message: req.body.message || 'Bu bir test bildirimidir. ' + new Date().toLocaleString(),
      type: req.body.type || 'system',
      priority: req.body.priority || 'medium',
      channels: channels
    });
    
    res.json({
      message: 'Test bildirimi başarıyla gönderildi.',
      notification
    });
  } catch (error) {
    console.error('Test bildirimi gönderme hatası:', error);
    res.status(500).json({
      message: 'Test bildirimi gönderilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Admin: Bekleyen bildirimleri yeniden işle
exports.processUndeliveredNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Bu işlem için admin yetkisi gereklidir.'
      });
    }
    
    const result = await notificationService.processUndeliveredNotifications();
    
    res.json({
      message: 'İşlenmeyen bildirimler yeniden işlendi.',
      success: result
    });
  } catch (error) {
    console.error('Bildirimleri yeniden işleme hatası:', error);
    res.status(500).json({
      message: 'Bildirimler yeniden işlenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

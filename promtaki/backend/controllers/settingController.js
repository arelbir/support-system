const { AdminSetting, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Tüm ayarları getirme
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await AdminSetting.findAll({
      order: [['key', 'ASC']]
    });

    res.status(200).json({
      settings
    });
  } catch (error) {
    console.error('Ayar listeleme hatası:', error);
    res.status(500).json({
      message: 'Ayarlar listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ayar detaylarını getirme
exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await AdminSetting.findOne({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({
        message: 'Ayar bulunamadı.'
      });
    }

    res.status(200).json({
      setting
    });
  } catch (error) {
    console.error('Ayar detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Ayar detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni ayar oluşturma
exports.createSetting = async (req, res) => {
  try {
    const { key, value, description, type } = req.body;
    
    // Ayar anahtarı kontrolü
    const existingSetting = await AdminSetting.findOne({
      where: { key }
    });
    
    if (existingSetting) {
      return res.status(400).json({
        message: 'Bu ayar anahtarı zaten kullanılıyor.'
      });
    }
    
    // Yeni ayar oluştur
    const setting = await AdminSetting.create({
      key,
      value,
      description,
      type: type || 'string'
    });
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'CREATE_SETTING',
      userId: req.user.id,
      targetId: setting.id,
      details: `${req.user.username} kullanıcısı "${key}" ayarını oluşturdu.`
    });

    res.status(201).json({
      message: 'Ayar başarıyla oluşturuldu.',
      setting
    });
  } catch (error) {
    console.error('Ayar oluşturma hatası:', error);
    res.status(500).json({
      message: 'Ayar oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ayar güncelleme
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, type } = req.body;
    
    // Ayarı kontrol et
    const setting = await AdminSetting.findOne({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({
        message: 'Ayar bulunamadı.'
      });
    }
    
    // Değişiklikleri kaydet
    const changes = [];
    if (value !== setting.value) changes.push(`value: ${setting.value} -> ${value}`);
    if (description !== setting.description) changes.push(`description: ${setting.description} -> ${description}`);
    if (type !== setting.type) changes.push(`type: ${setting.type} -> ${type}`);
    
    // Ayarı güncelle
    await setting.update({
      value,
      description,
      type
    });
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'UPDATE_SETTING',
      userId: req.user.id,
      targetId: setting.id,
      details: `${req.user.username} kullanıcısı "${key}" ayarını güncelledi. Değişiklikler: ${changes.join(', ')}`
    });

    res.status(200).json({
      message: 'Ayar başarıyla güncellendi.',
      setting
    });
  } catch (error) {
    console.error('Ayar güncelleme hatası:', error);
    res.status(500).json({
      message: 'Ayar güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ayar silme
exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    // Ayarı kontrol et
    const setting = await AdminSetting.findOne({
      where: { key }
    });
    
    if (!setting) {
      return res.status(404).json({
        message: 'Ayar bulunamadı.'
      });
    }
    
    // Ayarı sil
    await setting.destroy();
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'DELETE_SETTING',
      userId: req.user.id,
      targetId: setting.id,
      details: `${req.user.username} kullanıcısı "${key}" ayarını sildi.`
    });

    res.status(200).json({
      message: 'Ayar başarıyla silindi.'
    });
  } catch (error) {
    console.error('Ayar silme hatası:', error);
    res.status(500).json({
      message: 'Ayar silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

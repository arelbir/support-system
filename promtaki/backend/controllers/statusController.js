const { Status, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Tüm durumları getirme
exports.getAllStatuses = async (req, res) => {
  try {
    const statuses = await Status.findAll({
      order: [['order', 'ASC']]
    });

    res.status(200).json({
      statuses
    });
  } catch (error) {
    console.error('Durum listeleme hatası:', error);
    res.status(500).json({
      message: 'Durumlar listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Durum detaylarını getirme
exports.getStatusById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const status = await Status.findByPk(id);
    
    if (!status) {
      return res.status(404).json({
        message: 'Durum bulunamadı.'
      });
    }

    res.status(200).json({
      status
    });
  } catch (error) {
    console.error('Durum detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Durum detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni durum oluşturma
exports.createStatus = async (req, res) => {
  try {
    const { name, color, description, isDefault, order } = req.body;
    
    // Durum adı kontrolü
    const existingStatus = await Status.findOne({
      where: { name }
    });
    
    if (existingStatus) {
      return res.status(400).json({
        message: 'Bu durum adı zaten kullanılıyor.'
      });
    }
    
    // Varsayılan durum kontrolü
    if (isDefault) {
      // Diğer varsayılan durumları güncelle
      await Status.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }
    
    // Yeni durum oluştur
    const status = await Status.create({
      name,
      color: color || '#777777',
      description,
      isDefault: isDefault || false,
      order: order || 0
    });
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'CREATE_STATUS',
      userId: req.user.id,
      targetId: status.id,
      details: `${req.user.username} kullanıcısı "${name}" durumunu oluşturdu.`
    });

    res.status(201).json({
      message: 'Durum başarıyla oluşturuldu.',
      status
    });
  } catch (error) {
    console.error('Durum oluşturma hatası:', error);
    res.status(500).json({
      message: 'Durum oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Durum güncelleme
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description, isDefault, order } = req.body;
    
    // Durumu kontrol et
    const status = await Status.findByPk(id);
    
    if (!status) {
      return res.status(404).json({
        message: 'Durum bulunamadı.'
      });
    }
    
    // Durum adı kontrolü (eğer değiştiyse)
    if (name !== status.name) {
      const existingStatus = await Status.findOne({
        where: {
          name,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingStatus) {
        return res.status(400).json({
          message: 'Bu durum adı zaten kullanılıyor.'
        });
      }
    }
    
    // Varsayılan durum kontrolü
    if (isDefault && !status.isDefault) {
      // Diğer varsayılan durumları güncelle
      await Status.update(
        { isDefault: false },
        { where: { isDefault: true } }
      );
    }
    
    // Değişiklikleri kaydet
    const changes = [];
    if (name !== status.name) changes.push(`name: ${status.name} -> ${name}`);
    if (color !== status.color) changes.push(`color: ${status.color} -> ${color}`);
    if (description !== status.description) changes.push(`description: ${status.description} -> ${description}`);
    if (isDefault !== status.isDefault) changes.push(`isDefault: ${status.isDefault} -> ${isDefault}`);
    if (order !== status.order) changes.push(`order: ${status.order} -> ${order}`);
    
    // Durumu güncelle
    await status.update({
      name,
      color,
      description,
      isDefault,
      order
    });
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'UPDATE_STATUS',
      userId: req.user.id,
      targetId: status.id,
      details: `${req.user.username} kullanıcısı "${status.name}" durumunu güncelledi. Değişiklikler: ${changes.join(', ')}`
    });

    res.status(200).json({
      message: 'Durum başarıyla güncellendi.',
      status
    });
  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    res.status(500).json({
      message: 'Durum güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Durum silme
exports.deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Durumu kontrol et
    const status = await Status.findByPk(id);
    
    if (!status) {
      return res.status(404).json({
        message: 'Durum bulunamadı.'
      });
    }
    
    // Varsayılan durum silinemez
    if (status.isDefault) {
      return res.status(400).json({
        message: 'Varsayılan durum silinemez.'
      });
    }
    
    // Durumu sil
    await status.destroy();
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'DELETE_STATUS',
      userId: req.user.id,
      targetId: id,
      details: `${req.user.username} kullanıcısı "${status.name}" durumunu sildi.`
    });

    res.status(200).json({
      message: 'Durum başarıyla silindi.'
    });
  } catch (error) {
    console.error('Durum silme hatası:', error);
    res.status(500).json({
      message: 'Durum silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

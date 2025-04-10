const { User, AuditLog } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Kullanıcı listesini getirme (admin için)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtreler
    const filters = {};
    
    // Rol filtresi
    if (req.query.role) {
      filters.role = req.query.role;
    }
    
    // Aktif/pasif filtresi
    if (req.query.isActive === 'true' || req.query.isActive === 'false') {
      filters.isActive = req.query.isActive === 'true';
    }
    
    // Arama filtresi
    if (req.query.search) {
      filters[Op.or] = [
        { username: { [Op.iLike]: `%${req.query.search}%` } },
        { email: { [Op.iLike]: `%${req.query.search}%` } }
      ];
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where: filters,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    res.status(500).json({
      message: 'Kullanıcılar listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcı detaylarını getirme
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı.'
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Kullanıcı detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Kullanıcı detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni kullanıcı oluşturma (admin için)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Kullanıcı adı veya e-posta kontrolü
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        message: 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor.'
      });
    }
    
    // Şifre hash'leme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'customer',
      isActive: true
    });
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'CREATE_USER',
      userId: req.user.id,
      targetId: user.id,
      details: `${req.user.username} kullanıcısı ${username} kullanıcısını oluşturdu.`
    });

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({
      message: 'Kullanıcı oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcı güncelleme (admin için)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;
    
    // Kullanıcıyı kontrol et
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    // Kullanıcı adı veya e-posta kontrolü (eğer değiştiyse)
    if (username !== user.username || email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: id } },
            {
              [Op.or]: [
                { username },
                { email }
              ]
            }
          ]
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          message: 'Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor.'
        });
      }
    }
    
    // Değişiklikleri kaydet
    const changes = [];
    if (username !== user.username) changes.push(`username: ${user.username} -> ${username}`);
    if (email !== user.email) changes.push(`email: ${user.email} -> ${email}`);
    if (role !== user.role) changes.push(`role: ${user.role} -> ${role}`);
    if (isActive !== user.isActive) changes.push(`isActive: ${user.isActive} -> ${isActive}`);
    
    // Kullanıcıyı güncelle
    await user.update({
      username,
      email,
      role,
      isActive
    });
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'UPDATE_USER',
      userId: req.user.id,
      targetId: user.id,
      details: `${req.user.username} kullanıcısı ${username} kullanıcısını güncelledi. Değişiklikler: ${changes.join(', ')}`
    });

    res.status(200).json({
      message: 'Kullanıcı başarıyla güncellendi.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({
      message: 'Kullanıcı güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcı şifresini sıfırlama (admin için)
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    // Kullanıcıyı kontrol et
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    // Şifre hash'leme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Kullanıcı şifresini güncelle
    await user.update({
      password: hashedPassword
    });
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'RESET_PASSWORD',
      userId: req.user.id,
      targetId: user.id,
      details: `${req.user.username} kullanıcısı ${user.username} kullanıcısının şifresini sıfırladı.`
    });

    res.status(200).json({
      message: 'Kullanıcı şifresi başarıyla sıfırlandı.'
    });
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    res.status(500).json({
      message: 'Kullanıcı şifresi sıfırlanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcı silme (admin için)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kullanıcıyı kontrol et
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Kullanıcı bulunamadı.'
      });
    }
    
    // Admin kendisini silemez
    if (user.id === req.user.id) {
      return res.status(400).json({
        message: 'Kendi hesabınızı silemezsiniz.'
      });
    }
    
    // Kullanıcıyı sil
    await user.destroy();
    
    // Denetim kaydı oluştur
    await AuditLog.create({
      action: 'DELETE_USER',
      userId: req.user.id,
      targetId: id,
      details: `${req.user.username} kullanıcısı ${user.username} kullanıcısını sildi.`
    });

    res.status(200).json({
      message: 'Kullanıcı başarıyla silindi.'
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      message: 'Kullanıcı silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

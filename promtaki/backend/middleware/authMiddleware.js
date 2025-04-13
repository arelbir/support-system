const jwt = require('jsonwebtoken');
const { User } = require('../models');

// JWT token doğrulama middleware'i
exports.authenticateToken = async (req, res, next) => {
  try {
    // Authorization header'dan token'ı al
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN formatı

    if (!token) {
      return res.status(401).json({
        message: 'Yetkilendirme token\'ı bulunamadı.'
      });
    }

    // Token'ı doğrula
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: 'Geçersiz veya süresi dolmuş token.'
        });
      }

      // Kullanıcıyı kontrol et
      const user = await User.findByPk(decoded.id);
      
      if (!user || !user.isActive) {
        return res.status(403).json({
          message: 'Kullanıcı bulunamadı veya hesap devre dışı.'
        });
      }

      // Kullanıcı bilgisini request'e ekle
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      next();
    });
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    res.status(500).json({
      message: 'Token doğrulama sırasında bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Rol tabanlı erişim kontrolü middleware'leri
exports.isAdmin = (req, res, next) => {
  // GELİŞTİRME AMAÇLI: Geçici olarak tüm yetkilendirmeleri geçiyor
  // ÖNEMLİ: Prodüksiyona geçmeden önce bu kodu kaldırın
  console.log('Middleware: Admin kontrolü atlandı. Kullanıcı rolü:', req.user?.role);
  return next();
  
  // Normal kod (geliştirme sürecinde devre dışı)
  /*
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      message: 'Bu işlem için yönetici yetkisi gerekiyor.'
    });
  }
  */
};

exports.isOperator = (req, res, next) => {
  if (req.user && (req.user.role === 'operator' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      message: 'Bu işlem için operatör yetkisi gerekiyor.'
    });
  }
};

exports.isCustomerOrOperator = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(403).json({
      message: 'Bu işlem için giriş yapmanız gerekiyor.'
    });
  }
};

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// JWT token oluşturma fonksiyonu
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Kullanıcı kaydı
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Kullanıcı adı veya email zaten kullanılıyor mu kontrol et
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Bu kullanıcı adı veya email zaten kullanılıyor.'
      });
    }

    // Yeni kullanıcı oluştur (şifre User modelindeki hook ile hashlenecek)
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'customer' // Varsayılan rol: customer
    });

    // Hassas bilgileri çıkar
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    // JWT token oluştur
    const token = generateToken(user);

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu.',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      message: 'Kayıt işlemi sırasında bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcı girişi
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email ile kullanıcıyı bul
    const user = await User.findOne({ where: { email } });

    // Kullanıcı bulunamadı veya şifre yanlış
    if (!user || !(await user.validatePassword(password))) {
      return res.status(401).json({
        message: 'Geçersiz email veya şifre.'
      });
    }

    // Kullanıcı aktif değilse
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Hesabınız devre dışı bırakılmış. Lütfen yönetici ile iletişime geçin.'
      });
    }

    // Hassas bilgileri çıkar
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    // JWT token oluştur
    const token = generateToken(user);

    res.status(200).json({
      message: 'Giriş başarılı.',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      message: 'Giriş işlemi sırasında bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Mevcut kullanıcı bilgilerini getir
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user middleware tarafından ekleniyor
    const user = await User.findByPk(req.user.id, {
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
    console.error('Kullanıcı bilgileri hatası:', error);
    res.status(500).json({
      message: 'Kullanıcı bilgileri alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

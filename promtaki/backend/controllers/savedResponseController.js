/**
 * Hazır yanıtlar için controller
 */
const { SavedResponse, User } = require('../models');
const { Op } = require('sequelize');

// Tüm hazır yanıtları listele
exports.getAllResponses = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    // Filtreler
    const filters = {};
    
    // Kategori filtresi
    if (category) {
      filters.category = category;
    }
    
    // Arama filtresi
    if (search) {
      filters[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Kullanıcı rolüne göre filtreleme
    if (req.user.role === 'operator') {
      filters[Op.or] = [
        { isGlobal: true },
        { createdBy: req.user.id }
      ];
    } else if (req.user.role === 'admin') {
      // Admin tüm yanıtları görebilir
    } else {
      // Müşteriler sadece global yanıtları görebilir
      filters.isGlobal = true;
    }
    
    const responses = await SavedResponse.findAll({
      where: filters,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [
        ['category', 'ASC'],
        ['title', 'ASC']
      ]
    });
    
    res.status(200).json({ responses });
  } catch (error) {
    console.error('Hazır yanıt listeleme hatası:', error);
    res.status(500).json({
      message: 'Hazır yanıtlar listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni hazır yanıt oluştur
exports.createResponse = async (req, res) => {
  try {
    const { title, content, category, isGlobal, variables = [] } = req.body;
    
    // Validasyonlar
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
      return res.status(400).json({
        message: 'Geçerli bir başlık belirtilmelidir (en az 2 karakter).'
      });
    }
    
    if (!content || typeof content !== 'string' || content.trim().length < 5) {
      return res.status(400).json({
        message: 'Geçerli bir içerik belirtilmelidir (en az 5 karakter).'
      });
    }
    
    // Admin olmayanlar global yanıt oluşturamaz
    if (isGlobal && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Global yanıt oluşturma yetkiniz bulunmamaktadır.'
      });
    }
    
    // Aynı başlıkta yanıt var mı kontrol et
    const existingResponse = await SavedResponse.findOne({
      where: { 
        title: { [Op.iLike]: title.trim() },
        createdBy: req.user.id
      }
    });
    
    if (existingResponse) {
      return res.status(409).json({
        message: 'Bu başlıkta bir yanıt zaten mevcut.'
      });
    }
    
    // Yeni hazır yanıt oluştur
    const response = await SavedResponse.create({
      title: title.trim(),
      content: content.trim(),
      category: category || null,
      isGlobal: isGlobal && req.user.role === 'admin' ? true : false,
      variables: Array.isArray(variables) ? variables : [],
      createdBy: req.user.id
    });
    
    // Oluşturulan yanıtı kullanıcı bilgisiyle birlikte getir
    const createdResponse = await SavedResponse.findByPk(response.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    res.status(201).json({
      message: 'Hazır yanıt başarıyla oluşturuldu.',
      response: createdResponse
    });
  } catch (error) {
    console.error('Hazır yanıt oluşturma hatası:', error);
    res.status(500).json({
      message: 'Hazır yanıt oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Hazır yanıt detaylarını getir
exports.getResponseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await SavedResponse.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    if (!response) {
      return res.status(404).json({
        message: 'Hazır yanıt bulunamadı.'
      });
    }
    
    // Kullanıcı yetki kontrolü
    if (!response.isGlobal && response.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Bu hazır yanıta erişim yetkiniz bulunmamaktadır.'
      });
    }
    
    res.status(200).json({ response });
  } catch (error) {
    console.error('Hazır yanıt detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Hazır yanıt detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Hazır yanıt güncelle
exports.updateResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, isGlobal, variables = [] } = req.body;
    
    // Hazır yanıt var mı kontrol et
    const response = await SavedResponse.findByPk(id);
    
    if (!response) {
      return res.status(404).json({
        message: 'Hazır yanıt bulunamadı.'
      });
    }
    
    // Kullanıcı yetki kontrolü
    if (response.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Bu hazır yanıtı güncelleme yetkiniz bulunmamaktadır.'
      });
    }
    
    // Validasyonlar
    if (title && (typeof title !== 'string' || title.trim().length < 2)) {
      return res.status(400).json({
        message: 'Geçerli bir başlık belirtilmelidir (en az 2 karakter).'
      });
    }
    
    if (content && (typeof content !== 'string' || content.trim().length < 5)) {
      return res.status(400).json({
        message: 'Geçerli bir içerik belirtilmelidir (en az 5 karakter).'
      });
    }
    
    // Başlık değiştiriliyorsa ve aynı başlıkta başka yanıt var mı kontrol et
    if (title && title !== response.title) {
      const existingResponse = await SavedResponse.findOne({
        where: { 
          title: { [Op.iLike]: title.trim() },
          createdBy: req.user.id,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingResponse) {
        return res.status(409).json({
          message: 'Bu başlıkta bir yanıt zaten mevcut.'
        });
      }
    }
    
    // Global durumu sadece admin değiştirebilir
    const newIsGlobal = isGlobal !== undefined ? (req.user.role === 'admin' ? isGlobal : response.isGlobal) : response.isGlobal;
    
    // Hazır yanıtı güncelle
    await response.update({
      title: title !== undefined ? title.trim() : response.title,
      content: content !== undefined ? content.trim() : response.content,
      category: category !== undefined ? category : response.category,
      isGlobal: newIsGlobal,
      variables: variables !== undefined ? (Array.isArray(variables) ? variables : []) : response.variables,
      updatedBy: req.user.id
    });
    
    // Güncellenmiş yanıtı kullanıcı bilgisiyle birlikte getir
    const updatedResponse = await SavedResponse.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'email']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Hazır yanıt başarıyla güncellendi.',
      response: updatedResponse
    });
  } catch (error) {
    console.error('Hazır yanıt güncelleme hatası:', error);
    res.status(500).json({
      message: 'Hazır yanıt güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Hazır yanıt sil
exports.deleteResponse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hazır yanıt var mı kontrol et
    const response = await SavedResponse.findByPk(id);
    
    if (!response) {
      return res.status(404).json({
        message: 'Hazır yanıt bulunamadı.'
      });
    }
    
    // Kullanıcı yetki kontrolü
    if (response.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Bu hazır yanıtı silme yetkiniz bulunmamaktadır.'
      });
    }
    
    // Hazır yanıtı sil
    await response.destroy();
    
    res.status(200).json({
      message: 'Hazır yanıt başarıyla silindi.'
    });
  } catch (error) {
    console.error('Hazır yanıt silme hatası:', error);
    res.status(500).json({
      message: 'Hazır yanıt silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kategorileri listele
exports.getCategories = async (req, res) => {
  try {
    // Benzersiz kategorileri getir
    const categories = await SavedResponse.findAll({
      attributes: ['category'],
      where: {
        category: {
          [Op.not]: null
        }
      },
      group: ['category'],
      order: [['category', 'ASC']]
    });
    
    const categoryList = categories.map(c => c.category).filter(Boolean);
    
    res.status(200).json({ categories: categoryList });
  } catch (error) {
    console.error('Hazır yanıt kategorileri listeleme hatası:', error);
    res.status(500).json({
      message: 'Hazır yanıt kategorileri listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

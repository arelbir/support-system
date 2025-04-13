const { Tag, Ticket } = require('../models');
const { Op } = require('sequelize');

// Tüm etiketleri listele
exports.getAllTags = async (req, res) => {
  try {
    const { category, active } = req.query;
    
    // Filtreler
    const filters = {};
    
    // Kategori filtresi
    if (category) {
      filters.category = category;
    }
    
    // Aktiflik filtresi
    if (active !== undefined) {
      filters.isActive = active === 'true';
    }
    
    const tags = await Tag.findAll({
      where: filters,
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({ tags });
  } catch (error) {
    console.error('Etiket listeleme hatası:', error);
    res.status(500).json({
      message: 'Etiketler listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni etiket oluştur
exports.createTag = async (req, res) => {
  try {
    const { name, color, category, description } = req.body;
    
    // İsim validasyonu
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        message: 'Geçerli bir etiket adı belirtilmelidir (en az 2 karakter).'
      });
    }
    
    // Renk validasyonu (hex renk kodu)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({
        message: 'Geçerli bir renk kodu belirtilmelidir (örn: #FF5733).'
      });
    }
    
    // Aynı isimde etiket var mı kontrol et
    const existingTag = await Tag.findOne({
      where: { 
        name: { [Op.iLike]: name.trim() } 
      }
    });
    
    if (existingTag) {
      return res.status(409).json({
        message: 'Bu isimde bir etiket zaten mevcut.'
      });
    }
    
    // Yeni etiket oluştur
    const tag = await Tag.create({
      name: name.trim(),
      color: color || '#777777',
      category: category || null,
      description: description || null,
      isActive: true
    });
    
    res.status(201).json({
      message: 'Etiket başarıyla oluşturuldu.',
      tag
    });
  } catch (error) {
    console.error('Etiket oluşturma hatası:', error);
    res.status(500).json({
      message: 'Etiket oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Etiket detaylarını getir
exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tag = await Tag.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: 'tickets',
          through: { attributes: [] },
          attributes: ['id', 'subject']
        }
      ]
    });
    
    if (!tag) {
      return res.status(404).json({
        message: 'Etiket bulunamadı.'
      });
    }
    
    res.status(200).json({ tag });
  } catch (error) {
    console.error('Etiket detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Etiket detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Etiket güncelle
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, category, description, isActive } = req.body;
    
    // Etiket var mı kontrol et
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      return res.status(404).json({
        message: 'Etiket bulunamadı.'
      });
    }
    
    // İsim değiştiriliyorsa ve aynı isimde başka etiket var mı kontrol et
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({
        where: { 
          name: { [Op.iLike]: name.trim() },
          id: { [Op.ne]: id }
        }
      });
      
      if (existingTag) {
        return res.status(409).json({
          message: 'Bu isimde bir etiket zaten mevcut.'
        });
      }
    }
    
    // Renk validasyonu (hex renk kodu)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return res.status(400).json({
        message: 'Geçerli bir renk kodu belirtilmelidir (örn: #FF5733).'
      });
    }
    
    // Etiketi güncelle
    await tag.update({
      name: name !== undefined ? name.trim() : tag.name,
      color: color || tag.color,
      category: category !== undefined ? category : tag.category,
      description: description !== undefined ? description : tag.description,
      isActive: isActive !== undefined ? isActive : tag.isActive
    });
    
    // Güncellenmiş etiketi getir
    const updatedTag = await Tag.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: 'tickets',
          through: { attributes: [] },
          attributes: ['id', 'subject']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Etiket başarıyla güncellendi.',
      tag: updatedTag
    });
  } catch (error) {
    console.error('Etiket güncelleme hatası:', error);
    res.status(500).json({
      message: 'Etiket güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Etiketi sil
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Etiket var mı kontrol et
    const tag = await Tag.findByPk(id);
    
    if (!tag) {
      return res.status(404).json({
        message: 'Etiket bulunamadı.'
      });
    }
    
    // Etiketin ilişkili olduğu ticket'lar var mı kontrol et
    const taggedTicketsCount = await Ticket.count({
      include: [
        {
          model: Tag,
          as: 'tags',
          where: { id }
        }
      ]
    });
    
    if (taggedTicketsCount > 0) {
      return res.status(409).json({
        message: `Bu etiket ${taggedTicketsCount} adet ticket'ta kullanılıyor. Silmek yerine pasif hale getirmeyi deneyin.`,
        taggedTicketsCount
      });
    }
    
    // Etiketi sil
    await tag.destroy();
    
    res.status(200).json({
      message: 'Etiket başarıyla silindi.'
    });
  } catch (error) {
    console.error('Etiket silme hatası:', error);
    res.status(500).json({
      message: 'Etiket silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

const { Product, Module, Ticket, SLA } = require('../models');
const { Op } = require('sequelize');

// Tüm ürünleri listele
exports.getAllProducts = async (req, res) => {
  try {
    const { active } = req.query;
    
    // Filtreler
    const filters = {};
    
    // Aktiflik filtresi
    if (active !== undefined) {
      filters.isActive = active === 'true';
    }
    
    const products = await Product.findAll({
      where: filters,
      order: [['name', 'ASC']],
      include: [
        {
          model: Module,
          as: 'modules',
          attributes: ['id', 'name', 'isActive'],
          required: false
        }
      ]
    });
    
    res.status(200).json({ products });
  } catch (error) {
    console.error('Ürün listeleme hatası:', error);
    res.status(500).json({
      message: 'Ürünler listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni ürün oluştur
exports.createProduct = async (req, res) => {
  try {
    const { name, description, version, releaseDate, supportEndDate } = req.body;
    
    // İsim validasyonu
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        message: 'Geçerli bir ürün adı belirtilmelidir (en az 2 karakter).'
      });
    }
    
    // Aynı isimde ürün var mı kontrol et
    const existingProduct = await Product.findOne({
      where: { 
        name: { [Op.iLike]: name.trim() } 
      }
    });
    
    if (existingProduct) {
      return res.status(409).json({
        message: 'Bu isimde bir ürün zaten mevcut.'
      });
    }
    
    // Yeni ürün oluştur
    const product = await Product.create({
      name: name.trim(),
      description: description || null,
      version: version || null,
      releaseDate: releaseDate || null,
      supportEndDate: supportEndDate || null,
      isActive: true,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      message: 'Ürün başarıyla oluşturuldu.',
      product
    });
  } catch (error) {
    console.error('Ürün oluşturma hatası:', error);
    res.status(500).json({
      message: 'Ürün oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ürün detaylarını getir
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Module,
          as: 'modules',
          attributes: ['id', 'name', 'description', 'isActive']
        },
        {
          model: SLA,
          as: 'slas',
          attributes: ['id', 'priorityLevel', 'responseTimeMinutes', 'resolutionTimeMinutes', 'businessHoursOnly', 'name', 'description', 'isActive']
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({
        message: 'Ürün bulunamadı.'
      });
    }
    
    // Ürünle ilişkili ticket sayısını getir
    const ticketCount = await Ticket.count({
      where: { productId: id }
    });
    
    const productWithTicketCount = {
      ...product.toJSON(),
      ticketCount
    };
    
    res.status(200).json({ product: productWithTicketCount });
  } catch (error) {
    console.error('Ürün detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Ürün detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ürün güncelle
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, version, releaseDate, supportEndDate, isActive } = req.body;
    
    // Ürün var mı kontrol et
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        message: 'Ürün bulunamadı.'
      });
    }
    
    // İsim değiştiriliyorsa ve aynı isimde başka ürün var mı kontrol et
    if (name && name !== product.name) {
      const existingProduct = await Product.findOne({
        where: { 
          name: { [Op.iLike]: name.trim() },
          id: { [Op.ne]: id }
        }
      });
      
      if (existingProduct) {
        return res.status(409).json({
          message: 'Bu isimde bir ürün zaten mevcut.'
        });
      }
    }
    
    // Ürünü güncelle
    await product.update({
      name: name !== undefined ? name.trim() : product.name,
      description: description !== undefined ? description : product.description,
      version: version !== undefined ? version : product.version,
      releaseDate: releaseDate !== undefined ? releaseDate : product.releaseDate,
      supportEndDate: supportEndDate !== undefined ? supportEndDate : product.supportEndDate,
      isActive: isActive !== undefined ? isActive : product.isActive,
      updatedBy: req.user.id
    });
    
    // Güncellenmiş ürünü getir
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Module,
          as: 'modules',
          attributes: ['id', 'name', 'description', 'isActive']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Ürün başarıyla güncellendi.',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    res.status(500).json({
      message: 'Ürün güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ürün sil
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ürün var mı kontrol et
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        message: 'Ürün bulunamadı.'
      });
    }
    
    // Ürünün ilişkili olduğu ticket'lar var mı kontrol et
    const ticketCount = await Ticket.count({
      where: { productId: id }
    });
    
    if (ticketCount > 0) {
      return res.status(409).json({
        message: `Bu ürün ${ticketCount} adet ticket'ta kullanılıyor. Silmek yerine pasif hale getirmeyi deneyin.`,
        ticketCount
      });
    }
    
    // Modülleri sil
    await Module.destroy({
      where: { productId: id }
    });
    
    // SLA'ları sil
    await SLA.destroy({
      where: { productId: id }
    });
    
    // Ürünü sil
    await product.destroy();
    
    res.status(200).json({
      message: 'Ürün ve ilişkili tüm modüller ve SLA ayarları başarıyla silindi.'
    });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json({
      message: 'Ürün silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ürün modüllerini listele
exports.getProductModules = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.query;
    
    // Ürün var mı kontrol et
    const product = await Product.findByPk(id);
    
    if (!product) {
      return res.status(404).json({
        message: 'Ürün bulunamadı.'
      });
    }
    
    // Filtreler
    const filters = { productId: id };
    
    // Aktiflik filtresi
    if (active !== undefined) {
      filters.isActive = active === 'true';
    }
    
    // Modülleri getir
    const modules = await Module.findAll({
      where: filters,
      order: [['name', 'ASC']]
    });
    
    res.status(200).json({ 
      product: {
        id: product.id,
        name: product.name
      },
      modules 
    });
  } catch (error) {
    console.error('Ürün modülleri listeleme hatası:', error);
    res.status(500).json({
      message: 'Ürün modülleri listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni modül oluştur
exports.createModule = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { name, description } = req.body;
    
    // Ürün var mı kontrol et
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({
        message: 'Ürün bulunamadı.'
      });
    }
    
    // İsim validasyonu
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        message: 'Geçerli bir modül adı belirtilmelidir (en az 2 karakter).'
      });
    }
    
    // Aynı isimde modül var mı kontrol et
    const existingModule = await Module.findOne({
      where: { 
        name: { [Op.iLike]: name.trim() },
        productId
      }
    });
    
    if (existingModule) {
      return res.status(409).json({
        message: 'Bu ürün için aynı isimde bir modül zaten mevcut.'
      });
    }
    
    // Yeni modül oluştur
    const module = await Module.create({
      name: name.trim(),
      description: description || null,
      productId,
      isActive: true,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      message: 'Modül başarıyla oluşturuldu.',
      module
    });
  } catch (error) {
    console.error('Modül oluşturma hatası:', error);
    res.status(500).json({
      message: 'Modül oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Modül detaylarını getir
exports.getModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    const module = await Module.findByPk(moduleId, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!module) {
      return res.status(404).json({
        message: 'Modül bulunamadı.'
      });
    }
    
    // Modülle ilişkili ticket sayısını getir
    const ticketCount = await Ticket.count({
      where: { moduleId }
    });
    
    const moduleWithTicketCount = {
      ...module.toJSON(),
      ticketCount
    };
    
    res.status(200).json({ module: moduleWithTicketCount });
  } catch (error) {
    console.error('Modül detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Modül detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Modül güncelle
exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { name, description, isActive } = req.body;
    
    // Modül var mı kontrol et
    const module = await Module.findByPk(moduleId, {
      include: [{ model: Product, as: 'product' }]
    });
    
    if (!module) {
      return res.status(404).json({
        message: 'Modül bulunamadı.'
      });
    }
    
    // İsim değiştiriliyorsa ve aynı isimde başka modül var mı kontrol et
    if (name && name !== module.name) {
      const existingModule = await Module.findOne({
        where: { 
          name: { [Op.iLike]: name.trim() },
          productId: module.productId,
          id: { [Op.ne]: moduleId }
        }
      });
      
      if (existingModule) {
        return res.status(409).json({
          message: 'Bu ürün için aynı isimde bir modül zaten mevcut.'
        });
      }
    }
    
    // Modülü güncelle
    await module.update({
      name: name !== undefined ? name.trim() : module.name,
      description: description !== undefined ? description : module.description,
      isActive: isActive !== undefined ? isActive : module.isActive,
      updatedBy: req.user.id
    });
    
    // Güncellenmiş modülü getir
    const updatedModule = await Module.findByPk(moduleId, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Modül başarıyla güncellendi.',
      module: updatedModule
    });
  } catch (error) {
    console.error('Modül güncelleme hatası:', error);
    res.status(500).json({
      message: 'Modül güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Modül sil
exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    
    // Modül var mı kontrol et
    const module = await Module.findByPk(moduleId);
    
    if (!module) {
      return res.status(404).json({
        message: 'Modül bulunamadı.'
      });
    }
    
    // Modülün ilişkili olduğu ticket'lar var mı kontrol et
    const ticketCount = await Ticket.count({
      where: { moduleId }
    });
    
    if (ticketCount > 0) {
      return res.status(409).json({
        message: `Bu modül ${ticketCount} adet ticket'ta kullanılıyor. Silmek yerine pasif hale getirmeyi deneyin.`,
        ticketCount
      });
    }
    
    // Modülü sil
    await module.destroy();
    
    res.status(200).json({
      message: 'Modül başarıyla silindi.'
    });
  } catch (error) {
    console.error('Modül silme hatası:', error);
    res.status(500).json({
      message: 'Modül silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

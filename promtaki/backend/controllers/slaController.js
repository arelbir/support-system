const { SLA, Product, BusinessHours, Holiday, TicketTimeMetrics } = require('../models');
const { Op } = require('sequelize');
const { calculateDueDate } = require('../utils/slaUtils');

// Tüm SLA'ları listele
exports.getAllSLAs = async (req, res) => {
  try {
    const { productId, active } = req.query;
    
    // Filtreler
    const filters = {};
    
    // Ürün filtresi
    if (productId) {
      filters.productId = productId;
    }
    
    // Aktiflik filtresi
    if (active !== undefined) {
      filters.isActive = active === 'true';
    }
    
    const slas = await SLA.findAll({
      where: filters,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ],
      order: [
        ['productId', 'ASC'],
        ['priorityLevel', 'ASC']
      ]
    });
    
    res.status(200).json({ slas });
  } catch (error) {
    console.error('SLA listeleme hatası:', error);
    res.status(500).json({
      message: 'SLA\'lar listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni SLA oluştur
exports.createSLA = async (req, res) => {
  try {
    const { productId, priority, responseTime, resolutionTime, description } = req.body;
    
    // Validasyonlar
    if (!productId) {
      return res.status(400).json({
        message: 'Ürün ID\'si belirtilmelidir.'
      });
    }
    
    if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        message: 'Geçerli bir öncelik seviyesi belirtilmelidir (low, medium, high, urgent).'
      });
    }
    
    if (!responseTime || responseTime < 0) {
      return res.status(400).json({
        message: 'Geçerli bir yanıt süresi belirtilmelidir (dakika cinsinden pozitif bir sayı).'
      });
    }
    
    if (!resolutionTime || resolutionTime < 0) {
      return res.status(400).json({
        message: 'Geçerli bir çözüm süresi belirtilmelidir (dakika cinsinden pozitif bir sayı).'
      });
    }
    
    // Ürün var mı kontrol et
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({
        message: 'Belirtilen ürün bulunamadı.'
      });
    }
    
    // Aynı ürün ve öncelik seviyesi için SLA var mı kontrol et
    const existingSla = await SLA.findOne({
      where: { 
        productId,
        priorityLevel: priority
      }
    });
    
    if (existingSla) {
      return res.status(409).json({
        message: `Bu ürün için ${priority} öncelik seviyesinde bir SLA zaten tanımlanmış.`
      });
    }
    
    // Yeni SLA oluştur
    const sla = await SLA.create({
      productId,
      priorityLevel: priority,
      responseTimeMinutes: responseTime,
      resolutionTimeMinutes: resolutionTime,
      description: description || null,
      businessHoursOnly: true,
      isActive: true,
      name: `${product.name} ${priority.charAt(0).toUpperCase() + priority.slice(1)} Öncelik SLA`,
      createdBy: req.user.id
    });
    
    // Oluşturulan SLA'yı ürün bilgisiyle birlikte getir
    const createdSla = await SLA.findByPk(sla.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(201).json({
      message: 'SLA başarıyla oluşturuldu.',
      sla: createdSla
    });
  } catch (error) {
    console.error('SLA oluşturma hatası:', error);
    res.status(500).json({
      message: 'SLA oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// SLA detaylarını getir
exports.getSLAById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sla = await SLA.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!sla) {
      return res.status(404).json({
        message: 'SLA bulunamadı.'
      });
    }
    
    res.status(200).json({ sla });
  } catch (error) {
    console.error('SLA detayı getirme hatası:', error);
    res.status(500).json({
      message: 'SLA detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// SLA güncelle
exports.updateSLA = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, priority, responseTime, resolutionTime, description, isActive } = req.body;
    
    // SLA var mı kontrol et
    const sla = await SLA.findByPk(id);
    
    if (!sla) {
      return res.status(404).json({
        message: 'SLA bulunamadı.'
      });
    }
    
    // Validasyonlar
    if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        message: 'Geçerli bir öncelik seviyesi belirtilmelidir (low, medium, high, urgent).'
      });
    }
    
    if (responseTime !== undefined && responseTime < 0) {
      return res.status(400).json({
        message: 'Geçerli bir yanıt süresi belirtilmelidir (dakika cinsinden pozitif bir sayı).'
      });
    }
    
    if (resolutionTime !== undefined && resolutionTime < 0) {
      return res.status(400).json({
        message: 'Geçerli bir çözüm süresi belirtilmelidir (dakika cinsinden pozitif bir sayı).'
      });
    }
    
    // Ürün değişiyorsa, yeni ürün var mı kontrol et
    if (productId && productId !== sla.productId) {
      const product = await Product.findByPk(productId);
      
      if (!product) {
        return res.status(404).json({
          message: 'Belirtilen ürün bulunamadı.'
        });
      }
    }
    
    // Ürün ve öncelik değişiyorsa, aynı kombinasyonda başka SLA var mı kontrol et
    if ((productId && productId !== sla.productId) || (priority && priority !== sla.priorityLevel)) {
      const existingSla = await SLA.findOne({
        where: { 
          productId: productId || sla.productId,
          priorityLevel: priority || sla.priorityLevel,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingSla) {
        return res.status(409).json({
          message: `Bu ürün için ${priority || sla.priorityLevel} öncelik seviyesinde bir SLA zaten tanımlanmış.`
        });
      }
    }
    
    // SLA'yı güncelle
    await sla.update({
      productId: productId || sla.productId,
      priorityLevel: priority || sla.priorityLevel,
      responseTimeMinutes: responseTime !== undefined ? responseTime : sla.responseTimeMinutes,
      resolutionTimeMinutes: resolutionTime !== undefined ? resolutionTime : sla.resolutionTimeMinutes,
      description: description !== undefined ? description : sla.description,
      isActive: isActive !== undefined ? isActive : sla.isActive,
      updatedBy: req.user.id
    });
    
    // Güncellenmiş SLA'yı ürün bilgisiyle birlikte getir
    const updatedSla = await SLA.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        }
      ]
    });
    
    res.status(200).json({
      message: 'SLA başarıyla güncellendi.',
      sla: updatedSla
    });
  } catch (error) {
    console.error('SLA güncelleme hatası:', error);
    res.status(500).json({
      message: 'SLA güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// SLA sil
exports.deleteSLA = async (req, res) => {
  try {
    const { id } = req.params;
    
    // SLA var mı kontrol et
    const sla = await SLA.findByPk(id);
    
    if (!sla) {
      return res.status(404).json({
        message: 'SLA bulunamadı.'
      });
    }
    
    // Bu SLA ile ilişkili aktif ticket'ların sayısını kontrol et
    const activeTicketsCount = await TicketTimeMetrics.count({
      where: {
        slaId: id,
        resolutionDueDate: { [Op.gt]: new Date() }
      }
    });
    
    if (activeTicketsCount > 0) {
      return res.status(409).json({
        message: `Bu SLA ${activeTicketsCount} adet aktif ticket tarafından kullanılıyor. Silmek yerine pasif hale getirmeyi deneyin.`,
        activeTicketsCount
      });
    }
    
    // SLA'yı sil
    await sla.destroy();
    
    res.status(200).json({
      message: 'SLA başarıyla silindi.'
    });
  } catch (error) {
    console.error('SLA silme hatası:', error);
    res.status(500).json({
      message: 'SLA silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Çalışma saatlerini listele
exports.getBusinessHours = async (req, res) => {
  try {
    const businessHours = await BusinessHours.findAll({
      order: [['dayOfWeek', 'ASC']]
    });
    
    res.status(200).json({ businessHours });
  } catch (error) {
    console.error('Çalışma saatleri listeleme hatası:', error);
    res.status(500).json({
      message: 'Çalışma saatleri listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Çalışma saatlerini güncelle
exports.updateBusinessHours = async (req, res) => {
  try {
    const { businessHours } = req.body;
    
    if (!Array.isArray(businessHours) || businessHours.length === 0) {
      return res.status(400).json({
        message: 'Geçerli çalışma saatleri bilgisi belirtilmelidir.'
      });
    }
    
    // Tüm günler için validasyon yap
    for (const hour of businessHours) {
      if (!hour.dayOfWeek || hour.dayOfWeek < 0 || hour.dayOfWeek > 6) {
        return res.status(400).json({
          message: 'Geçerli bir gün belirtilmelidir (0-6 arası, 0 = Pazar).'
        });
      }
      
      if (hour.isWorkingDay) {
        // Çalışma günü olarak işaretlenmişse saatler belirtilmiş olmalı
        if (!hour.startTime || !hour.endTime) {
          return res.status(400).json({
            message: 'Çalışma günleri için başlangıç ve bitiş saati belirtilmelidir.'
          });
        }
        
        // Zaman formatı kontrolü (HH:MM)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(hour.startTime) || !timeRegex.test(hour.endTime)) {
          return res.status(400).json({
            message: 'Saatler geçerli formatta olmalıdır (ÖR: 09:00).'
          });
        }
        
        // Başlangıç saati bitiş saatinden önce olmalı
        const [startHour, startMinute] = hour.startTime.split(':');
        const [endHour, endMinute] = hour.endTime.split(':');
        
        const startTotal = parseInt(startHour) * 60 + parseInt(startMinute);
        const endTotal = parseInt(endHour) * 60 + parseInt(endMinute);
        
        if (startTotal >= endTotal) {
          return res.status(400).json({
            message: 'Başlangıç saati bitiş saatinden önce olmalıdır.'
          });
        }
      }
    }
    
    // Mevcut tüm çalışma saatlerini sil
    await BusinessHours.destroy({ truncate: true });
    
    // Yeni çalışma saatlerini ekle
    for (const hour of businessHours) {
      await BusinessHours.create({
        dayOfWeek: hour.dayOfWeek,
        isWorkingDay: hour.isWorkingDay,
        startTime: hour.isWorkingDay ? hour.startTime : null,
        endTime: hour.isWorkingDay ? hour.endTime : null,
        updatedBy: req.user.id
      });
    }
    
    // Güncellenmiş çalışma saatlerini getir
    const updatedBusinessHours = await BusinessHours.findAll({
      order: [['dayOfWeek', 'ASC']]
    });
    
    res.status(200).json({
      message: 'Çalışma saatleri başarıyla güncellendi.',
      businessHours: updatedBusinessHours
    });
  } catch (error) {
    console.error('Çalışma saatleri güncelleme hatası:', error);
    res.status(500).json({
      message: 'Çalışma saatleri güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Tatilleri listele
exports.getHolidays = async (req, res) => {
  try {
    const { year } = req.query;
    
    // Filtreler
    const filters = {};
    
    // Yıl filtresi
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      
      filters.date = {
        [Op.between]: [startDate, endDate]
      };
    }
    
    const holidays = await Holiday.findAll({
      where: filters,
      order: [['date', 'ASC']]
    });
    
    res.status(200).json({ holidays });
  } catch (error) {
    console.error('Tatil günleri listeleme hatası:', error);
    res.status(500).json({
      message: 'Tatil günleri listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni tatil ekle
exports.createHoliday = async (req, res) => {
  try {
    const { name, date, isRecurringYearly } = req.body;
    
    // Validasyonlar
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        message: 'Geçerli bir tatil adı belirtilmelidir (en az 2 karakter).'
      });
    }
    
    if (!date) {
      return res.status(400).json({
        message: 'Geçerli bir tarih belirtilmelidir.'
      });
    }
    
    // Tarih formatını kontrol et (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        message: 'Tarih geçerli formatta olmalıdır (YYYY-MM-DD).'
      });
    }
    
    // Aynı tarihte tatil var mı kontrol et
    const holidayDate = new Date(date);
    
    const existingHoliday = await Holiday.findOne({
      where: { 
        date: holidayDate
      }
    });
    
    if (existingHoliday) {
      return res.status(409).json({
        message: 'Bu tarih için zaten bir tatil tanımlanmış.'
      });
    }
    
    // Yeni tatil oluştur
    const holiday = await Holiday.create({
      name: name.trim(),
      date: holidayDate,
      isRecurringYearly: isRecurringYearly || false,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      message: 'Tatil günü başarıyla oluşturuldu.',
      holiday
    });
  } catch (error) {
    console.error('Tatil günü oluşturma hatası:', error);
    res.status(500).json({
      message: 'Tatil günü oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Tatil güncelle
exports.updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, isRecurringYearly } = req.body;
    
    // Tatil var mı kontrol et
    const holiday = await Holiday.findByPk(id);
    
    if (!holiday) {
      return res.status(404).json({
        message: 'Tatil günü bulunamadı.'
      });
    }
    
    // Validasyonlar
    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return res.status(400).json({
        message: 'Geçerli bir tatil adı belirtilmelidir (en az 2 karakter).'
      });
    }
    
    // Tarih değişiyorsa, format ve çakışma kontrolü yap
    let holidayDate = holiday.date;
    
    if (date) {
      // Tarih formatını kontrol et (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          message: 'Tarih geçerli formatta olmalıdır (YYYY-MM-DD).'
        });
      }
      
      holidayDate = new Date(date);
      
      // Aynı tarihte başka tatil var mı kontrol et
      const existingHoliday = await Holiday.findOne({
        where: { 
          date: holidayDate,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingHoliday) {
        return res.status(409).json({
          message: 'Bu tarih için zaten bir tatil tanımlanmış.'
        });
      }
    }
    
    // Tatili güncelle
    await holiday.update({
      name: name !== undefined ? name.trim() : holiday.name,
      date: holidayDate,
      isRecurringYearly: isRecurringYearly !== undefined ? isRecurringYearly : holiday.isRecurringYearly,
      updatedBy: req.user.id
    });
    
    // Güncellenmiş tatili getir
    const updatedHoliday = await Holiday.findByPk(id);
    
    res.status(200).json({
      message: 'Tatil günü başarıyla güncellendi.',
      holiday: updatedHoliday
    });
  } catch (error) {
    console.error('Tatil günü güncelleme hatası:', error);
    res.status(500).json({
      message: 'Tatil günü güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Tatil sil
exports.deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Tatil var mı kontrol et
    const holiday = await Holiday.findByPk(id);
    
    if (!holiday) {
      return res.status(404).json({
        message: 'Tatil günü bulunamadı.'
      });
    }
    
    // Tatili sil
    await holiday.destroy();
    
    res.status(200).json({
      message: 'Tatil günü başarıyla silindi.'
    });
  } catch (error) {
    console.error('Tatil günü silme hatası:', error);
    res.status(500).json({
      message: 'Tatil günü silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// SLA hesaplaması için örnek endpoint
exports.calculateSLADueDate = async (req, res) => {
  try {
    const { productId, priority, startDate } = req.body;
    
    // Validasyonlar
    if (!productId) {
      return res.status(400).json({
        message: 'Ürün ID\'si belirtilmelidir.'
      });
    }
    
    if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        message: 'Geçerli bir öncelik seviyesi belirtilmelidir (low, medium, high, urgent).'
      });
    }
    
    // İlgili SLA'yı bul
    const sla = await SLA.findOne({
      where: {
        productId,
        priorityLevel: priority,
        isActive: true
      }
    });
    
    if (!sla) {
      return res.status(404).json({
        message: `Bu ürün için ${priority} öncelik seviyesinde aktif SLA bulunmamaktadır.`
      });
    }
    
    // İş saatlerini getir
    const businessHours = await BusinessHours.findAll();
    
    // Tatil günlerini getir
    const holidays = await Holiday.findAll();
    
    // Başlangıç zamanı olarak şu anı veya belirtilen zamanı kullan
    const start = startDate ? new Date(startDate) : new Date();
    
    // Yanıt ve çözüm tarihlerini hesapla
    const responseDueDate = calculateDueDate(start, sla.responseTimeMinutes, businessHours, holidays);
    const resolutionDueDate = calculateDueDate(start, sla.resolutionTimeMinutes, businessHours, holidays);
    
    res.status(200).json({
      message: 'SLA tarihleri başarıyla hesaplandı.',
      sla: {
        product: { id: sla.productId },
        priorityLevel: sla.priorityLevel,
        responseTimeMinutes: sla.responseTimeMinutes,
        resolutionTimeMinutes: sla.resolutionTimeMinutes
      },
      dueDates: {
        startDate: start,
        responseDueDate,
        resolutionDueDate
      }
    });
  } catch (error) {
    console.error('SLA hesaplama hatası:', error);
    res.status(500).json({
      message: 'SLA tarihleri hesaplanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

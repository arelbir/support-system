const { Ticket, User, Status } = require('../models');
const { Op } = require('sequelize');

// Yeni ticket oluşturma
exports.createTicket = async (req, res) => {
  try {
    const { subject, description, priority, category } = req.body;
    
    // Varsayılan durum ID'sini al (örn. "Açık" durumu)
    const defaultStatus = await Status.findOne({ 
      where: { isDefault: true } 
    });
    
    if (!defaultStatus) {
      return res.status(500).json({
        message: 'Varsayılan durum bulunamadı. Lütfen yönetici ile iletişime geçin.'
      });
    }

    // Yeni ticket oluştur
    const ticket = await Ticket.create({
      subject,
      description,
      priority: priority || 'medium',
      category,
      userId: req.user.id, // Kimlik doğrulama middleware'inden gelen kullanıcı ID'si
      statusId: defaultStatus.id,
      isResolved: false
    });

    // Oluşturulan ticket'ı ilişkili verilerle birlikte getir
    const newTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ]
    });

    res.status(201).json({
      message: 'Ticket başarıyla oluşturuldu.',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Ticket oluşturma hatası:', error);
    res.status(500).json({
      message: 'Ticket oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Kullanıcının kendi ticket'larını listeleme
exports.getMyTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: { userId: req.user.id },
      include: [
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error('Ticket listeleme hatası:', error);
    res.status(500).json({
      message: 'Ticket\'lar listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Operatörler için ticket kuyruğunu listeleme
exports.getTicketQueue = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Filtreler
    const filters = {};
    
    // Durum filtresi
    if (req.query.statusId) {
      filters.statusId = req.query.statusId;
    }
    
    // Atanmamış ticket'lar filtresi
    if (req.query.unassigned === 'true') {
      filters.assignedOperatorId = null;
    }
    
    // Operatöre atanmış ticket'lar filtresi
    if (req.query.assignedToMe === 'true' && req.user.role !== 'customer') {
      filters.assignedOperatorId = req.user.id;
    }
    
    const { count, rows: tickets } = await Ticket.findAndCountAll({
      where: filters,
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ],
      order: [['updatedAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      tickets,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error('Ticket kuyruğu listeleme hatası:', error);
    res.status(500).json({
      message: 'Ticket kuyruğu listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Tek bir ticket'ın detaylarını getirme
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // Kullanıcı yetkisi kontrolü
    // Müşteri sadece kendi ticket'larını görebilir
    if (req.user.role === 'customer' && ticket.userId !== req.user.id) {
      return res.status(403).json({
        message: 'Bu ticket\'ı görüntüleme yetkiniz yok.'
      });
    }

    res.status(200).json({
      ticket
    });
  } catch (error) {
    console.error('Ticket detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Ticket detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket'a operatör atama
exports.assignOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const { operatorId } = req.body;
    
    // Ticket'ı kontrol et
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // Operatörü kontrol et (operatorId null olabilir - atamayı kaldırmak için)
    if (operatorId) {
      const operator = await User.findOne({
        where: {
          id: operatorId,
          role: {
            [Op.or]: ['operator', 'admin']
          }
        }
      });
      
      if (!operator) {
        return res.status(400).json({
          message: 'Geçerli bir operatör seçilmelidir.'
        });
      }
    }
    
    // Ticket'ı güncelle
    await ticket.update({
      assignedOperatorId: operatorId
    });
    
    // Güncellenmiş ticket'ı getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ]
    });

    res.status(200).json({
      message: operatorId ? 'Operatör başarıyla atandı.' : 'Operatör ataması kaldırıldı.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Operatör atama hatası:', error);
    res.status(500).json({
      message: 'Operatör atanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket durumunu güncelleme
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusId } = req.body;
    
    // Ticket'ı kontrol et
    const ticket = await Ticket.findByPk(id);
    
    if (!ticket) {
      return res.status(404).json({
        message: 'Ticket bulunamadı.'
      });
    }
    
    // Durumu kontrol et
    const status = await Status.findByPk(statusId);
    
    if (!status) {
      return res.status(400).json({
        message: 'Geçerli bir durum seçilmelidir.'
      });
    }
    
    // Ticket'ı güncelle
    const isResolved = status.name.toLowerCase().includes('çözüldü') || 
                       status.name.toLowerCase().includes('kapatıldı') ||
                       status.name.toLowerCase().includes('resolved') ||
                       status.name.toLowerCase().includes('closed');
    
    await ticket.update({
      statusId,
      isResolved,
      resolvedAt: isResolved ? new Date() : null
    });
    
    // Güncellenmiş ticket'ı getir
    const updatedTicket = await Ticket.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { model: Status },
        { model: User, as: 'assignedOperator', attributes: ['id', 'username', 'email'] }
      ]
    });

    res.status(200).json({
      message: 'Ticket durumu başarıyla güncellendi.',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    res.status(500).json({
      message: 'Ticket durumu güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

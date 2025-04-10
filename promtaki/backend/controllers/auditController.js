const { AuditLog, User } = require('../models');
const { Op } = require('sequelize');

// Denetim kayıtlarını getirme
exports.getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    
    // Filtreler
    const filters = {};
    
    // Eylem filtresi
    if (req.query.action) {
      filters.action = req.query.action;
    }
    
    // Kullanıcı filtresi
    if (req.query.userId) {
      filters.userId = req.query.userId;
    }
    
    // Tarih aralığı filtresi
    if (req.query.startDate && req.query.endDate) {
      filters.createdAt = {
        [Op.between]: [new Date(req.query.startDate), new Date(req.query.endDate)]
      };
    } else if (req.query.startDate) {
      filters.createdAt = {
        [Op.gte]: new Date(req.query.startDate)
      };
    } else if (req.query.endDate) {
      filters.createdAt = {
        [Op.lte]: new Date(req.query.endDate)
      };
    }
    
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: filters,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      auditLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error('Denetim kaydı listeleme hatası:', error);
    res.status(500).json({
      message: 'Denetim kayıtları listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Denetim kaydı detaylarını getirme
exports.getAuditLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const auditLog = await AuditLog.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'email'] }
      ]
    });
    
    if (!auditLog) {
      return res.status(404).json({
        message: 'Denetim kaydı bulunamadı.'
      });
    }

    res.status(200).json({
      auditLog
    });
  } catch (error) {
    console.error('Denetim kaydı detayı getirme hatası:', error);
    res.status(500).json({
      message: 'Denetim kaydı detayları getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Denetim kaydı eylem türlerini getirme
exports.getAuditLogActions = async (req, res) => {
  try {
    // Benzersiz eylem türlerini getir
    const actions = await AuditLog.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('action')), 'action']],
      order: [['action', 'ASC']]
    });

    res.status(200).json({
      actions: actions.map(a => a.action)
    });
  } catch (error) {
    console.error('Denetim kaydı eylem türleri getirme hatası:', error);
    res.status(500).json({
      message: 'Denetim kaydı eylem türleri getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

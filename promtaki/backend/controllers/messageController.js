const { Message, User } = require('../models');

// Mesaj oluşturma
exports.createMessage = async (req, res) => {
  try {
    const { content, ticketId, isInternal } = req.body;
    
    // Yeni mesaj oluştur
    const message = await Message.create({
      content,
      ticketId,
      senderId: req.user.id,
      isInternal: isInternal || false,
      isRead: false
    });

    // Oluşturulan mesajı ilişkili verilerle birlikte getir
    const newMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'role'] }
      ]
    });

    res.status(201).json({
      message: 'Mesaj başarıyla gönderildi.',
      messageData: newMessage
    });
  } catch (error) {
    console.error('Mesaj oluşturma hatası:', error);
    res.status(500).json({
      message: 'Mesaj gönderilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Ticket'a ait mesajları getirme
exports.getMessagesByTicketId = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Mesajları getir
    const messages = await Message.findAll({
      where: { 
        ticketId,
        // Müşteri ise sadece herkese açık mesajları göster
        ...(req.user.role === 'customer' && { isInternal: false })
      },
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'role'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({
      messages
    });
  } catch (error) {
    console.error('Mesaj listeleme hatası:', error);
    res.status(500).json({
      message: 'Mesajlar listelenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Mesajı okundu olarak işaretleme
exports.markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mesajı bul
    const message = await Message.findByPk(id);
    
    if (!message) {
      return res.status(404).json({
        message: 'Mesaj bulunamadı.'
      });
    }
    
    // Mesajı güncelle
    await message.update({
      isRead: true
    });

    res.status(200).json({
      message: 'Mesaj okundu olarak işaretlendi.'
    });
  } catch (error) {
    console.error('Mesaj güncelleme hatası:', error);
    res.status(500).json({
      message: 'Mesaj güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

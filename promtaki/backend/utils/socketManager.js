/**
 * Socket.io bağlantı yöneticisi
 * Birden fazla modülün io nesnesine erişimini sağlar
 */

const jwt = require('jsonwebtoken');
const { User, Message, Ticket } = require('../models');
const { Op } = require('sequelize');

let io;

/**
 * Socket.io nesnesini başlatır ve olay dinleyicilerini ayarlar
 * @param {Object} ioInstance Socket.io server instance
 */
const init = (ioInstance) => {
  io = ioInstance;
  
  // Socket.IO middleware - JWT token doğrulama
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Yetkilendirme token\'ı bulunamadı.'));
      }
      
      // Token'ı doğrula
      jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
          return next(new Error('Geçersiz veya süresi dolmuş token.'));
        }
        
        // Kullanıcıyı kontrol et
        const user = await User.findByPk(decoded.id);
        
        if (!user || !user.isActive) {
          return next(new Error('Kullanıcı bulunamadı veya hesap devre dışı.'));
        }
        
        // Kullanıcı bilgisini socket'e ekle
        socket.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };
        
        next();
      });
    } catch (error) {
      console.error('Socket.IO yetkilendirme hatası:', error);
      next(new Error('Yetkilendirme sırasında bir hata oluştu.'));
    }
  });
  
  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı:', socket.id, socket.user.username);
    
    // Ticket odasına katılma
    socket.on('join_ticket', async (ticketId) => {
      try {
        // Ticket'ı kontrol et
        const ticket = await Ticket.findByPk(ticketId);
        
        if (!ticket) {
          socket.emit('error', { message: 'Ticket bulunamadı.' });
          return;
        }
        
        // Kullanıcı yetkisi kontrolü
        // Müşteri sadece kendi ticket'larına katılabilir
        if (socket.user.role === 'customer' && ticket.userId !== socket.user.id) {
          socket.emit('error', { message: 'Bu ticket\'a erişim yetkiniz yok.' });
          return;
        }
        
        // Ticket odasına katıl
        socket.join(`ticket_${ticketId}`);
        console.log(`${socket.user.username} kullanıcısı ticket_${ticketId} odasına katıldı.`);
        
        // Katılma bilgisini odaya gönder
        socket.to(`ticket_${ticketId}`).emit('user_joined', {
          user: {
            id: socket.user.id,
            username: socket.user.username,
            role: socket.user.role
          },
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Ticket odasına katılma hatası:', error);
        socket.emit('error', { message: 'Ticket odasına katılırken bir hata oluştu.' });
      }
    });
    
    // Ticket odasından ayrılma
    socket.on('leave_ticket', (ticketId) => {
      socket.leave(`ticket_${ticketId}`);
      console.log(`${socket.user.username} kullanıcısı ticket_${ticketId} odasından ayrıldı.`);
      
      // Ayrılma bilgisini odaya gönder
      socket.to(`ticket_${ticketId}`).emit('user_left', {
        user: {
          id: socket.user.id,
          username: socket.user.username,
          role: socket.user.role
        },
        timestamp: new Date()
      });
    });
    
    // Mesaj gönderme
    socket.on('send_message', async (data) => {
      try {
        const { content, ticketId, isInternal } = data;
        
        // Ticket'ı kontrol et
        const ticket = await Ticket.findByPk(ticketId);
        
        if (!ticket) {
          socket.emit('error', { message: 'Ticket bulunamadı.' });
          return;
        }
        
        // Kullanıcı yetkisi kontrolü
        // Müşteri sadece kendi ticket'larına mesaj gönderebilir
        if (socket.user.role === 'customer' && ticket.userId !== socket.user.id) {
          socket.emit('error', { message: 'Bu ticket\'a mesaj gönderme yetkiniz yok.' });
          return;
        }
        
        // Müşteri internal mesaj gönderemez
        if (socket.user.role === 'customer' && isInternal) {
          socket.emit('error', { message: 'Internal mesaj gönderme yetkiniz yok.' });
          return;
        }
        
        // Mesajı veritabanına kaydet
        const message = await Message.create({
          content,
          ticketId,
          senderId: socket.user.id,
          isInternal: isInternal || false,
          readAt: null,
          isSystem: false,
          attachments: data.attachments || []
        });
        
        // Kaydedilen mesajı ilişkili verilerle birlikte getir
        const newMessage = await Message.findByPk(message.id, {
          include: [
            { model: User, attributes: ['id', 'username', 'email', 'role'] }
          ]
        });
        
        // Mesajı odadaki herkese gönder
        // Internal mesajları sadece operatörlere gönder
        if (isInternal) {
          // Operatörlere özel mesaj
          io.to(`ticket_${ticketId}`).emit('receive_message', {
            ...newMessage.toJSON(),
            isOperatorOnly: true
          });
        } else {
          // Herkese açık mesaj
          io.to(`ticket_${ticketId}`).emit('receive_message', newMessage);
        }
        
        // Eğer müşteri mesaj gönderdiyse, operatörlere bildirim gönder
        if (socket.user.role === 'customer') {
          notifyOperators('new_customer_message', {
            ticketId,
            message: newMessage,
            customer: {
              id: socket.user.id,
              username: socket.user.username
            }
          });
        }
      } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
        socket.emit('error', { message: 'Mesaj gönderilirken bir hata oluştu.' });
      }
    });
    
    // Yazıyor... bildirimi
    socket.on('typing', (ticketId) => {
      socket.to(`ticket_${ticketId}`).emit('user_typing', {
        user: {
          id: socket.user.id,
          username: socket.user.username
        }
      });
    });
    
    // Yazma durduruldu bildirimi
    socket.on('stop_typing', (ticketId) => {
      socket.to(`ticket_${ticketId}`).emit('user_stop_typing', {
        user: {
          id: socket.user.id,
          username: socket.user.username
        }
      });
    });
    
    // Mesaj okundu işaretleme
    socket.on('mark_read', async (messageId) => {
      try {
        // Mesajı bul
        const message = await Message.findByPk(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Mesaj bulunamadı.' });
          return;
        }
        
        // Mesajın bulunduğu ticketı kontrol et
        const ticket = await Ticket.findByPk(message.ticketId);
        
        // Kullanıcı yetkisi kontrolü
        if (socket.user.role === 'customer' && ticket.userId !== socket.user.id) {
          socket.emit('error', { message: 'Bu mesajı işaretleme yetkiniz yok.' });
          return;
        }
        
        // Zaten okunmuşsa işlem yapma
        if (message.readAt) {
          return;
        }
        
        // Mesajı okundu olarak işaretle
        await message.update({
          readAt: new Date()
        });
        
        // Okundu bilgisini odadaki herkese bildir
        io.to(`ticket_${message.ticketId}`).emit('message_read', {
          messageId: message.id,
          readAt: message.readAt,
          readBy: {
            id: socket.user.id,
            username: socket.user.username
          }
        });
      } catch (error) {
        console.error('Mesaj okundu işaretleme hatası:', error);
        socket.emit('error', { message: 'Mesaj okundu işaretlenirken bir hata oluştu.' });
      }
    });
    
    // Birden fazla mesajı okundu işaretleme
    socket.on('mark_all_read', async (ticketId) => {
      try {
        // Ticket'ı kontrol et
        const ticket = await Ticket.findByPk(ticketId);
        
        if (!ticket) {
          socket.emit('error', { message: 'Ticket bulunamadı.' });
          return;
        }
        
        // Kullanıcı yetkisi kontrolü
        if (socket.user.role === 'customer' && ticket.userId !== socket.user.id) {
          socket.emit('error', { message: 'Bu ticket\'taki mesajları işaretleme yetkiniz yok.' });
          return;
        }
        
        // Kullanıcının görebileceği ve henüz okunmamış mesajları bul
        const condition = {
          ticketId,
          readAt: null
        };
        
        // Müşteri ise internal mesajları göremez
        if (socket.user.role === 'customer') {
          condition.isInternal = false;
        }
        
        // Mesajları okundu olarak işaretle
        await Message.update(
          { readAt: new Date() },
          { where: condition }
        );
        
        // Güncellenen mesajları getir
        const updatedMessages = await Message.findAll({
          where: {
            ticketId,
            readAt: {
              [Op.ne]: null
            }
          }
        });
        
        // Okundu bilgisini odadaki herkese bildir
        io.to(`ticket_${ticketId}`).emit('all_messages_read', {
          ticketId,
          readAt: new Date(),
          messageIds: updatedMessages.map(msg => msg.id),
          readBy: {
            id: socket.user.id,
            username: socket.user.username
          }
        });
      } catch (error) {
        console.error('Tüm mesajları okundu işaretleme hatası:', error);
        socket.emit('error', { message: 'Mesajlar okundu işaretlenirken bir hata oluştu.' });
      }
    });
    
    // Bağlantı kapandığında
    socket.on('disconnect', () => {
      console.log('Kullanıcı bağlantısı kesildi:', socket.id, socket.user?.username);
    });
  });
  
  console.log('Socket.io yöneticisi başlatıldı.');
};

/**
 * Socket.io nesnesini döndürür
 * @returns {Object} Socket.io server instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io henüz başlatılmadı!');
  }
  return io;
};

/**
 * Belirli bir odadaki kullanıcılara mesaj gönderir
 * @param {String} room Oda adı
 * @param {String} event Olay adı 
 * @param {Object} data Gönderilecek veri
 */
const emitToRoom = (room, event, data) => {
  if (!io) {
    throw new Error('Socket.io henüz başlatılmadı!');
  }
  
  io.to(room).emit(event, data);
};

/**
 * Bilet odasına mesaj gönderir
 * @param {Number} ticketId Bilet ID
 * @param {String} event Olay adı
 * @param {Object} data Gönderilecek veri
 */
const emitToTicket = (ticketId, event, data) => {
  emitToRoom(`ticket_${ticketId}`, event, data);
};

/**
 * Belirli bir role sahip kullanıcılara bildirim gönderir
 * @param {String} role Kullanıcı rolü ('admin', 'operator', 'customer')
 * @param {String} event Olay adı
 * @param {Object} data Gönderilecek veri
 */
const notifyRole = (role, event, data) => {
  if (!io) {
    throw new Error('Socket.io henüz başlatılmadı!');
  }
  
  // Tüm bağlı soketler arasında dolaşarak ilgili role sahip kullanıcılara bildirim gönder
  const sockets = io.sockets.sockets;
  
  sockets.forEach(socket => {
    if (socket.user && socket.user.role === role) {
      socket.emit(event, data);
    }
  });
};

/**
 * Operatörlere bildirim gönderir
 * @param {String} event Olay adı
 * @param {Object} data Gönderilecek veri
 */
const notifyOperators = (event, data) => {
  notifyRole('operator', event, data);
  notifyRole('admin', event, data); // Adminlere de gönder
};

/**
 * Belirli bir kullanıcıya bildirim gönderir
 * @param {Number} userId Kullanıcı ID
 * @param {String} event Olay adı
 * @param {Object} data Gönderilecek veri
 */
const notifyUser = (userId, event, data) => {
  if (!io) {
    throw new Error('Socket.io henüz başlatılmadı!');
  }
  
  // Tüm bağlı soketler arasında dolaşarak ilgili kullanıcıya bildirim gönder
  const sockets = io.sockets.sockets;
  
  sockets.forEach(socket => {
    if (socket.user && socket.user.id === userId) {
      socket.emit(event, data);
    }
  });
};

module.exports = {
  init,
  getIO,
  emitToRoom,
  emitToTicket,
  notifyRole,
  notifyOperators,
  notifyUser
};

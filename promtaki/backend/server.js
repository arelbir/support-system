require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Message, Ticket } = require('./models');

// Route imports
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(helmet());


// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Promtaki API çalışıyor!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Bir hata oluştu!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

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
        isRead: false
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
  
  // Bağlantı kesildiğinde
  socket.on('disconnect', () => {
    console.log('Kullanıcı bağlantısı kesildi:', socket.id, socket.user?.username);
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');
    
    server.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor.`);
    });
  } catch (error) {
    console.error('Veritabanı bağlantısı başarısız:', error);
  }
};

startServer();

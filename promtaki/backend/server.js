require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, Message, Ticket } = require('./models');
const { swaggerUi, swaggerDocs, swaggerUiOptions } = require('./config/swagger');
const { startSLACronJobs } = require('./utils/slaCronService');
const socketManager = require('./utils/socketManager');
const notificationService = require('./utils/notificationService');
const { Op } = require('sequelize');

// Route imports
const authRoutes = require('./routes/authRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tagRoutes = require('./routes/tagRoutes');
const productRoutes = require('./routes/productRoutes');
const slaRoutes = require('./routes/slaRoutes');
const savedResponseRoutes = require('./routes/savedResponseRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const tagRuleRoutes = require('./routes/tagRuleRoutes');
const knowledgeArticleRoutes = require('./routes/knowledgeArticleRoutes');
const reportRoutes = require('./routes/reportRoutes');

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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, swaggerUiOptions));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Promtaki API çalışıyor!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/saved-responses', savedResponseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tag-rules', tagRuleRoutes);
app.use('/api/knowledge', knowledgeArticleRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Bir hata oluştu!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Create HTTP server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // SLA cron işlerini başlat
    startSLACronJobs();
    console.log('SLA cron işleri başlatıldı.');

    const server = app.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor.`);
    });

    // Socket.io entegrasyonu
    const io = socketIo(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Socket yöneticisini başlat
    socketManager.init(io);
    console.log('Socket.io yöneticisi başlatıldı.');

    // Bildirim servisini başlat
    try {
      notificationService.initialize();
      console.log('Bildirim servisi başlatıldı.');
    } catch (error) {
      console.error('Bildirim servisi başlatma hatası:', error);
    }
    
    // Bilgi bankası servisini başlat
    try {
      const knowledgeBaseService = require('./utils/knowledgeBaseService');
      knowledgeBaseService.setupAutoArticleGeneration();
      console.log('Bilgi bankası servisi başlatıldı.');
    } catch (error) {
      console.error('Bilgi bankası servisi başlatma hatası:', error);
    }
    
    // Rapor cron işlerini başlat
    try {
      const reportCronService = require('./utils/reportCronService');
      reportCronService.startReportCronJobs();
      console.log('Raporlama cron işleri başlatıldı.');
    } catch (error) {
      console.error('Raporlama cron işleri başlatma hatası:', error);
    }

  } catch (error) {
    console.error('Sunucu başlatma hatası:', error);
  }
};

startServer();

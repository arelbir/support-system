const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Kullanıcı kaydı
router.post('/register', authController.register);

// Kullanıcı girişi
router.post('/login', authController.login);

// Mevcut kullanıcı bilgilerini getir (token gerekli)
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;

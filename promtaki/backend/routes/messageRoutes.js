const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken, isCustomerOrOperator } = require('../middleware/authMiddleware');

// Yeni mesaj oluşturma
router.post('/', authenticateToken, messageController.createMessage);

// Ticket'a ait mesajları getirme
router.get('/ticket/:ticketId', authenticateToken, isCustomerOrOperator, messageController.getMessagesByTicketId);

// Mesajı okundu olarak işaretleme
router.put('/:id/read', authenticateToken, messageController.markMessageAsRead);

module.exports = router;

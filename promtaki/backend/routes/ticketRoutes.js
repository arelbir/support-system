const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken, isOperator, isCustomerOrOperator } = require('../middleware/authMiddleware');

// Yeni ticket oluşturma
router.post('/', authenticateToken, ticketController.createTicket);

// Kullanıcının kendi ticket'larını listeleme
router.get('/my', authenticateToken, ticketController.getMyTickets);

// Operatörler için ticket kuyruğunu listeleme
router.get('/queue', authenticateToken, isOperator, ticketController.getTicketQueue);

// Tek bir ticket'ın detaylarını getirme
router.get('/:id', authenticateToken, isCustomerOrOperator, ticketController.getTicketById);

// Ticket'a operatör atama
router.put('/:id/assign', authenticateToken, isOperator, ticketController.assignOperator);

// Ticket durumunu güncelleme
router.put('/:id/status', authenticateToken, isOperator, ticketController.updateTicketStatus);

module.exports = router;

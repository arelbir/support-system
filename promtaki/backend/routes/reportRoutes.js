const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, isAdmin, isOperator } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Raporlama ve istatistik API'leri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Report:
 *       type: object
 *       properties:
 *         period:
 *           type: object
 *           properties:
 *             interval:
 *               type: string
 *               enum: [daily, weekly, monthly, custom]
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *         summary:
 *           type: object
 *           properties:
 *             totalTickets:
 *               type: integer
 *             openTickets:
 *               type: integer
 *             resolvedTickets:
 *               type: integer
 *             closedTickets:
 *               type: integer
 *             resolutionRate:
 *               type: integer
 *         responseTimes:
 *           type: object
 *           properties:
 *             averageFirstResponse:
 *               type: integer
 *             averageResolution:
 *               type: integer
 *         operatorStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               operatorId:
 *                 type: integer
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               ticketCount:
 *                 type: integer
 *               resolvedCount:
 *                 type: integer
 *         tagStats:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               color:
 *                 type: string
 *               category:
 *                 type: string
 *               ticketCount:
 *                 type: integer
 *
 *     ReportNotification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         type:
 *           type: string
 *           enum: [report, system, ticket, sla]
 *         priority:
 *           type: string
 *           enum: [high, normal, low]
 *         resourceType:
 *           type: string
 *           enum: [report, ticket]
 *         resourceId:
 *           type: integer
 *         data:
 *           type: object
 *           properties:
 *             reportId:
 *               type: integer
 *             reportPeriod:
 *               type: object
 *               properties:
 *                 start:
 *                   type: string
 *                   format: date-time
 *                 end:
 *                   type: string
 *                   format: date-time
 *                 interval:
 *                   type: string
 *             pdfPath:
 *               type: string
 *             summary:
 *               type: object
 *         channels:
 *           type: object
 *           properties:
 *             inApp:
 *               type: boolean
 *             email:
 *               type: boolean
 *             push:
 *               type: boolean
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Middleware - Tüm rotalar için kimlik doğrulama gerektirir
router.use(authenticateToken);

/**
 * @swagger
 * /api/reports/custom:
 *   post:
 *     summary: Özelleştirilmiş rapor oluşturur
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startDate
 *               - endDate
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: Başlangıç tarihi
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: Bitiş tarihi
 *               interval:
 *                 type: string
 *                 enum: [daily, weekly, monthly, custom]
 *                 default: custom
 *               includeDetails:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Rapor başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 report:
 *                   $ref: '#/components/schemas/Report'
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.post('/custom', isOperator, reportController.generateCustomReport);

/**
 * @swagger
 * /api/reports/unresponded:
 *   get:
 *     summary: Yanıtsız bilet raporunu getirir
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: thresholdHours
 *         schema:
 *           type: integer
 *         description: Kaç saatten uzun süredir yanıtsız biletleri getireceği (varsayılan 24)
 *     responses:
 *       200:
 *         description: Yanıtsız bilet raporu başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.get('/unresponded', isOperator, reportController.getUnrespondedTickets);

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Dashboard istatistiklerini getirir
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *         description: İstatistik dönemi (varsayılan week)
 *     responses:
 *       200:
 *         description: Dashboard istatistikleri başarıyla alındı
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/dashboard', reportController.getDashboardStats);

/**
 * @swagger
 * /api/reports/download/{reportPath}:
 *   get:
 *     summary: Rapor PDF'ini indirir
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportPath
 *         schema:
 *           type: string
 *         required: true
 *         description: Rapor dosya yolu
 *     responses:
 *       200:
 *         description: Rapor başarıyla indirildi
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Geçersiz dosya yolu
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Rapor dosyası bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/download/:reportPath', isOperator, reportController.downloadReport);

/**
 * @swagger
 * /api/reports/notifications:
 *   get:
 *     summary: Rapor bildirimlerini getirir
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rapor bildirimleri başarıyla alındı
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportNotification'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/notifications', reportController.getReportNotifications);

module.exports = router;

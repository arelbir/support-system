const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Bildirim yönetimi API'leri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       required:
 *         - userId
 *         - title
 *         - message
 *         - type
 *       properties:
 *         id:
 *           type: integer
 *           description: Bildirim ID
 *         userId:
 *           type: integer
 *           description: Bildirim alıcısı
 *         title:
 *           type: string
 *           description: Bildirim başlığı
 *         message:
 *           type: string
 *           description: Bildirim içeriği
 *         type:
 *           type: string
 *           description: Bildirim tipi (system, ticket, message vs)
 *         priority:
 *           type: string
 *           description: Bildirim önceliği (high, normal, low)
 *           enum: [high, normal, low]
 *         resourceType:
 *           type: string
 *           description: İlişkili kaynak tipi (ticket, message vs)
 *         resourceId:
 *           type: integer
 *           description: İlişkili kaynak ID
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: Okundu tarihi (null ise okunmamış)
 *           nullable: true
 *         channels:
 *           type: object
 *           properties:
 *             inApp:
 *               type: boolean
 *               description: Uygulama içi bildirim
 *             email:
 *               type: boolean
 *               description: E-posta bildirimi
 *             push:
 *               type: boolean
 *               description: Push bildirimi
 *     NotificationPreference:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Tercih ID
 *         userId:
 *           type: integer
 *           description: Kullanıcı ID
 *         type:
 *           type: string
 *           description: Bildirim tipi
 *         emailEnabled:
 *           type: boolean
 *           description: E-posta bildirimleri aktif mi?
 *         inAppEnabled:
 *           type: boolean
 *           description: Uygulama içi bildirimler aktif mi?
 *         pushEnabled:
 *           type: boolean
 *           description: Push bildirimler aktif mi?
 *         quietHoursEnabled:
 *           type: boolean
 *           description: Sessiz saatler aktif mi?
 *         quietHoursStart:
 *           type: string
 *           description: Sessiz saatler başlangıç
 *         quietHoursEnd:
 *           type: string
 *           description: Sessiz saatler bitiş
 *         quietHoursDays:
 *           type: array
 *           items:
 *             type: integer
 *           description: Sessiz gün numaraları (0=Pazar, 6=Cumartesi)
 */

// Middleware - Tüm rotalar için kimlik doğrulama gerektirir
router.use(authenticateToken);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Kullanıcının bildirimlerini getirir
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Sayfa başına bildirim sayısı
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Sadece okunmamış bildirimleri getir (readAt=null olanlar)
 *     responses:
 *       200:
 *         description: Bildirimler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notifications:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 *                 totalCount:
 *                   type: integer
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', notificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Kullanıcının bildirim tercihlerini getirir
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Bildirim tercihleri başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 preferences:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotificationPreference'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/preferences', notificationController.getNotificationPreferences);

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: Kullanıcının bildirim tercihlerini günceller
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     emailEnabled:
 *                       type: boolean
 *                     inAppEnabled:
 *                       type: boolean
 *                     pushEnabled:
 *                       type: boolean
 *                     quietHoursEnabled:
 *                       type: boolean
 *                     quietHoursStart:
 *                       type: string
 *                     quietHoursEnd:
 *                       type: string
 *                     quietHoursDays:
 *                       type: array
 *                       items:
 *                         type: integer
 *     responses:
 *       200:
 *         description: Bildirim tercihleri başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.put('/preferences', notificationController.updateNotificationPreferences);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Bildirimi okundu olarak işaretler
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Bildirim ID
 *     responses:
 *       200:
 *         description: Bildirim başarıyla okundu olarak işaretlendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Bildirim bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id/read', notificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/test:
 *   post:
 *     summary: Test bildirimi gönderir (sadece geliştirme ortamında)
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 default: "Test Bildirimi"
 *                 description: Bildirim başlığı
 *               message:
 *                 type: string
 *                 default: "Bu bir test bildirimidir"
 *                 description: Bildirim mesajı
 *               type:
 *                 type: string
 *                 default: "system"
 *                 description: Bildirim tipi
 *               priority:
 *                 type: string
 *                 default: "medium"
 *                 enum: [high, medium, low]
 *                 description: Bildirim önceliği
 *               channels:
 *                 type: object
 *                 properties:
 *                   inApp:
 *                     type: boolean
 *                     default: true
 *                     description: Uygulama içi bildirim
 *                   email:
 *                     type: boolean
 *                     default: false
 *                     description: E-posta bildirimi
 *                   push:
 *                     type: boolean
 *                     default: false
 *                     description: Mobil push bildirimi
 *                 example:
 *                   inApp: true
 *                   email: false
 *                   push: false
 *     responses:
 *       200:
 *         description: Test bildirimi başarıyla gönderildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Test bildirimi başarıyla gönderildi."
 *                 notification:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/test', notificationController.sendTestNotification);

/**
 * @swagger
 * /api/notifications/process-undelivered:
 *   post:
 *     summary: Bekleyen bildirimleri yeniden işler
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Bekleyen bildirimler işlendi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/process-undelivered', notificationController.processUndeliveredNotifications);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const statusController = require('../controllers/statusController');
const settingController = require('../controllers/settingController');
const auditController = require('../controllers/auditController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserAdmin:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: Kullanıcı ID
 *         username:
 *           type: string
 *           description: Kullanıcı adı
 *         email:
 *           type: string
 *           format: email
 *           description: E-posta adresi
 *         role:
 *           type: string
 *           enum: [customer, operator, admin]
 *           description: Kullanıcı rolü
 *         isActive:
 *           type: boolean
 *           description: Kullanıcı aktif mi?
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncelleme tarihi
 *       example:
 *         id: 1
 *         username: johndoe
 *         email: john.doe@example.com
 *         role: operator
 *         isActive: true
 *         createdAt: 2023-01-01T00:00:00.000Z
 *         updatedAt: 2023-01-01T00:00:00.000Z
 * 
 *     Status:
 *       type: object
 *       required:
 *         - name
 *         - color
 *       properties:
 *         id:
 *           type: integer
 *           description: Status ID
 *         name:
 *           type: string
 *           description: Status adı
 *         color:
 *           type: string
 *           description: Status rengi (hex)
 *         description:
 *           type: string
 *           description: Status açıklaması
 *         isDefault:
 *           type: boolean
 *           description: Varsayılan status mu?
 *         order:
 *           type: integer
 *           description: Sıralama
 *       example:
 *         id: 1
 *         name: Açık
 *         color: #4CAF50
 *         description: Açık bilet
 *         isDefault: true
 *         order: 1
 * 
 *     Setting:
 *       type: object
 *       required:
 *         - key
 *         - value
 *       properties:
 *         key:
 *           type: string
 *           description: Ayar anahtarı
 *         value:
 *           type: string
 *           description: Ayar değeri
 *         description:
 *           type: string
 *           description: Ayar açıklaması
 *       example:
 *         key: app_name
 *         value: Promtaki
 *         description: Uygulama adı
 * 
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Log ID
 *         userId:
 *           type: integer
 *           description: İşlemi yapan kullanıcı ID
 *         action:
 *           type: string
 *           description: Yapılan işlem
 *         entity:
 *           type: string
 *           description: İşlem yapılan varlık
 *         entityId:
 *           type: integer
 *           description: Varlık ID
 *         details:
 *           type: object
 *           description: İşlem detayları
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: İşlem tarihi
 *       example:
 *         id: 1
 *         userId: 1
 *         action: create
 *         entity: User
 *         entityId: 2
 *         details: { "username": "newuser", "role": "operator" }
 *         createdAt: 2023-01-01T00:00:00.000Z
 */

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin yönetim işlemleri
 */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Tüm kullanıcıları listele
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         description: Sayfa başına gösterilecek sayı
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [customer, operator, admin]
 *         description: Rol filtresi
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Arama kelimesi (kullanıcı adı veya e-posta)
 *     responses:
 *       200:
 *         description: Kullanıcı listesi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserAdmin'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 * 
 *   post:
 *     summary: Yeni kullanıcı oluştur
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [customer, operator, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Kullanıcı oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAdmin'
 *       400:
 *         description: Geçersiz talep
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Kullanıcı detaylarını getir
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı detayları
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAdmin'
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 * 
 *   put:
 *     summary: Kullanıcı bilgilerini güncelle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               role:
 *                 type: string
 *                 enum: [customer, operator, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Kullanıcı güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAdmin'
 *       400:
 *         description: Geçersiz talep
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 * 
 *   delete:
 *     summary: Kullanıcı sil
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     responses:
 *       200:
 *         description: Kullanıcı silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

/**
 * @swagger
 * /api/admin/users/{id}/reset-password:
 *   put:
 *     summary: Kullanıcı şifresini sıfırla
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kullanıcı ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: Yeni şifre
 *     responses:
 *       200:
 *         description: Şifre sıfırlandı
 *       400:
 *         description: Geçersiz talep
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kullanıcı bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

// Tüm admin route'ları için admin yetkisi gerekli
router.use(authenticateToken, isAdmin);

// Kullanıcı yönetimi route'ları
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.put('/users/:id/reset-password', adminController.resetUserPassword);
router.delete('/users/:id', adminController.deleteUser);

// Durum yönetimi route'ları
router.get('/statuses', statusController.getAllStatuses);
router.get('/statuses/:id', statusController.getStatusById);
router.post('/statuses', statusController.createStatus);
router.put('/statuses/:id', statusController.updateStatus);
router.delete('/statuses/:id', statusController.deleteStatus);

// Sistem ayarları route'ları
router.get('/settings', settingController.getAllSettings);
router.get('/settings/:key', settingController.getSettingByKey);
router.post('/settings', settingController.createSetting);
router.put('/settings/:key', settingController.updateSetting);
router.delete('/settings/:key', settingController.deleteSetting);

// Denetim kayıtları route'ları
router.get('/audit-logs', auditController.getAuditLogs);
router.get('/audit-logs/actions', auditController.getAuditLogActions);
router.get('/audit-logs/:id', auditController.getAuditLogById);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const statusController = require('../controllers/statusController');
const settingController = require('../controllers/settingController');
const auditController = require('../controllers/auditController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

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

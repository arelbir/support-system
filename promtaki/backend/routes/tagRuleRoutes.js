const express = require('express');
const router = express.Router();
const tagRuleController = require('../controllers/tagRuleController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: TagRules
 *   description: Otomatik etiketleme kuralları yönetim API'leri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TagRule:
 *       type: object
 *       required:
 *         - name
 *         - conditions
 *         - tagId
 *       properties:
 *         id:
 *           type: integer
 *           description: Kural ID
 *         name:
 *           type: string
 *           description: Kural adı
 *         description:
 *           type: string
 *           description: Kural açıklaması
 *         conditions:
 *           type: object
 *           description: Etiketleme koşulları
 *           example: {"subject":{"operator":"contains","value":"hata"},"priority":{"operator":"equals","value":"high"}}
 *         priority:
 *           type: integer
 *           description: Kural önceliği (düşük sayı = yüksek öncelik)
 *           default: 10
 *         isActive:
 *           type: boolean
 *           description: Kural aktif mi?
 *           default: true
 *         tagId:
 *           type: integer
 *           description: Uygulanacak etiket ID
 *         createdBy:
 *           type: integer
 *           description: Kuralı oluşturan kullanıcı ID
 *         applicationCount:
 *           type: integer
 *           description: Kuralın uygulanma sayısı
 *         lastAppliedAt:
 *           type: string
 *           format: date-time
 *           description: Son uygulama tarihi
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Oluşturulma tarihi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Güncellenme tarihi
 *     TagRuleTestResult:
 *       type: object
 *       properties:
 *         result:
 *           type: boolean
 *           description: Kural koşullarının eşleşme sonucu
 *         ticket:
 *           type: object
 *           description: Test edilen bilet bilgileri
 */

// Middleware - Tüm rotalar için kimlik doğrulama gerektirir
router.use(authenticateToken);

/**
 * @swagger
 * /api/tag-rules:
 *   get:
 *     summary: Tüm etiket kurallarını getirir
 *     tags: [TagRules]
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Sadece aktif/pasif kuralları filtrele
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: integer
 *         description: Belirli bir etiketin kurallarını filtrele
 *     responses:
 *       200:
 *         description: Kurallar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rules:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TagRule'
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', tagRuleController.getAllRules);

/**
 * @swagger
 * /api/tag-rules/{id}:
 *   get:
 *     summary: Belirli bir etiket kuralını getirir
 *     tags: [TagRules]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Kural ID
 *     responses:
 *       200:
 *         description: Kural başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rule:
 *                   $ref: '#/components/schemas/TagRule'
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Kural bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', tagRuleController.getRuleById);

/**
 * @swagger
 * /api/tag-rules/test:
 *   post:
 *     summary: Etiket kuralı koşullarını test eder
 *     tags: [TagRules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conditions
 *             properties:
 *               conditions:
 *                 type: object
 *                 description: Test edilecek koşullar
 *               ticketId:
 *                 type: integer
 *                 description: Test edilecek bilet ID (opsiyonel)
 *     responses:
 *       200:
 *         description: Test başarıyla tamamlandı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TagRuleTestResult'
 *       400:
 *         description: Geçersiz koşullar
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Bilet bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/test', tagRuleController.testRule);

/**
 * @swagger
 * /api/tag-rules/stats/report:
 *   get:
 *     summary: Etiket kullanım istatistiklerini getirir
 *     tags: [TagRules]
 *     responses:
 *       200:
 *         description: İstatistikler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tagStats:
 *                   type: array
 *                   description: Etiket kullanım istatistikleri
 *                 categoryStats:
 *                   type: array
 *                   description: Kategori bazlı istatistikler
 *                 ruleStats:
 *                   type: array
 *                   description: Kural uygulama istatistikleri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/stats/report', tagRuleController.getTagStats);

/**
 * @swagger
 * /api/tag-rules:
 *   post:
 *     summary: Yeni bir etiket kuralı oluşturur
 *     tags: [TagRules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - conditions
 *               - tagId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kural adı
 *               description:
 *                 type: string
 *                 description: Kural açıklaması
 *               conditions:
 *                 type: object
 *                 description: Etiketleme koşulları
 *               tagId:
 *                 type: integer
 *                 description: Uygulanacak etiket ID
 *               priority:
 *                 type: integer
 *                 description: Kural önceliği
 *                 default: 10
 *               applyToExisting:
 *                 type: boolean
 *                 description: Mevcut biletlere de uygulansın mı?
 *                 default: false
 *     responses:
 *       201:
 *         description: Kural başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rule:
 *                   $ref: '#/components/schemas/TagRule'
 *                 applied:
 *                   type: object
 *                   description: Mevcut biletlere uygulama sonuçları
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', isAdmin, tagRuleController.createRule);

/**
 * @swagger
 * /api/tag-rules/{id}:
 *   put:
 *     summary: Var olan bir etiket kuralını günceller
 *     tags: [TagRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Kural ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Kural adı
 *               description:
 *                 type: string
 *                 description: Kural açıklaması
 *               conditions:
 *                 type: object
 *                 description: Etiketleme koşulları
 *               tagId:
 *                 type: integer
 *                 description: Uygulanacak etiket ID
 *               isActive:
 *                 type: boolean
 *                 description: Kural aktif mi?
 *               priority:
 *                 type: integer
 *                 description: Kural önceliği
 *     responses:
 *       200:
 *         description: Kural başarıyla güncellendi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 rule:
 *                   $ref: '#/components/schemas/TagRule'
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kural bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', isAdmin, tagRuleController.updateRule);

/**
 * @swagger
 * /api/tag-rules/{id}:
 *   delete:
 *     summary: Bir etiket kuralını siler
 *     tags: [TagRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Kural ID
 *     responses:
 *       200:
 *         description: Kural başarıyla silindi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kural bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', isAdmin, tagRuleController.deleteRule);

/**
 * @swagger
 * /api/tag-rules/{id}/apply:
 *   post:
 *     summary: Bir kuralı tüm biletlere uygular
 *     tags: [TagRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Kural ID
 *     responses:
 *       200:
 *         description: Kural başarıyla uygulandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     appliedCount:
 *                       type: integer
 *                       description: Etiket uygulanan bilet sayısı
 *                     tagName:
 *                       type: string
 *                       description: Uygulanan etiket adı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       404:
 *         description: Kural bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:id/apply', isAdmin, tagRuleController.applyRule);

/**
 * @swagger
 * /api/tag-rules/reapply-all:
 *   post:
 *     summary: Tüm aktif kuralları yeniden uygular
 *     tags: [TagRules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tüm kurallar başarıyla uygulandı
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 results:
 *                   type: object
 *                   properties:
 *                     processedTickets:
 *                       type: integer
 *                       description: İşlenen bilet sayısı
 *                     appliedTags:
 *                       type: integer
 *                       description: Uygulanan toplam etiket sayısı
 *       401:
 *         description: Yetkilendirme hatası
 *       403:
 *         description: Yetkisiz erişim
 *       500:
 *         description: Sunucu hatası
 */
router.post('/reapply-all', isAdmin, tagRuleController.reapplyAllRules);

module.exports = router;

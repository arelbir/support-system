const express = require('express');
const router = express.Router();
const knowledgeArticleController = require('../controllers/knowledgeArticleController');
const { authenticateToken, isAdmin, isOperator } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: KnowledgeBase
 *   description: Bilgi bankası yönetimi API'leri
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     KnowledgeArticle:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - authorId
 *       properties:
 *         id:
 *           type: integer
 *           description: Makale ID
 *         title:
 *           type: string
 *           description: Makale başlığı
 *         content:
 *           type: string
 *           description: Makale içeriği (markdown)
 *         summary:
 *           type: string
 *           description: Makale özeti
 *         keywords:
 *           type: array
 *           items:
 *             type: string
 *           description: Anahtar kelimeler
 *         category:
 *           type: string
 *           description: Kategori
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: Makale durumu
 *         visibility:
 *           type: string
 *           enum: [public, internal, private]
 *           description: Görünürlük seviyesi
 *         views:
 *           type: integer
 *           description: Görüntülenme sayısı
 *         helpfulVotes:
 *           type: integer
 *           description: Faydalı oyları
 *         unhelpfulVotes:
 *           type: integer
 *           description: Faydasız oyları
 *         sourceTicketId:
 *           type: integer
 *           description: Kaynak bilet ID
 *         authorId:
 *           type: integer
 *           description: Yazar ID
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Yayınlanma tarihi
 */

// Middleware - Tüm rotalar için kimlik doğrulama gerektirir
router.use(authenticateToken);

/**
 * @swagger
 * /api/knowledge:
 *   get:
 *     summary: Bilgi makalelerini listeler
 *     tags: [KnowledgeBase]
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
 *         description: Sayfa başına öğe sayısı
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Durum filtresi
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [public, internal, private]
 *         description: Görünürlük filtresi
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Kategori filtresi
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: Arama metni
 *       - in: query
 *         name: tagId
 *         schema:
 *           type: integer
 *         description: Etiket filtresi
 *     responses:
 *       200:
 *         description: Makaleler başarıyla listelendi
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', knowledgeArticleController.getAllArticles);

/**
 * @swagger
 * /api/knowledge/{id}:
 *   get:
 *     summary: Belirli bir makaleyi getirir
 *     tags: [KnowledgeBase]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Makale ID
 *     responses:
 *       200:
 *         description: Makale başarıyla getirildi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Makale bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.get('/:id', knowledgeArticleController.getArticleById);

/**
 * @swagger
 * /api/knowledge:
 *   post:
 *     summary: Yeni bir makale oluşturur
 *     tags: [KnowledgeBase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               visibility:
 *                 type: string
 *                 enum: [public, internal, private]
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               sourceTicketId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Makale başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/', isOperator, knowledgeArticleController.createArticle);

/**
 * @swagger
 * /api/knowledge/{id}:
 *   put:
 *     summary: Bir makaleyi günceller
 *     tags: [KnowledgeBase]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Makale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               summary:
 *                 type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               visibility:
 *                 type: string
 *                 enum: [public, internal, private]
 *               tagIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Makale başarıyla güncellendi
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Makale bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.put('/:id', isOperator, knowledgeArticleController.updateArticle);

/**
 * @swagger
 * /api/knowledge/{id}:
 *   delete:
 *     summary: Bir makaleyi siler
 *     tags: [KnowledgeBase]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Makale ID
 *     responses:
 *       200:
 *         description: Makale başarıyla silindi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Makale bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', isAdmin, knowledgeArticleController.deleteArticle);

/**
 * @swagger
 * /api/knowledge/ticket/create:
 *   post:
 *     summary: Bir biletten makale oluşturur
 *     tags: [KnowledgeBase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *             properties:
 *               ticketId:
 *                 type: integer
 *               autoPublish:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Makale başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/ticket/create', isOperator, knowledgeArticleController.createFromTicket);

/**
 * @swagger
 * /api/knowledge/suggest:
 *   post:
 *     summary: İlgili makaleleri önerir
 *     tags: [KnowledgeBase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Öneriler başarıyla alındı
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/suggest', knowledgeArticleController.suggestArticles);

/**
 * @swagger
 * /api/knowledge/ticket/solutions:
 *   post:
 *     summary: Bir bilet için çözüm önerileri getirir
 *     tags: [KnowledgeBase]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticketId
 *             properties:
 *               ticketId:
 *                 type: integer
 *               limit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Çözüm önerileri başarıyla alındı
 *       400:
 *         description: Geçersiz veri
 *       401:
 *         description: Yetkilendirme hatası
 *       500:
 *         description: Sunucu hatası
 */
router.post('/ticket/solutions', isOperator, knowledgeArticleController.suggestSolutionsForTicket);

/**
 * @swagger
 * /api/knowledge/{id}/vote:
 *   post:
 *     summary: Bir makaleyi oylar
 *     tags: [KnowledgeBase]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Makale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - helpful
 *             properties:
 *               helpful:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Oylama başarıyla eklendi
 *       401:
 *         description: Yetkilendirme hatası
 *       404:
 *         description: Makale bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.post('/:id/vote', knowledgeArticleController.voteArticle);

module.exports = router;

const { KnowledgeArticle, Tag, User, Ticket, sequelize } = require('../models');
const { Op } = require('sequelize');
const knowledgeBaseService = require('../utils/knowledgeBaseService');

// Tüm makaleleri listele (filtreleme seçenekleriyle)
exports.getAllArticles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      visibility,
      category,
      searchQuery,
      tagId
    } = req.query;
    
    // Sayfalaştırma
    const offset = (page - 1) * limit;
    
    // Filtreleri oluştur
    const filters = {};
    
    // Durum filtresi
    if (status) {
      filters.status = status;
    }
    
    // Görünürlük filtresi - Sadece admin veya operatör için internal içeriği göster
    if (visibility) {
      filters.visibility = visibility;
    } else if (req.user.role === 'customer') {
      filters.visibility = 'public';
    }
    
    // Kategori filtresi
    if (category) {
      filters.category = category;
    }
    
    // Arama filtresi
    if (searchQuery) {
      filters[Op.or] = [
        { title: { [Op.iLike]: `%${searchQuery}%` } },
        { content: { [Op.iLike]: `%${searchQuery}%` } },
        { keywords: { [Op.contains]: [searchQuery.toLowerCase()] } }
      ];
    }
    
    // Etiket filtresi
    const include = [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'email']
      },
      {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name', 'color', 'category']
      }
    ];
    
    if (tagId) {
      include[1].where = { id: tagId };
    }
    
    // Makaleleri getir
    const { count, rows: articles } = await KnowledgeArticle.findAndCountAll({
      where: filters,
      include,
      order: [['updatedAt', 'DESC']],
      offset,
      limit: parseInt(limit, 10)
    });
    
    // Kategorileri getir
    const categories = await KnowledgeArticle.findAll({
      attributes: [
        'category', 
        [sequelize.fn('COUNT', sequelize.col('*')), 'count']
      ],
      where: req.user.role === 'customer' ? { visibility: 'public' } : {},
      group: ['category'],
      having: sequelize.literal('category IS NOT NULL')
    });
    
    res.status(200).json({
      articles,
      categories: categories.map(c => ({
        name: c.category,
        count: parseInt(c.get('count'))
      })),
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10)
      }
    });
  } catch (error) {
    console.error('Makaleleri getirme hatası:', error);
    res.status(500).json({
      message: 'Makaleler getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Makale detayı getir
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Makaleyi getir
    const article = await KnowledgeArticle.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'category']
        },
        {
          model: KnowledgeArticle,
          as: 'relatedArticles',
          attributes: ['id', 'title', 'status', 'visibility'],
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'username']
            }
          ]
        },
        {
          model: Ticket,
          as: 'sourceTicket',
          attributes: ['id', 'subject', 'status']
        }
      ]
    });
    
    if (!article) {
      return res.status(404).json({
        message: 'Makale bulunamadı.'
      });
    }
    
    // Müşteriler sadece yayınlanmış ve açık makaleleri görebilir
    if (req.user.role === 'customer' && 
        (article.status !== 'published' || article.visibility !== 'public')) {
      return res.status(403).json({
        message: 'Bu makaleyi görüntüleme yetkiniz yok.'
      });
    }
    
    // Görüntülenme sayısını artır
    await knowledgeBaseService.incrementArticleViews(id);
    
    res.status(200).json({ article });
  } catch (error) {
    console.error('Makale getirme hatası:', error);
    res.status(500).json({
      message: 'Makale getirilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Yeni makale oluştur
exports.createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      keywords,
      category,
      status = 'draft',
      visibility = 'public',
      tagIds = [],
      sourceTicketId
    } = req.body;
    
    // Zorunlu alanları kontrol et
    if (!title || !content) {
      return res.status(400).json({
        message: 'Başlık ve içerik zorunludur.'
      });
    }
    
    // Makaleyi oluştur
    const article = await KnowledgeArticle.create({
      title,
      content,
      summary,
      keywords: keywords || [],
      category,
      status,
      visibility,
      sourceTicketId: sourceTicketId || null,
      authorId: req.user.id,
      publishedAt: status === 'published' ? new Date() : null
    });
    
    // Etiketleri ekle
    if (tagIds && tagIds.length > 0) {
      await article.setTags(tagIds);
    }
    
    // Kaynak bileti güncelle
    if (sourceTicketId) {
      await Ticket.update(
        { hasKnowledgeArticle: true },
        { where: { id: sourceTicketId } }
      );
    }
    
    // İlişkili makaleleri bul
    const similarArticles = await knowledgeBaseService.findSimilarArticles(title, content);
    
    if (similarArticles.length > 0) {
      await article.addRelatedArticles(similarArticles.map(a => a.id));
    }
    
    // Makaleyi tüm ilişkileriyle getir
    const createdArticle = await KnowledgeArticle.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'category']
        }
      ]
    });
    
    res.status(201).json({
      message: 'Makale başarıyla oluşturuldu.',
      article: createdArticle,
      similarArticles: similarArticles.map(a => ({
        id: a.id,
        title: a.title
      }))
    });
  } catch (error) {
    console.error('Makale oluşturma hatası:', error);
    res.status(500).json({
      message: 'Makale oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Makaleyi güncelle
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      summary,
      keywords,
      category,
      status,
      visibility,
      tagIds
    } = req.body;
    
    // Makaleyi bul
    const article = await KnowledgeArticle.findByPk(id);
    
    if (!article) {
      return res.status(404).json({
        message: 'Makale bulunamadı.'
      });
    }
    
    // Eğer taslak bir makale yayınlanıyorsa, yayın tarihini ekle
    let publishedAt = article.publishedAt;
    if (status === 'published' && article.status !== 'published') {
      publishedAt = new Date();
    }
    
    // Makaleyi güncelle
    await article.update({
      title: title !== undefined ? title : article.title,
      content: content !== undefined ? content : article.content,
      summary: summary !== undefined ? summary : article.summary,
      keywords: keywords !== undefined ? keywords : article.keywords,
      category: category !== undefined ? category : article.category,
      status: status !== undefined ? status : article.status,
      visibility: visibility !== undefined ? visibility : article.visibility,
      lastUpdatedBy: req.user.id,
      publishedAt
    });
    
    // Etiketleri güncelle
    if (tagIds && Array.isArray(tagIds)) {
      await article.setTags(tagIds);
    }
    
    // Güncellenmiş makaleyi getir
    const updatedArticle = await KnowledgeArticle.findByPk(article.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'category']
        },
        {
          model: KnowledgeArticle,
          as: 'relatedArticles',
          attributes: ['id', 'title', 'status']
        }
      ]
    });
    
    res.status(200).json({
      message: 'Makale başarıyla güncellendi.',
      article: updatedArticle
    });
  } catch (error) {
    console.error('Makale güncelleme hatası:', error);
    res.status(500).json({
      message: 'Makale güncellenirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Makaleyi sil
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Makaleyi bul
    const article = await KnowledgeArticle.findByPk(id);
    
    if (!article) {
      return res.status(404).json({
        message: 'Makale bulunamadı.'
      });
    }
    
    // Makaleyi sil
    await article.destroy();
    
    res.status(200).json({
      message: 'Makale başarıyla silindi.'
    });
  } catch (error) {
    console.error('Makale silme hatası:', error);
    res.status(500).json({
      message: 'Makale silinirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Biletten makale oluştur
exports.createFromTicket = async (req, res) => {
  try {
    const { ticketId, autoPublish = false } = req.body;
    
    // Biletten makale oluştur
    const result = await knowledgeBaseService.createArticleFromTicket({
      ticketId,
      authorId: req.user.id,
      autoPublish
    });
    
    res.status(201).json({
      message: 'Biletten makale başarıyla oluşturuldu.',
      article: result.article,
      similarArticles: result.similarArticles
    });
  } catch (error) {
    console.error('Biletten makale oluşturma hatası:', error);
    res.status(500).json({
      message: 'Biletten makale oluşturulurken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// İlgili makaleleri öner
exports.suggestArticles = async (req, res) => {
  try {
    const { subject, description, limit = 5 } = req.body;
    
    // İlgili makaleleri bul
    const suggestions = await knowledgeBaseService.suggestRelatedArticles({
      subject,
      description,
      limit
    });
    
    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Makale önerisi hatası:', error);
    res.status(500).json({
      message: 'Makaleler önerilirken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Biletler için çözüm önerileri
exports.suggestSolutionsForTicket = async (req, res) => {
  try {
    const { ticketId, limit = 3 } = req.body;
    
    // Çözüm önerilerini bul
    const result = await knowledgeBaseService.suggestSolutionsForTicket({
      ticketId,
      limit
    });
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Çözüm önerisi hatası:', error);
    res.status(500).json({
      message: 'Çözüm önerileri alınırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

// Makaleyi oyla
exports.voteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;
    
    // Oylamayı ekle
    const voteResult = await knowledgeBaseService.voteArticle({
      articleId: id,
      helpful
    });
    
    res.status(200).json({
      message: `Makale ${helpful ? 'faydalı' : 'faydasız'} olarak oylandı.`,
      votes: voteResult
    });
  } catch (error) {
    console.error('Makale oylama hatası:', error);
    res.status(500).json({
      message: 'Makale oylanırken bir hata oluştu.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
    });
  }
};

/**
 * Bilgi Bankası (Knowledge Base) Servisi
 * 
 * Bu servis, destek sistemi için bilgi bankası işlevlerini sağlar:
 * - Çözülmüş biletlerden otomatik makale oluşturma
 * - Benzer makaleleri bulma
 * - İlgili bilgi makaleleri önerme
 */
const { KnowledgeArticle, Ticket, Message, User, Tag } = require('../models');
const { Op, fn, col, literal, where } = require('sequelize');

/**
 * Çözülmüş bilete göre yeni bilgi makalesi oluşturur
 * @param {Object} options - Makale seçenekleri
 * @param {Number} options.ticketId - Kaynak bilet ID
 * @param {Number} options.authorId - Yazar ID
 * @param {Boolean} options.autoPublish - Otomatik yayınlama
 * @returns {Object} Oluşturulan bilgi makalesi
 */
const createArticleFromTicket = async (options) => {
  try {
    const { ticketId, authorId, autoPublish = false } = options;
    
    if (!ticketId || !authorId) {
      throw new Error('Bilet ID ve yazar ID gereklidir.');
    }
    
    // Bileti tüm mesajlarıyla birlikte getir
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: Message,
          order: [['createdAt', 'ASC']],
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'role']
            }
          ]
        },
        {
          model: User,
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'assignedOperator',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'category']
        }
      ]
    });
    
    if (!ticket) {
      throw new Error('Bilet bulunamadı.');
    }
    
    // Makale içeriğini oluştur
    const operatorMessages = ticket.Messages.filter(
      m => (m.senderId === ticket.assignedOperatorId || m.isSystem) && !m.isInternal
    );
    
    if (operatorMessages.length === 0) {
      throw new Error('Kullanılabilir operatör mesajı bulunamadı.');
    }
    
    // Etiketlerden anahtar kelimeleri oluştur
    const keywords = ticket.tags.map(tag => tag.name);
    
    // Müşteri sorusunu bul
    const customerMessages = ticket.Messages.filter(
      m => m.senderId === ticket.userId && !m.isInternal
    );
    
    const firstCustomerMessage = customerMessages.length > 0
      ? customerMessages[0].content
      : ticket.description || '';
    
    // Operatör çözümünü belirle - en uzun veya en son mesajı kullan
    const solutionMessages = operatorMessages
      .filter(m => !m.isSystem)
      .sort((a, b) => b.content.length - a.content.length || b.createdAt - a.createdAt);
    
    const solutionMessage = solutionMessages.length > 0
      ? solutionMessages[0].content
      : operatorMessages[operatorMessages.length - 1].content;
    
    // Makale içeriği oluştur
    const articleContent = `
## Sorun

${firstCustomerMessage.trim()}

## Çözüm

${solutionMessage.trim()}

${operatorMessages.length > 1 ? `
## Ek Bilgiler

${operatorMessages.slice(1, 4).map(m => m.content.trim()).join('\n\n')}
` : ''}

---
*Bu makale #${ticket.id} numaralı destek talebinden otomatik olarak oluşturulmuştur.*
`;
    
    // Bilgi makalesini oluştur
    const article = await KnowledgeArticle.create({
      title: ticket.subject,
      content: articleContent,
      summary: ticket.description || firstCustomerMessage.substring(0, 255),
      keywords: [...keywords, ...extractKeywords(ticket.subject), ...extractKeywords(firstCustomerMessage)],
      category: ticket.tags.find(t => t.category === 'category')?.name || 'Genel',
      status: autoPublish ? 'published' : 'draft',
      visibility: 'public',
      sourceTicketId: ticketId,
      authorId,
      publishedAt: autoPublish ? new Date() : null
    });
    
    // Etiketleri makaleye ekle
    if (ticket.tags && ticket.tags.length > 0) {
      await article.setTags(ticket.tags.map(tag => tag.id));
    }
    
    // Benzer makaleleri bul ve ilişkilendir
    const similarArticles = await findSimilarArticles(article.title, article.content, 3);
    
    if (similarArticles.length > 0) {
      await article.addRelatedArticles(similarArticles.map(a => a.id));
    }
    
    console.log(`Bilgi makalesi oluşturuldu: "${article.title}" (ID: ${article.id})`);
    
    return {
      article,
      similarArticles
    };
  } catch (error) {
    console.error('Bilgi makalesi oluşturma hatası:', error);
    throw error;
  }
};

/**
 * Yeni bir bilet için ilgili bilgi makalelerini önerir
 * @param {Object} options - Arama seçenekleri
 * @param {String} options.subject - Bilet konusu
 * @param {String} options.description - Bilet açıklaması
 * @param {Number} options.limit - Sonuç limiti
 * @returns {Array} İlgili bilgi makaleleri
 */
const suggestRelatedArticles = async (options) => {
  try {
    const { subject, description = '', limit = 5 } = options;
    
    if (!subject) {
      throw new Error('Bilet konusu gereklidir.');
    }
    
    // Konudan ve açıklamadan anahtar kelimeleri çıkar
    const keywords = [
      ...extractKeywords(subject),
      ...extractKeywords(description)
    ];
    
    // İlgili makaleleri bul
    const articles = await KnowledgeArticle.findAll({
      where: {
        status: 'published',
        visibility: 'public',
        [Op.or]: [
          // Başlıkta arama
          where(fn('LOWER', col('title')), {
            [Op.like]: '%' + subject.toLowerCase() + '%'
          }),
          // İçerikte arama
          where(fn('LOWER', col('content')), {
            [Op.like]: '%' + description.toLowerCase().substring(0, 100) + '%'
          }),
          // Anahtar kelimelerde arama
          {
            keywords: {
              [Op.overlap]: keywords
            }
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name', 'color', 'category']
        }
      ],
      order: [
        ['helpfulVotes', 'DESC'],
        ['views', 'DESC'],
        ['publishedAt', 'DESC']
      ],
      limit
    });
    
    return articles;
  } catch (error) {
    console.error('Makale önerisi hatası:', error);
    throw error;
  }
};

/**
 * Yeni bir bilet ve mesajları için bilgi bankasından çözüm önerileri üretir
 * @param {Object} options - Arama seçenekleri
 * @param {Number} options.ticketId - Bilet ID
 * @param {Number} options.limit - Öneri limiti
 * @returns {Array} Önerilen çözümler
 */
const suggestSolutionsForTicket = async (options) => {
  try {
    const { ticketId, limit = 3 } = options;
    
    // Bileti ve mesajlarını getir
    const ticket = await Ticket.findByPk(ticketId, {
      include: [
        {
          model: Message,
          limit: 5,
          order: [['createdAt', 'ASC']],
          where: {
            isInternal: false
          }
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (!ticket) {
      throw new Error('Bilet bulunamadı.');
    }
    
    // Aranacak metni oluştur
    const searchText = [
      ticket.subject,
      ticket.description || '',
      ...ticket.Messages.map(m => m.content).filter(Boolean)
    ].join(' ');
    
    // Etiketlerden anahtar kelimeleri çıkar
    const tagKeywords = ticket.tags.map(tag => tag.name);
    
    // Arama metinden anahtar kelimeleri çıkar
    const textKeywords = extractKeywords(searchText);
    
    // Tüm anahtar kelimeleri birleştir
    const keywords = [...new Set([...tagKeywords, ...textKeywords])];
    
    // İlgili makaleleri bul
    const suggestions = await KnowledgeArticle.findAll({
      where: {
        status: 'published',
        [Op.or]: [
          // Başlık benzerliği
          where(fn('LOWER', col('title')), {
            [Op.like]: '%' + ticket.subject.toLowerCase() + '%'
          }),
          // Anahtar kelime örtüşmesi
          {
            keywords: {
              [Op.overlap]: keywords
            }
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        }
      ],
      order: [
        ['helpfulVotes', 'DESC'],
        ['views', 'DESC']
      ],
      limit
    });
    
    return {
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        description: ticket.description
      },
      keywords,
      suggestions: suggestions.map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary || article.content.substring(0, 200) + '...',
        author: article.author ? article.author.username : 'Bilinmeyen',
        helpfulVotes: article.helpfulVotes,
        category: article.category
      }))
    };
  } catch (error) {
    console.error('Çözüm önerisi hatası:', error);
    throw error;
  }
};

/**
 * Benzer bilgi makalelerini bulur
 * @param {String} title - Makale başlığı
 * @param {String} content - Makale içeriği
 * @param {Number} limit - Sonuç limiti
 * @returns {Array} Benzer makaleler
 */
const findSimilarArticles = async (title, content, limit = 5) => {
  try {
    // Başlık ve içerikten anahtar kelimeleri çıkar
    const keywords = [
      ...extractKeywords(title),
      ...extractKeywords(content)
    ];
    
    // Benzer makaleleri bul
    const similarArticles = await KnowledgeArticle.findAll({
      where: {
        [Op.or]: [
          where(fn('LOWER', col('title')), {
            [Op.like]: '%' + title.toLowerCase().substring(0, 50) + '%'
          }),
          {
            keywords: {
              [Op.overlap]: keywords
            }
          }
        ]
      },
      order: [
        ['helpfulVotes', 'DESC'],
        ['publishedAt', 'DESC']
      ],
      limit
    });
    
    return similarArticles;
  } catch (error) {
    console.error('Benzer makale arama hatası:', error);
    return [];
  }
};

/**
 * Metinden anahtar kelimeleri çıkarır
 * @param {String} text - Kaynak metin
 * @returns {Array} Anahtar kelimeler
 */
const extractKeywords = (text) => {
  if (!text) return [];
  
  // Metni küçük harfe çevir ve noktalama işaretlerini temizle
  const cleanedText = text.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s{2,}/g, ' ');
  
  // Metni kelimelere ayır
  const words = cleanedText.split(' ');
  
  // Stop kelimeleri (Türkçe + İngilizce)
  const stopWords = [
    'bu', 've', 'veya', 'bir', 'ile', 'için', 'ama', 'fakat', 'çünkü', 'arasında',
    'üzerinde', 'altında', 'tarafından', 'gibi', 'kadar', 'nasıl', 'ne', 'neden',
    'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
    'about', 'as', 'but', 'if', 'of', 'from', 'when', 'where', 'why', 'how'
  ];
  
  // Stop kelimeleri hariç tut ve kısa kelimeleri atla
  const keywords = words
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 15); // Maksimum 15 anahtar kelime al
  
  return [...new Set(keywords)]; // Benzersiz yap
};

/**
 * Bilgi makalesinin görüntülenme sayısını artırır
 * @param {Number} articleId - Makale ID
 * @returns {Boolean} Başarı durumu
 */
const incrementArticleViews = async (articleId) => {
  try {
    const article = await KnowledgeArticle.findByPk(articleId);
    
    if (!article) {
      return false;
    }
    
    await article.increment('views');
    return true;
  } catch (error) {
    console.error('Görüntülenme sayısı artırma hatası:', error);
    return false;
  }
};

/**
 * Bilgi makalesine faydalı/faydasız oyu ekler
 * @param {Object} options - Oylama seçenekleri
 * @param {Number} options.articleId - Makale ID
 * @param {Boolean} options.helpful - Faydalı mı?
 * @returns {Object} Güncellenmiş oy sayıları
 */
const voteArticle = async (options) => {
  try {
    const { articleId, helpful } = options;
    
    const article = await KnowledgeArticle.findByPk(articleId);
    
    if (!article) {
      throw new Error('Makale bulunamadı.');
    }
    
    if (helpful) {
      await article.increment('helpfulVotes');
    } else {
      await article.increment('unhelpfulVotes');
    }
    
    return {
      helpful: article.helpfulVotes + (helpful ? 1 : 0),
      unhelpful: article.unhelpfulVotes + (helpful ? 0 : 1)
    };
  } catch (error) {
    console.error('Makale oylama hatası:', error);
    throw error;
  }
};

// Çözülen biletlerden otomatik makale oluşturma
const setupAutoArticleGeneration = async () => {
  try {
    // Sequelize Model hooks kullanarak, bilet çözüldüğünde otomatik makale oluştur
    const Ticket = require('../models').Ticket;
    
    Ticket.afterUpdate(async (ticket, options) => {
      // Bilet durumu "resolved" olarak güncellendiyse
      if (ticket.changed('status') && ticket.status === 'resolved' && ticket.previous('status') !== 'resolved') {
        try {
          // Bilet operatörü atanmışsa
          if (ticket.assignedOperatorId) {
            console.log(`Çözülen bilet #${ticket.id} için otomatik bilgi makalesi oluşturuluyor...`);
            
            // Makale taslağı oluştur
            await createArticleFromTicket({
              ticketId: ticket.id,
              authorId: ticket.assignedOperatorId,
              autoPublish: false // İnceleme için taslak olarak oluştur
            });
          }
        } catch (err) {
          console.error(`Otomatik makale oluşturma hatası (Bilet #${ticket.id}):`, err);
        }
      }
    });
    
    console.log('Otomatik bilgi makalesi oluşturma işlevi etkinleştirildi.');
  } catch (error) {
    console.error('Otomatik makale oluşturma kurulum hatası:', error);
  }
};

module.exports = {
  createArticleFromTicket,
  suggestRelatedArticles,
  suggestSolutionsForTicket,
  findSimilarArticles,
  incrementArticleViews,
  voteArticle,
  setupAutoArticleGeneration
};

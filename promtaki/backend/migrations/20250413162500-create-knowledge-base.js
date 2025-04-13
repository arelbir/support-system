'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Bilgi Makaleleri tablosu
    await queryInterface.createTable('KnowledgeArticles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      summary: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      keywords: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'draft'
      },
      visibility: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'public'
      },
      views: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      helpfulVotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      unhelpfulVotes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      sourceTicketId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      lastUpdatedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // İlişkili makaleler tablosu
    await queryInterface.createTable('RelatedArticles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      articleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'KnowledgeArticles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      relatedArticleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'KnowledgeArticles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Makale etiketleri tablosu
    await queryInterface.createTable('KnowledgeArticleTags', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      knowledgeArticleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'KnowledgeArticles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tagId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tags',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // İndeksler
    await queryInterface.addIndex('KnowledgeArticles', ['title']);
    await queryInterface.addIndex('KnowledgeArticles', ['status']);
    await queryInterface.addIndex('KnowledgeArticles', ['visibility']);
    await queryInterface.addIndex('KnowledgeArticles', ['authorId']);
    await queryInterface.addIndex('KnowledgeArticles', ['category']);
    await queryInterface.addIndex('KnowledgeArticles', ['sourceTicketId']);
    
    await queryInterface.addIndex('RelatedArticles', ['articleId', 'relatedArticleId'], {
      unique: true
    });
    
    await queryInterface.addIndex('KnowledgeArticleTags', ['knowledgeArticleId', 'tagId'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('KnowledgeArticleTags');
    await queryInterface.dropTable('RelatedArticles');
    await queryInterface.dropTable('KnowledgeArticles');
  }
};

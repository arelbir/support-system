'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. SavedResponse tablosunu oluştur
    await queryInterface.createTable('SavedResponses', {
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
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Tüm operatörler kullanabilir mi?'
      },
      variables: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Değişken listesi, örn: ["customerName", "ticketId"]'
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

    // 2. KnowledgeBaseArticle tablosunu oluştur
    await queryInterface.createTable('KnowledgeBaseArticles', {
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
        onDelete: 'CASCADE'
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      relatedArticleIds: {
        type: Sequelize.JSON,
        defaultValue: []
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'tr',
        comment: 'Makale dili (tr, en, vb.)'
      },
      translations: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Farklı dillerdeki çeviriler'
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
    
    // User tablosuna yeni alanlar ekle
    await queryInterface.addColumn('Users', 'fullName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'company', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'department', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'profileImage', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'lastLoginAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('Users', 'preferredLanguage', {
      type: Sequelize.STRING,
      defaultValue: 'tr',
      comment: 'Kullanıcının tercih ettiği dil (tr, en vb.)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'preferredLanguage');
    await queryInterface.removeColumn('Users', 'lastLoginAt');
    await queryInterface.removeColumn('Users', 'profileImage');
    await queryInterface.removeColumn('Users', 'department');
    await queryInterface.removeColumn('Users', 'phone');
    await queryInterface.removeColumn('Users', 'company');
    await queryInterface.removeColumn('Users', 'fullName');
    
    await queryInterface.dropTable('KnowledgeBaseArticles');
    await queryInterface.dropTable('SavedResponses');
  }
};

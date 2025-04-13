module.exports = (sequelize, DataTypes) => {
  const KnowledgeArticle = sequelize.define('KnowledgeArticle', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    keywords: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: {
          args: [['draft', 'published', 'archived']],
          msg: 'Statü draft, published veya archived olmalıdır'
        }
      }
    },
    visibility: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'public',
      validate: {
        isIn: {
          args: [['public', 'internal', 'private']],
          msg: 'Görünürlük public, internal veya private olmalıdır'
        }
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    helpfulVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    unhelpfulVotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    sourceTicketId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lastUpdatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  });

  KnowledgeArticle.associate = (models) => {
    // KnowledgeArticle belongs to author (User)
    KnowledgeArticle.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author'
    });
    
    // KnowledgeArticle optionally belongs to a source ticket
    KnowledgeArticle.belongsTo(models.Ticket, {
      foreignKey: 'sourceTicketId',
      as: 'sourceTicket'
    });
    
    // KnowledgeArticle has many tags
    KnowledgeArticle.belongsToMany(models.Tag, {
      through: 'KnowledgeArticleTags',
      as: 'tags'
    });
    
    // KnowledgeArticle has many related articles
    KnowledgeArticle.belongsToMany(models.KnowledgeArticle, {
      through: 'RelatedArticles',
      as: 'relatedArticles',
      foreignKey: 'articleId',
      otherKey: 'relatedArticleId'
    });
  };

  return KnowledgeArticle;
};

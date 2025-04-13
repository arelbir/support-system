module.exports = (sequelize, DataTypes) => {
  const KnowledgeBaseArticle = sequelize.define('KnowledgeBaseArticle', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    sourceTicketId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    relatedArticleIds: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  });

  KnowledgeBaseArticle.associate = (models) => {
    // Article belongs to User (author)
    KnowledgeBaseArticle.belongsTo(models.User, {
      as: 'author',
      foreignKey: 'authorId'
    });

    // Article belongs to Ticket (source)
    KnowledgeBaseArticle.belongsTo(models.Ticket, {
      as: 'sourceTicket',
      foreignKey: 'sourceTicketId'
    });
  };

  return KnowledgeBaseArticle;
};

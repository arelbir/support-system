module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Statuses',
        key: 'id'
      }
    },
    assignedOperatorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    product: {
      type: DataTypes.STRING,
      allowNull: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    module: {
      type: DataTypes.STRING,
      allowNull: true
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Modules',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('bug', 'suggestion', 'question', 'feature_request', 'other'),
      defaultValue: 'other'
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notifyEmails: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    slaPaused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    slaPausedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    slaPausedReason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    history: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  });

  Ticket.associate = (models) => {
    // Ticket belongs to User (creator)
    Ticket.belongsTo(models.User, {
      foreignKey: 'userId'
    });

    // Ticket belongs to Status
    Ticket.belongsTo(models.Status, {
      foreignKey: 'statusId'
    });

    // Ticket belongs to User (assigned operator)
    Ticket.belongsTo(models.User, {
      as: 'assignedOperator',
      foreignKey: 'assignedOperatorId'
    });

    // Ticket has many Messages
    Ticket.hasMany(models.Message, {
      foreignKey: 'ticketId'
    });

    // Ticket has many Attachments
    Ticket.hasMany(models.Attachment, {
      foreignKey: 'ticketId'
    });

    // Ticket has many AuditLogs
    Ticket.hasMany(models.AuditLog, {
      foreignKey: 'ticketId'
    });
    
    // Ticket belongs to Product
    if (models.Product) {
      Ticket.belongsTo(models.Product, {
        foreignKey: 'productId'
      });
    }
    
    // Ticket belongs to Module
    if (models.Module) {
      Ticket.belongsTo(models.Module, {
        foreignKey: 'moduleId'
      });
    }
    
    // Ticket has one TicketTimeMetrics
    if (models.TicketTimeMetrics) {
      Ticket.hasOne(models.TicketTimeMetrics, {
        foreignKey: 'ticketId',
        as: 'timeMetrics'
      });
    }
    
    // Ticket has many TimeLogs
    if (models.TimeLog) {
      Ticket.hasMany(models.TimeLog, {
        foreignKey: 'ticketId'
      });
    }
    
    // Ticket has many KnowledgeBaseArticles as source
    if (models.KnowledgeBaseArticle) {
      Ticket.hasMany(models.KnowledgeBaseArticle, {
        as: 'knowledgeArticles',
        foreignKey: 'sourceTicketId'
      });
    }
    
    // Ticket belongsToMany Tags
    if (models.Tag) {
      Ticket.belongsToMany(models.Tag, {
        through: 'TicketTag',
        as: 'tags',
        foreignKey: 'ticketId'
      });
    }
    
    // Ticket belongsToMany Users as assignedOperators (for multiple assignments)
    if (models.TicketAssignment) {
      Ticket.belongsToMany(models.User, {
        through: models.TicketAssignment,
        as: 'assignedOperators',
        foreignKey: 'ticketId',
        otherKey: 'operatorId'
      });
    }
  };

  return Ticket;
};

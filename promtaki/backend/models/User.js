const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('customer', 'operator', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preferredLanguage: {
      type: DataTypes.STRING,
      defaultValue: 'tr',
      comment: 'Kullanıcının tercih ettiği dil (tr, en vb.)'
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    // User has many Tickets
    User.hasMany(models.Ticket, {
      foreignKey: 'userId'
    });

    // User has many Messages
    User.hasMany(models.Message, {
      foreignKey: 'senderId'
    });

    // User has many assigned Tickets (as operator)
    User.hasMany(models.Ticket, {
      as: 'assignedTickets',
      foreignKey: 'assignedOperatorId'
    });

    // User has many AuditLogs
    User.hasMany(models.AuditLog, {
      foreignKey: 'userId'
    });
    
    // Yeni ilişkiler
    
    // User has many KnowledgeBaseArticles (as author)
    if (models.KnowledgeBaseArticle) {
      User.hasMany(models.KnowledgeBaseArticle, {
        as: 'authoredArticles',
        foreignKey: 'authorId'
      });
    }
    
    // User has many SavedResponses (as creator)
    if (models.SavedResponse) {
      User.hasMany(models.SavedResponse, {
        as: 'savedResponses',
        foreignKey: 'createdBy'
      });
    }
    
    // User has many TimeLogs
    if (models.TimeLog) {
      User.hasMany(models.TimeLog, {
        foreignKey: 'userId'
      });
    }
    
    // User belongsToMany Tickets through TicketAssignment (for multiple assignments)
    if (models.TicketAssignment) {
      User.belongsToMany(models.Ticket, {
        through: models.TicketAssignment,
        as: 'multiAssignedTickets',
        foreignKey: 'operatorId',
        otherKey: 'ticketId'
      });
    }
  };

  return User;
};

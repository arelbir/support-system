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
  };

  return Ticket;
};

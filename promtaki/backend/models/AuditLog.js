module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    details: {
      type: DataTypes.TEXT,
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
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  AuditLog.associate = (models) => {
    // AuditLog belongs to User
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId'
    });

    // AuditLog belongs to Ticket (optional)
    AuditLog.belongsTo(models.Ticket, {
      foreignKey: 'ticketId'
    });
  };

  return AuditLog;
};

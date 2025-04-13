module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('ticket', 'message', 'sla', 'system'),
      allowNull: false,
      defaultValue: 'system'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium'
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID of the related resource (ticket, message, etc.)'
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of the related resource'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional data related to notification'
    },
    deliveryStatus: {
      type: DataTypes.ENUM('pending', 'delivered', 'failed'),
      defaultValue: 'pending'
    },
    channels: {
      type: DataTypes.JSONB,
      defaultValue: { inApp: true, email: false, push: false },
      comment: 'Channels through which this notification was/will be sent'
    }
  });

  Notification.associate = (models) => {
    // Notification belongs to User
    Notification.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return Notification;
};

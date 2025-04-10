module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  Message.associate = (models) => {
    // Message belongs to Ticket
    Message.belongsTo(models.Ticket, {
      foreignKey: 'ticketId'
    });

    // Message belongs to User (sender)
    Message.belongsTo(models.User, {
      foreignKey: 'senderId'
    });
  };

  return Message;
};

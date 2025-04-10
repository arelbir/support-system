module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define('Attachment', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    },
    uploaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  });

  Attachment.associate = (models) => {
    // Attachment belongs to Ticket
    Attachment.belongsTo(models.Ticket, {
      foreignKey: 'ticketId'
    });
    
    // Attachment belongs to User (uploader)
    Attachment.belongsTo(models.User, {
      foreignKey: 'uploaderId'
    });
  };

  return Attachment;
};

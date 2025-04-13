module.exports = (sequelize, DataTypes) => {
  const SavedResponse = sequelize.define('SavedResponse', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Tüm operatörler kullanabilir mi?'
    },
    variables: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Değişken listesi, örn: ["customerName", "ticketId"]'
    }
  });

  SavedResponse.associate = (models) => {
    // SavedResponse belongs to User (creator)
    SavedResponse.belongsTo(models.User, {
      as: 'creator',
      foreignKey: 'createdBy'
    });
  };

  return SavedResponse;
};

module.exports = (sequelize, DataTypes) => {
  const SLA = sequelize.define('SLA', {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    priorityLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false
    },
    responseTimeMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'İlk yanıt için hedef süre (dakika)'
    },
    resolutionTimeMinutes: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Çözüm için hedef süre (dakika)'
    },
    businessHoursOnly: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Sadece çalışma saatleri içinde mi sayılsın?'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'SLA politika adı'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  SLA.associate = (models) => {
    // SLA belongs to Product
    SLA.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return SLA;
};

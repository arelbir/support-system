module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Module.associate = (models) => {
    // Module belongs to Product
    Module.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product'
    });
    
    // Module has many Tickets
    Module.hasMany(models.Ticket, {
      foreignKey: 'moduleId'
    });
  };

  return Module;
};

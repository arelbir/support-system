module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Product.associate = (models) => {
    // Product has many Modules
    Product.hasMany(models.Module, {
      foreignKey: 'productId',
      as: 'modules'
    });
    
    // Product has many Tickets
    Product.hasMany(models.Ticket, {
      foreignKey: 'productId'
    });
    
    // Product has many SLA rules
    Product.hasMany(models.SLA, {
      foreignKey: 'productId',
      as: 'slas'
    });
  };

  return Product;
};

module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#777777',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  Tag.associate = (models) => {
    // Tag belongs to many Tickets
    Tag.belongsToMany(models.Ticket, {
      through: 'TicketTag',
      as: 'tickets',
      foreignKey: 'tagId'
    });
  };

  return Tag;
};

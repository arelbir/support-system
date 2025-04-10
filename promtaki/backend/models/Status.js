module.exports = (sequelize, DataTypes) => {
  const Status = sequelize.define('Status', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#777777',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  Status.associate = (models) => {
    // Status has many Tickets
    Status.hasMany(models.Ticket, {
      foreignKey: 'statusId'
    });
  };

  return Status;
};

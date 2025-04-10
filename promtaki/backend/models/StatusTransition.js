module.exports = (sequelize, DataTypes) => {
  const StatusTransition = sequelize.define('StatusTransition', {
    fromStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Statuses',
        key: 'id'
      }
    },
    toStatusId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Statuses',
        key: 'id'
      }
    },
    allowedRoles: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'operator,admin',
      validate: {
        isValidRoles(value) {
          const roles = value.split(',');
          const validRoles = ['customer', 'operator', 'admin'];
          for (const role of roles) {
            if (!validRoles.includes(role.trim())) {
              throw new Error('Geçersiz rol: ' + role);
            }
          }
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  StatusTransition.associate = (models) => {
    // StatusTransition belongs to Status (from)
    StatusTransition.belongsTo(models.Status, {
      as: 'fromStatus',
      foreignKey: 'fromStatusId'
    });

    // StatusTransition belongs to Status (to)
    StatusTransition.belongsTo(models.Status, {
      as: 'toStatus',
      foreignKey: 'toStatusId'
    });
  };

  return StatusTransition;
};

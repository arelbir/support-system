const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('customer', 'operator', 'admin'),
      allowNull: false,
      defaultValue: 'customer'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = (models) => {
    // User has many Tickets
    User.hasMany(models.Ticket, {
      foreignKey: 'userId'
    });

    // User has many Messages
    User.hasMany(models.Message, {
      foreignKey: 'senderId'
    });

    // User has many assigned Tickets (as operator)
    User.hasMany(models.Ticket, {
      as: 'assignedTickets',
      foreignKey: 'assignedOperatorId'
    });

    // User has many AuditLogs
    User.hasMany(models.AuditLog, {
      foreignKey: 'userId'
    });
  };

  return User;
};

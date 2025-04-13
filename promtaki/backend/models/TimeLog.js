module.exports = (sequelize, DataTypes) => {
  const TimeLog = sequelize.define('TimeLog', {
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Dakika olarak harcanan süre'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isBillable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    activityType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Yapılan aktivitenin türü, örn: inceleme, geliştirme, test'
    }
  });

  TimeLog.associate = (models) => {
    // TimeLog belongs to Ticket
    TimeLog.belongsTo(models.Ticket, {
      foreignKey: 'ticketId'
    });

    // TimeLog belongs to User
    TimeLog.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return TimeLog;
};

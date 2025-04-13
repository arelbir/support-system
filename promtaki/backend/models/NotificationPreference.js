module.exports = (sequelize, DataTypes) => {
  const NotificationPreference = sequelize.define('NotificationPreference', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    // Bildirim kanalları bazında tercihler
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'E-posta bildirimleri etkin mi?'
    },
    pushEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Push bildirimleri etkin mi?'
    },
    inAppEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Uygulama içi bildirimler etkin mi?'
    },
    // Bildirim tipi
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Bildirim tercihi tipi (all, custom, none)'
    },
    // Sessiz saatler
    quietHoursEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Sessiz saatler etkin mi?'
    },
    quietHoursStart: {
      type: DataTypes.STRING,
      defaultValue: '22:00',
      comment: 'Sessiz saatler başlangıç saati'
    },
    quietHoursEnd: {
      type: DataTypes.STRING,
      defaultValue: '08:00',
      comment: 'Sessiz saatler bitiş saati'
    },
    quietHoursDays: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [0, 6],  // 0: Pazar, 6: Cumartesi
      comment: 'Sessiz saatlerin uygulanacağı günler'
    }
  }, {
    tableName: 'NotificationPreferences'
  });

  // Associations
  NotificationPreference.associate = (models) => {
    NotificationPreference.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return NotificationPreference;
};

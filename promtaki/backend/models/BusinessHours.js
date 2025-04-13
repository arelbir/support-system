module.exports = (sequelize, DataTypes) => {
  const BusinessHours = sequelize.define('BusinessHours', {
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '0 Pazar, 1 Pazartesi ... 6 Cumartesi',
      validate: {
        min: 0,
        max: 6
      }
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Başlangıç saati (HH:MM:SS)'
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Bitiş saati (HH:MM:SS)'
    },
    isWorkingDay: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  return BusinessHours;
};

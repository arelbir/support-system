module.exports = (sequelize, DataTypes) => {
  const Holiday = sequelize.define('Holiday', {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Her yıl tekrarlanan bir tatil mi?'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  return Holiday;
};

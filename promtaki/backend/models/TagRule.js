module.exports = (sequelize, DataTypes) => {
  const TagRule = sequelize.define('TagRule', {
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
    conditions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      comment: 'Kuralın koşulları (içerik, konu, öncelik, vb.)'
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tags',
        key: 'id'
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: 'Kuralın öncelik sırası, düşük sayı daha yüksek önceliği ifade eder'
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    lastAppliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Kuralın son uygulandığı zaman'
    },
    applicationCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Kuralın kaç kez uygulandığı'
    }
  });

  TagRule.associate = (models) => {
    // TagRule belongs to Tag
    TagRule.belongsTo(models.Tag, {
      foreignKey: 'tagId',
      as: 'tag'
    });

    // TagRule belongs to User (creator)
    TagRule.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return TagRule;
};

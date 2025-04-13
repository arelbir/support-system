module.exports = (sequelize, DataTypes) => {
  const TicketTimeMetrics = sequelize.define('TicketTimeMetrics', {
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id'
      },
      unique: true
    },
    firstResponseAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    slaResponseDue: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'İlk yanıt için SLA son tarih'
    },
    slaResolutionDue: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Çözüm için SLA son tarih'
    },
    slaResponseBreached: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'İlk yanıt SLA aşıldı mı?'
    },
    slaResolutionBreached: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Çözüm SLA aşıldı mı?'
    },
    pauseHistory: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'SLA duraklatma geçmişi'
    },
    totalPausedTimeMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Toplam duraklatılmış süre (dakika)'
    },
    currentlyPaused: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });

  TicketTimeMetrics.associate = (models) => {
    // TicketTimeMetrics belongs to Ticket
    TicketTimeMetrics.belongsTo(models.Ticket, {
      foreignKey: 'ticketId'
    });
  };

  return TicketTimeMetrics;
};

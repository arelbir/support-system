module.exports = (sequelize, DataTypes) => {
  const TicketTag = sequelize.define('TicketTag', {
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tags',
        key: 'id'
      }
    }
  }, {
    timestamps: true
  });

  return TicketTag;
};

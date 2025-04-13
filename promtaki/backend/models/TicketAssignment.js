module.exports = (sequelize, DataTypes) => {
  const TicketAssignment = sequelize.define('TicketAssignment', {
    ticketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tickets',
        key: 'id'
      }
    },
    operatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    assignedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  TicketAssignment.associate = (models) => {
    // TicketAssignment belongs to Ticket
    TicketAssignment.belongsTo(models.Ticket, {
      foreignKey: 'ticketId'
    });

    // TicketAssignment belongs to User (operator)
    TicketAssignment.belongsTo(models.User, {
      as: 'operator',
      foreignKey: 'operatorId'
    });

    // TicketAssignment belongs to User (assigner)
    TicketAssignment.belongsTo(models.User, {
      as: 'assigner',
      foreignKey: 'assignedBy'
    });
  };

  return TicketAssignment;
};

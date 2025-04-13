'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. TicketAssignment tablosunu oluştur
    await queryInterface.createTable('TicketAssignments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      operatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isPrimary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      assignedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      assignedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // 2. TimeLog tablosunu oluştur
    await queryInterface.createTable('TimeLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ticketId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Tickets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      timeSpent: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Dakika olarak harcanan süre'
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isBillable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      activityType: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Yapılan aktivitenin türü, örn: inceleme, geliştirme, test'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TimeLogs');
    await queryInterface.dropTable('TicketAssignments');
  }
};

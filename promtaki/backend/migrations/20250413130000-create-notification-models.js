'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Notification tablosu
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'info'
      },
      priority: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'normal'
      },
      resourceType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      resourceId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      data: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      channels: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ['in-app']
      },
      deliveryStatus: {
        type: Sequelize.JSONB,
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

    // NotificationPreference tablosu
    await queryInterface.createTable('NotificationPreferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      emailEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      inAppEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      pushEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      quietHoursEnabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      quietHoursStart: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quietHoursEnd: {
        type: Sequelize.STRING,
        allowNull: true
      },
      quietHoursDays: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
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

    // İndeksler
    await queryInterface.addIndex('Notifications', ['userId']);
    await queryInterface.addIndex('Notifications', ['type']);
    await queryInterface.addIndex('Notifications', ['readAt']);
    await queryInterface.addIndex('NotificationPreferences', ['userId', 'type'], {
      unique: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('NotificationPreferences');
    await queryInterface.dropTable('Notifications');
  }
};

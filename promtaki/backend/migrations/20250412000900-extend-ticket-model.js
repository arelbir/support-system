'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Tickets', 'product', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'module', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'type', {
      type: Sequelize.ENUM('bug', 'suggestion', 'question', 'feature_request', 'other'),
      defaultValue: 'other',
      allowNull: true
    });
    
    await queryInterface.addColumn('Tickets', 'company', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'notifyEmails', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('Tickets', 'timeSpent', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('Tickets', 'dueDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'slaPaused', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Tickets', 'slaPausedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'slaPausedReason', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Tickets', 'history', {
      type: Sequelize.JSONB,
      defaultValue: []
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Tickets', 'product');
    await queryInterface.removeColumn('Tickets', 'module');
    await queryInterface.removeColumn('Tickets', 'type');
    await queryInterface.removeColumn('Tickets', 'company');
    await queryInterface.removeColumn('Tickets', 'notifyEmails');
    await queryInterface.removeColumn('Tickets', 'timeSpent');
    await queryInterface.removeColumn('Tickets', 'dueDate');
    await queryInterface.removeColumn('Tickets', 'slaPaused');
    await queryInterface.removeColumn('Tickets', 'slaPausedAt');
    await queryInterface.removeColumn('Tickets', 'slaPausedReason');
    await queryInterface.removeColumn('Tickets', 'history');
  }
};

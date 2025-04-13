'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Products tablosunun var olup olmadığını kontrol et
    let productsTableExists = false;
    try {
      await queryInterface.describeTable('Products');
      productsTableExists = true;
    } catch (error) {
      console.log('Products tablosu bulunamadı. Önce Products tablosunu oluşturun.');
    }

    // 2. Modules tablosunun var olup olmadığını kontrol et
    let modulesTableExists = false;
    try {
      await queryInterface.describeTable('Modules');
      modulesTableExists = true;
    } catch (error) {
      console.log('Modules tablosu bulunamadı. Önce Modules tablosunu oluşturun.');
    }

    // 3. Eğer Products tablosu varsa, productId sütununu ekle
    if (productsTableExists) {
      await queryInterface.addColumn('Tickets', 'productId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    // 4. Eğer Modules tablosu varsa, moduleId sütununu ekle
    if (modulesTableExists) {
      await queryInterface.addColumn('Tickets', 'moduleId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Modules',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Migration'ı geri almak için
    try {
      await queryInterface.removeColumn('Tickets', 'productId');
    } catch (error) {
      console.log('productId sütunu kaldırılamadı:', error.message);
    }

    try {
      await queryInterface.removeColumn('Tickets', 'moduleId');
    } catch (error) {
      console.log('moduleId sütunu kaldırılamadı:', error.message);
    }
  }
};

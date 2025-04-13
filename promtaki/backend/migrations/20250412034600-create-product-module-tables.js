'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Products tablosunu oluştur (eğer yoksa)
    try {
      await queryInterface.describeTable('Products');
      console.log('Products tablosu zaten var. Atlıyorum.');
    } catch (error) {
      // Tablo yok, şimdi oluşturalım
      await queryInterface.createTable('Products', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        version: {
          type: Sequelize.STRING,
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
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
      
      // Örnek ürün ekle
      await queryInterface.bulkInsert('Products', [{
        name: 'Support System',
        description: 'Destek ve bilet yönetim sistemi',
        version: '1.0.0',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }

    // 2. Modules tablosunu oluştur (eğer yoksa)
    try {
      await queryInterface.describeTable('Modules');
      console.log('Modules tablosu zaten var. Atlıyorum.');
    } catch (error) {
      // Tablo yok, şimdi oluşturalım
      await queryInterface.createTable('Modules', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Products',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
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
      
      // Örnek modül ekle
      await queryInterface.bulkInsert('Modules', [{
        name: 'Ticket Management',
        description: 'Bilet yönetimi modülü',
        productId: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Migration'ı geri almak için, son oluşturulandan başlayarak
    await queryInterface.dropTable('Modules');
    await queryInterface.dropTable('Products');
  }
};

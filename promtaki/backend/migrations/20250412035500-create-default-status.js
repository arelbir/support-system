'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Önce Statuses tablosunun var olup olmadığını kontrol et
    try {
      await queryInterface.describeTable('Statuses');
    } catch (error) {
      // Statuses tablosu mevcut değil, önce oluştur
      await queryInterface.createTable('Statuses', {
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
        color: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: '#3B82F6' // Varsayılan renk (mavi)
        },
        isDefault: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW')
        }
      });
    }

    // Mevcut varsayılan durumları kontrol et
    const statuses = await queryInterface.sequelize.query(
      'SELECT * FROM "Statuses" WHERE "isDefault" = true',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Varsayılan durum yoksa ekle
    if (statuses.length === 0) {
      await queryInterface.bulkInsert('Statuses', [
        {
          name: 'Açık',
          description: 'Yeni açılan destek talebi',
          color: '#3B82F6', // Mavi
          isDefault: true,
          isActive: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'İşlemde',
          description: 'İşleme alınmış destek talebi',
          color: '#F59E0B', // Turuncu
          isDefault: false,
          isActive: true,
          order: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Beklemede',
          description: 'Müşteri yanıtı bekleyen destek talebi',
          color: '#8B5CF6', // Mor
          isDefault: false,
          isActive: true,
          order: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Çözüldü',
          description: 'Çözülmüş destek talebi',
          color: '#10B981', // Yeşil
          isDefault: false, 
          isActive: true,
          order: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Kapatıldı',
          description: 'Kapatılmış destek talebi',
          color: '#6B7280', // Gri
          isDefault: false,
          isActive: true,
          order: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eklenen varsayılan durumları kaldır
    await queryInterface.bulkDelete('Statuses', {
      name: {
        [Sequelize.Op.in]: ['Açık', 'İşlemde', 'Beklemede', 'Çözüldü', 'Kapatıldı']
      }
    });
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Tags', [
      // Teknik Sorunlar
      {
        name: 'Hata',
        color: '#FF0000',
        category: 'Teknik',
        description: 'Sistemde tespit edilen hatalar',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Performans',
        color: '#FFA500',
        category: 'Teknik',
        description: 'Performans ile ilgili sorunlar',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Çökme',
        color: '#8B0000',
        category: 'Teknik',
        description: 'Sistemin tamamen durması',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Veri Kaybı',
        color: '#800000',
        category: 'Teknik',
        description: 'Veri kayıpları ve tutarsızlıklar',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Ürün Kategorileri
      {
        name: 'CRM',
        color: '#4682B4',
        category: 'Ürün',
        description: 'CRM ürünüyle ilgili',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ERP',
        color: '#6495ED',
        category: 'Ürün',
        description: 'ERP ürünüyle ilgili',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Muhasebe',
        color: '#1E90FF',
        category: 'Ürün',
        description: 'Muhasebe modülüyle ilgili',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // İstek Tipleri
      {
        name: 'Yeni Özellik',
        color: '#008000',
        category: 'İstek',
        description: 'Yeni özellik talepleri',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'İyileştirme',
        color: '#32CD32',
        category: 'İstek',
        description: 'Mevcut özelliklerin iyileştirilmesi',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Entegrasyon',
        color: '#00FF00',
        category: 'İstek',
        description: 'Diğer sistemlerle entegrasyon',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Destek Kategorileri
      {
        name: 'Kurulum',
        color: '#9932CC',
        category: 'Destek',
        description: 'Kurulum ve yapılandırma sorunları',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dokümantasyon',
        color: '#8A2BE2',
        category: 'Destek',
        description: 'Dokümantasyon talepleri veya sorunları',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Eğitim',
        color: '#9370DB',
        category: 'Destek',
        description: 'Eğitim talepleri',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },

      // Durum Kategorileri
      {
        name: 'Acil',
        color: '#DC143C',
        category: 'Durum',
        description: 'Acil çözülmesi gereken talepler',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bekleyen',
        color: '#FFD700',
        category: 'Durum',
        description: 'Müşteri yanıtı bekleyen talepler',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Çözümlendi',
        color: '#228B22',
        category: 'Durum',
        description: 'Çözülmüş talepler',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Tags', null, {});
  }
};

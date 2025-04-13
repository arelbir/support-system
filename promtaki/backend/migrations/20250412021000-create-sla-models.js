'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. SLA tablosunu oluştur
    await queryInterface.createTable('SLAs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      priorityLevel: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false
      },
      responseTimeMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'İlk yanıt için hedef süre (dakika)'
      },
      resolutionTimeMinutes: {
        type: Sequelize.INTEGER, 
        allowNull: false,
        comment: 'Çözüm için hedef süre (dakika)'
      },
      businessHoursOnly: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Sadece çalışma saatleri içinde mi sayılsın?'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'SLA politika adı'
      },
      description: {
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

    // 2. TicketTimeMetrics tablosunu oluştur
    await queryInterface.createTable('TicketTimeMetrics', {
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
        onDelete: 'CASCADE',
        unique: true
      },
      firstResponseAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      slaResponseDue: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'İlk yanıt için SLA son tarih'
      },
      slaResolutionDue: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Çözüm için SLA son tarih'
      },
      slaResponseBreached: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'İlk yanıt SLA aşıldı mı?'
      },
      slaResolutionBreached: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Çözüm SLA aşıldı mı?'
      },
      pauseHistory: {
        type: Sequelize.JSONB,
        defaultValue: [],
        comment: 'SLA duraklatma geçmişi'
      },
      totalPausedTimeMinutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Toplam duraklatılmış süre (dakika)'
      },
      currentlyPaused: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    // 3. BusinessHours tablosunu oluştur
    await queryInterface.createTable('BusinessHours', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dayOfWeek: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '0 Pazar, 1 Pazartesi ... 6 Cumartesi',
        validate: {
          min: 0,
          max: 6
        }
      },
      startTime: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Başlangıç saati (HH:MM:SS)'
      },
      endTime: {
        type: Sequelize.TIME,
        allowNull: false,
        comment: 'Bitiş saati (HH:MM:SS)'
      },
      isWorkingDay: {
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

    // 4. Holiday tablosunu oluştur
    await queryInterface.createTable('Holidays', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      isRecurring: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Her yıl tekrarlanan bir tatil mi?'
      },
      description: {
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Holidays');
    await queryInterface.dropTable('BusinessHours');
    await queryInterface.dropTable('TicketTimeMetrics');
    await queryInterface.dropTable('SLAs');
  }
};

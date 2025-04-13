/**
 * Rapor ve hatırlatma zamanlanmış görevleri
 */
const cron = require('node-cron');
const { User, sequelize } = require('../models');
const reportService = require('./reportService');
const { Op } = require('sequelize');

// Raporlama ve hatırlatıcı cron işlerini başlatır
const startReportCronJobs = () => {
  try {
    // Günlük rapor - Her gün sabah 09:00'da çalışır
    cron.schedule('0 9 * * *', async () => {
      try {
        console.log('[Rapor Cron] Günlük rapor oluşturuluyor...');
        
        // Dünün tarihleri için
        const endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 1);
        
        // Admin ve yönetici operatörleri bul
        const managers = await User.findAll({
          where: {
            [Op.or]: [
              { role: 'admin' },
              { role: 'manager' }
            ],
            isActive: true
          },
          attributes: ['id', 'email']
        });
        
        if (managers.length === 0) {
          console.log('[Rapor Cron] Günlük rapor gönderilecek yönetici bulunamadı.');
          return;
        }
        
        // Her yönetici için rapor oluştur ve gönder
        for (const manager of managers) {
          try {
            console.log(`[Rapor Cron] ${manager.email} için günlük rapor oluşturuluyor...`);
            
            const report = await reportService.generateTicketReport({
              startDate,
              endDate,
              interval: 'daily',
              userId: manager.id
            });
            
            // Rapor bilgilendirmesi gönder
            await reportService.notifyReportReady(report, manager.id);
            
            console.log(`[Rapor Cron] ${manager.email} için günlük rapor tamamlandı.`);
          } catch (userError) {
            console.error(`[Rapor Cron] ${manager.email} için günlük rapor hatası:`, userError);
            // Bir kullanıcıdaki hata diğer kullanıcıların raporlarını etkilemesin
            continue;
          }
        }
        
        console.log('[Rapor Cron] Günlük rapor tamamlandı.');
      } catch (error) {
        console.error('[Rapor Cron] Günlük rapor hatası:', error);
      }
    });
    
    // Haftalık rapor - Her pazartesi sabah 09:00'da çalışır
    cron.schedule('0 9 * * 1', async () => {
      try {
        console.log('[Rapor Cron] Haftalık rapor oluşturuluyor...');
        
        // Geçen haftanın tarihleri için
        const endDate = new Date();
        endDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - endDate.getDay() + 1);
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 7);
        
        // Admin ve yönetici operatörleri bul
        const managers = await User.findAll({
          where: {
            [Op.or]: [
              { role: 'admin' },
              { role: 'manager' }
            ],
            isActive: true
          },
          attributes: ['id', 'email']
        });
        
        if (managers.length === 0) {
          console.log('[Rapor Cron] Haftalık rapor gönderilecek yönetici bulunamadı.');
          return;
        }
        
        // Operatör performans raporlarını da ekleyerek her yönetici için rapor oluştur
        for (const manager of managers) {
          try {
            console.log(`[Rapor Cron] ${manager.email} için haftalık rapor oluşturuluyor...`);
            
            const report = await reportService.generateTicketReport({
              startDate,
              endDate,
              interval: 'weekly',
              userId: manager.id,
              includePerformance: true  // Operatör performans detaylarını ekle
            });
            
            // Haftalık hatırlatıcıları da gönder
            const unrespondedTickets = await reportService.generateUnrespondedTicketsReport({
              thresholdHours: 48  // 2 gün yanıtsız kalan biletler
            });
            
            // Her iki rapor için de bildirim gönder
            await reportService.notifyReportReady({
              ...report,
              unrespondedTickets: unrespondedTickets.length > 0 ? {
                count: unrespondedTickets.length,
                tickets: unrespondedTickets.slice(0, 5)  // İlk 5 yanıtsız bilet
              } : null
            }, manager.id);
            
            console.log(`[Rapor Cron] ${manager.email} için haftalık rapor tamamlandı.`);
          } catch (userError) {
            console.error(`[Rapor Cron] ${manager.email} için haftalık rapor hatası:`, userError);
            // Bir kullanıcıdaki hata diğer kullanıcıların raporlarını etkilemesin
            continue;
          }
        }
        
        console.log('[Rapor Cron] Haftalık rapor tamamlandı.');
      } catch (error) {
        console.error('[Rapor Cron] Haftalık rapor hatası:', error);
      }
    });
    
    // Aylık rapor - Her ayın 1'i sabah 09:00'da çalışır
    cron.schedule('0 9 1 * *', async () => {
      try {
        console.log('[Rapor Cron] Aylık rapor oluşturuluyor...');
        
        // Geçen ayın tarihleri için
        const endDate = new Date();
        endDate.setDate(1);
        endDate.setHours(0, 0, 0, 0);
        
        const startDate = new Date(endDate);
        startDate.setMonth(startDate.getMonth() - 1);
        
        // Admin ve yönetici operatörleri bul
        const managers = await User.findAll({
          where: {
            [Op.or]: [
              { role: 'admin' },
              { role: 'manager' }
            ],
            isActive: true
          },
          attributes: ['id', 'email', 'username']
        });
        
        if (managers.length === 0) {
          console.log('[Rapor Cron] Aylık rapor gönderilecek yönetici bulunamadı.');
          return;
        }
        
        // Kapsamlı aylık raporlar için her yöneticiye özel veriler
        for (const manager of managers) {
          try {
            console.log(`[Rapor Cron] ${manager.email} için aylık rapor oluşturuluyor...`);
            
            // SLA performans detaylarını ve trend analizini içeren kapsamlı rapor
            const report = await reportService.generateTicketReport({
              startDate,
              endDate,
              interval: 'monthly',
              userId: manager.id,
              includePerformance: true,
              includeTrends: true,  // Aylık trend analizini ekle
              includeSLADetails: true  // Detaylı SLA raporları
            });
            
            // Yanıtsız kalan ve uzun süredir çözülmemiş biletleri de rapor et
            const longStandingTickets = await reportService.generateUnrespondedTicketsReport({
              thresholdHours: 120  // 5 gün yanıtsız kalan biletler
            });
            
            // PDF raporu oluştur ve bildirim gönder
            const pdfPath = await reportService.generatePdfReport({
              ...report,
              longStandingTickets: longStandingTickets.length > 0 ? {
                count: longStandingTickets.length,
                tickets: longStandingTickets.slice(0, 10)  // İlk 10 uzun süredir açık bilet
              } : null,
              reportType: 'monthly',
              generatedFor: manager.username,
              generatedAt: new Date()
            });
            
            // Bildirim gönder ve PDF dosyasına bağlantı ekle
            await reportService.notifyReportReady({
              ...report,
              pdfPath
            }, manager.id);
            
            console.log(`[Rapor Cron] ${manager.email} için aylık rapor tamamlandı.`);
          } catch (userError) {
            console.error(`[Rapor Cron] ${manager.email} için aylık rapor hatası:`, userError);
            // Bir kullanıcıdaki hata diğer kullanıcıların raporlarını etkilemesin
            continue;
          }
        }
        
        console.log('[Rapor Cron] Aylık rapor tamamlandı.');
      } catch (error) {
        console.error('[Rapor Cron] Aylık rapor hatası:', error);
      }
    });
    
    // Yanıtsız bilet hatırlatıcıları - Her 6 saatte bir çalışır (10:00, 16:00, 22:00, 04:00)
    cron.schedule('0 4,10,16,22 * * *', async () => {
      try {
        console.log('[Rapor Cron] Yanıtsız bilet kontrolü yapılıyor...');
        
        // 24 saatten uzun süredir yanıt bekleyen biletler
        const unrespondedTicketsReport = await reportService.generateUnrespondedTicketsReport({
          thresholdHours: 24
        });
        
        console.log(`[Rapor Cron] Yanıtsız bilet kontrolü tamamlandı. ${unrespondedTicketsReport.length} bilet tespit edildi.`);
      } catch (error) {
        console.error('[Rapor Cron] Yanıtsız bilet kontrolü hatası:', error);
      }
    });
    
    // Hemen test için 1 dakika sonra bir test raporu çalıştır (sadece geliştirme ortamında)
    if (process.env.NODE_ENV === 'development') {
      setTimeout(async () => {
        try {
          console.log('[Test] Rapor sistemi test ediliyor...');
          
          // Son 7 günün raporu
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          
          // Admin kullanıcılarını bul
          const admins = await User.findAll({
            where: {
              role: 'admin',
              isActive: true
            },
            attributes: ['id'],
            limit: 1
          });
          
          if (admins.length > 0) {
            const testReport = await reportService.generateTicketReport({
              startDate,
              endDate,
              interval: 'test',
              userId: admins[0].id
            });
            
            console.log('[Test] Test raporu oluşturuldu:', Object.keys(testReport));
          } else {
            console.log('[Test] Test için admin kullanıcı bulunamadı.');
          }
        } catch (error) {
          console.error('[Test] Rapor test hatası:', error);
        }
      }, 60000);
    }
    
    console.log('Raporlama cron işleri başlatıldı.');
    
    return true;
  } catch (error) {
    console.error('Raporlama cron işleri başlatma hatası:', error);
    return false;
  }
};

module.exports = {
  startReportCronJobs
};

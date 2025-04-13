/**
 * SQL sorguları kullanarak örnek etiket kuralları ve SLA süreleri ekleme scripti
 */

const { sequelize, Tag, User, Product, SLA } = require('../models');
const { QueryTypes } = require('sequelize');

async function seedSampleData() {
  try {
    console.log('Örnek veri ekleme başlatılıyor...');
    
    // İlk kullanıcı ID'sini al (admin veya operatör olmalı)
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      throw new Error('Seed için admin kullanıcı bulunamadı');
    }
    
    // Önce tüm ürünleri alalım
    const products = await Product.findAll();
    if (products.length === 0) {
      throw new Error('Ürün bulunamadı, önce ürünler eklenmelidir');
    }
    
    // Mevcut etiketleri alalım
    console.log('Mevcut etiketler alınıyor...');
    const allTags = await Tag.findAll();
    if (allTags.length === 0) {
      throw new Error('Etiket bulunamadı, önce etiketler eklenmelidir');
    }
    
    // İhtiyaç duyulan etiketleri bulalım
    const acilEtiketi = allTags.find(tag => tag.name === 'Acil');
    const hataEtiketi = allTags.find(tag => tag.name === 'Hata');
    const oneriEtiketi = allTags.find(tag => tag.name === 'İyileştirme' || tag.name === 'Yeni Özellik');
    const dokumanEtiketi = allTags.find(tag => tag.name === 'Dokümantasyon');
    
    console.log('Bulunan etiketler:', {
      acil: acilEtiketi?.id,
      hata: hataEtiketi?.id,
      oneri: oneriEtiketi?.id,
      dokuman: dokumanEtiketi?.id
    });
    
    // 1. Önce mevcut TagRules tablosunu kontrol edelim
    console.log('TagRules tablosu yapısı kontrol ediliyor...');
    const tableInfo = await sequelize.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'TagRules'`,
      { type: QueryTypes.SELECT }
    );
    
    console.log('TagRules tablosu sütunları:', tableInfo.map(col => col.column_name));
    
    // 2. Etiket Kuralları Ekleme
    console.log('Etiket kuralları ekleniyor...');
    
    // Kuralları ekleyeceğiz
    const now = new Date().toISOString();
    
    let addedRuleCount = 0;
    
    if (acilEtiketi) {
      await sequelize.query(`
        INSERT INTO "TagRules" (
          "name", "description", "conditions", "tagId", "isActive", 
          "priority", "createdBy", "lastAppliedAt", "applicationCount", 
          "createdAt", "updatedAt"
        ) VALUES (
          'Acil Talep Kuralı',
          'Önceliği yüksek veya acil olan biletlere otomatik Acil etiketi ekler',
          '{"priority":["high","urgent"]}',
          ${acilEtiketi.id},
          true,
          10,
          ${adminUser.id},
          NULL,
          0,
          '${now}',
          '${now}'
        )
        ON CONFLICT DO NOTHING
      `);
      addedRuleCount++;
    }
    
    if (hataEtiketi) {
      await sequelize.query(`
        INSERT INTO "TagRules" (
          "name", "description", "conditions", "tagId", "isActive", 
          "priority", "createdBy", "lastAppliedAt", "applicationCount", 
          "createdAt", "updatedAt"
        ) VALUES (
          'Hata Bildirimi Kuralı',
          'Hata tipi biletlere otomatik Hata etiketi ekler',
          '{"type":["bug","error"]}',
          ${hataEtiketi.id},
          true,
          20,
          ${adminUser.id},
          NULL,
          0,
          '${now}',
          '${now}'
        )
        ON CONFLICT DO NOTHING
      `);
      addedRuleCount++;
    }
    
    if (oneriEtiketi) {
      await sequelize.query(`
        INSERT INTO "TagRules" (
          "name", "description", "conditions", "tagId", "isActive", 
          "priority", "createdBy", "lastAppliedAt", "applicationCount", 
          "createdAt", "updatedAt"
        ) VALUES (
          'Öneri Kuralı',
          'Öneri tipi biletlere otomatik Öneri etiketi ekler',
          '{"type":["suggestion","feature"]}',
          ${oneriEtiketi.id},
          true,
          30,
          ${adminUser.id},
          NULL,
          0,
          '${now}',
          '${now}'
        )
        ON CONFLICT DO NOTHING
      `);
      addedRuleCount++;
    }
    
    console.log(`${addedRuleCount} etiket kuralı başarıyla eklendi`);
    
    // 3. SLA Süreleri Ekle
    console.log('SLA süreleri ekleniyor...');
    
    // Önce mevcut SLA kayıtlarını kontrol edelim
    const existingSLAs = await SLA.findAll();
    
    // Her ürün için çeşitli öncelik seviyelerinde SLA'lar ekleyelim
    let addedSLACount = 0;
    
    for (const product of products) {
      // Her bir product-priority kombinasyonunu kontrol et
      const priorities = ['low', 'medium', 'high', 'urgent'];
      
      for (const priority of priorities) {
        // Bu kombinasyon için SLA zaten var mı?
        const existingSLA = existingSLAs.find(
          sla => sla.productId === product.id && sla.priorityLevel === priority
        );
        
        if (!existingSLA) {
          let responseTime, resolutionTime, businessHoursOnly;
          
          // Önceliğe göre SLA değerlerini belirle
          switch (priority) {
            case 'low':
              responseTime = 480; // 8 saat
              resolutionTime = 2880; // 2 gün
              businessHoursOnly = true;
              break;
            case 'medium':
              responseTime = 240; // 4 saat
              resolutionTime = 1440; // 1 gün
              businessHoursOnly = true;
              break;
            case 'high':
              responseTime = 120; // 2 saat
              resolutionTime = 720; // 12 saat
              businessHoursOnly = true;
              break;
            case 'urgent':
              responseTime = 60; // 1 saat
              resolutionTime = 240; // 4 saat
              businessHoursOnly = false; // Acil durumda 7/24
              break;
          }
          
          try {
            await SLA.create({
              productId: product.id,
              priorityLevel: priority,
              responseTimeMinutes: responseTime,
              resolutionTimeMinutes: resolutionTime,
              businessHoursOnly,
              isActive: true,
              name: `${product.name} ${priority.toUpperCase()} SLA`,
              description: `${product.name} ürünü için ${priority} öncelikli taleplerin SLA kuralı`
            });
            addedSLACount++;
          } catch (error) {
            console.error(`SLA eklenirken hata oluştu (${product.id}, ${priority}):`, error.message);
          }
        }
      }
    }
    
    console.log(`${addedSLACount} SLA kaydı başarıyla eklendi`);
    console.log('Örnek veri ekleme işlemi tamamlandı!');
    
  } catch (error) {
    console.error('Örnek veri eklenirken hata oluştu:', error);
    throw error;
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log('Seed işlemi başarıyla tamamlandı.');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seed işlemi sırasında hata:', error);
      process.exit(1);
    });
}

module.exports = seedSampleData;

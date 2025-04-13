/**
 * Örnek etiket kuralları ve SLA süreleri eklemek için seed script
 */

const { sequelize, Tag, TagRule, SLA, User, Product } = require('../models');

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
    
    // 1. Etiket Kuralları Ekle
    console.log('Etiket kuralları ekleniyor...');
    
    const tagRules = [];
    
    if (acilEtiketi) {
      tagRules.push({
        name: 'Acil Talep Kuralı',
        description: 'Önceliği yüksek veya acil olan biletlere otomatik Acil etiketi ekler',
        conditions: {
          priority: ['high', 'urgent']
        },
        tagId: acilEtiketi.id,
        isActive: true,
        priority: 10,
        createdBy: adminUser.id,
        lastAppliedAt: null,
        applicationCount: 0
      });
    }
    
    if (hataEtiketi) {
      tagRules.push({
        name: 'Hata Bildirimi Kuralı',
        description: 'Hata tipi biletlere otomatik Hata etiketi ekler',
        conditions: {
          type: ['bug', 'error']
        },
        tagId: hataEtiketi.id,
        isActive: true,
        priority: 20,
        createdBy: adminUser.id,
        lastAppliedAt: null,
        applicationCount: 0
      });
    }
    
    if (oneriEtiketi) {
      tagRules.push({
        name: 'Öneri Kuralı',
        description: 'Öneri tipi biletlere otomatik Öneri etiketi ekler',
        conditions: {
          type: ['suggestion', 'feature']
        },
        tagId: oneriEtiketi.id,
        isActive: true,
        priority: 30,
        createdBy: adminUser.id,
        lastAppliedAt: null,
        applicationCount: 0
      });
    }
    
    if (tagRules.length > 0) {
      const createdRules = await TagRule.bulkCreate(tagRules.map(rule => {
        const { applyToExisting, ...rest } = rule;
        return rest;
      }), { returning: true });
      console.log(`${createdRules.length} etiket kuralı başarıyla eklendi`);
    } else {
      console.log('Uygun etiket bulunamadığı için etiket kuralı eklenemedi');
    }
    
    // 2. SLA Süreleri Ekle
    console.log('SLA süreleri ekleniyor...');
    
    // Önce mevcut SLA kayıtlarını kontrol edelim
    const existingSLAs = await SLA.findAll();
    
    // Her ürün için çeşitli öncelik seviyelerinde SLA'lar ekleyelim
    const slaEntries = [];
    
    for (const product of products) {
      // Her bir product-priority kombinasyonunu kontrol et
      const priorities = ['low', 'medium', 'high', 'urgent'];
      
      for (const priority of priorities) {
        // Bu kombinasyon için SLA zaten var mı?
        const existingSLA = existingSLAs.find(
          sla => sla.productId === product.id && sla.priorityLevel === priority
        );
        
        if (!existingSLA) {
          let entry = {
            productId: product.id,
            priorityLevel: priority,
            isActive: true
          };
          
          // Önceliğe göre SLA değerlerini belirle
          switch (priority) {
            case 'low':
              entry = {
                ...entry,
                responseTimeMinutes: 480, // 8 saat
                resolutionTimeMinutes: 2880, // 2 gün
                businessHoursOnly: true
              };
              break;
            case 'medium':
              entry = {
                ...entry,
                responseTimeMinutes: 240, // 4 saat
                resolutionTimeMinutes: 1440, // 1 gün
                businessHoursOnly: true
              };
              break;
            case 'high':
              entry = {
                ...entry,
                responseTimeMinutes: 120, // 2 saat
                resolutionTimeMinutes: 720, // 12 saat
                businessHoursOnly: true
              };
              break;
            case 'urgent':
              entry = {
                ...entry,
                responseTimeMinutes: 60, // 1 saat
                resolutionTimeMinutes: 240, // 4 saat
                businessHoursOnly: false // Acil durumda 7/24
              };
              break;
          }
          
          slaEntries.push(entry);
        }
      }
    }
    
    if (slaEntries.length > 0) {
      const slas = await SLA.bulkCreate(slaEntries, { returning: true });
      console.log(`${slas.length} SLA kaydı başarıyla eklendi`);
    } else {
      console.log('Tüm ürünler için SLA kayıtları zaten mevcut');
    }
    
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

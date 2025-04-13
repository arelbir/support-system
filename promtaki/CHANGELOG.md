# Changelog

## [Bugfix/notification-tag-fixes] - 2025-04-13

### Düzeltilen Hatalar

#### Etiket Kuralı Yönetimi
- **Sorun**: TagRule modelindeki `applyToExisting` sütunu veritabanında mevcut değildi, bu da uygulama hatasına neden oluyordu.
- **Çözüm**: TagRule modelinden `applyToExisting` sütunu tanımı kaldırıldı ve ilgili kontrolörlerde bu alan veritabanına gönderilmeden kullanılacak şekilde düzenlendi.

#### Etiket İstatistikleri Raporlaması
- **Sorun**: Etiket istatistikleri raporlamasında, SQL sorgularında sequelize nesnesi import edilmemiş ve kategori referansı belirsizliği hataları vardı.
- **Çözüm**: 
  - TagRuleController'a `sequelize` import edildi
  - Kategori istatistikleri sorgusu optimize edildi ve sütun referansı sorunları giderildi
  - Karmaşık ilişkiler yerine daha verimli ve açık SQL sorguları kullanıldı

### Teknik Detaylar

1. **backend/models/TagRule.js**: `applyToExisting` alanı modelden kaldırıldı.
2. **backend/controllers/tagRuleController.js**: 
   - Sequelize import eklendi
   - Etiket istatistikleri sorgusu raw SQL kullanılarak optimize edildi
   - Kategori belirsizliği sorunları çözüldü

### Notlar

- Bu değişiklik, etiket yönetimi ve raporlama özelliklerinin daha sağlam çalışmasını sağlar.
- Etiket sistemi, Gelişmiş Destek Talebi Sistemindeki "Etiket ve Kategori Yönetimi" özelliğini destekler ve operatörlerin biletleri daha etkili yönetmesine yardımcı olur.

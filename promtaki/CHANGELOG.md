# Changelog

## [feature/improved-chat-ui] - 2025-04-14

### Eklenen Özellikler

#### Geliştirilmiş Mesajlaşma Arayüzü
- **WhatsApp Tarzı Mesajlaşma**: Müşteri mesajları sağda mavi arka plan ile, operatör mesajları solda gri arka plan ile gösterilecek şekilde düzenlendi
- **Sağdan Açılan Sidebar**: Bilet detayları, atanan operatörler ve takipçiler için animasyonlu sidebar eklendi
- **Yükleme Animasyonları**: Mesajlar yüklenirken iskelet animasyonu ile kullanıcı deneyimi iyileştirildi
- **Satır Atlama Desteği**: Mesaj içeriklerinde whitespace-pre-wrap özelliği ile satır atlama desteklendi
- **Rol Bazlı UI Kontrolü**: Kullanıcı rolüne göre (admin/operatör/müşteri) farklı butonlar ve yetkiler gösteriliyor

#### Backend İyileştirmeleri
- **Sistem Mesaj Servisi**: systemMessageService.js, daha esnek parametre yapısı ile yeniden düzenlendi
- **Operatör Atama İşlemi**: ticketController.js içinde operatör atama hatası düzeltildi
- **Mesaj Veritabanı Güncellemesi**: Mesaj modeline readAt, isSystem ve attachments alanları eklendi

### Teknik Detaylar

1. **Yeni Komponentler**:
   - `MessageList.tsx`: Mesajlaşma arayüzü ve mesaj gruplandırma
   - `MessageInput.tsx`: Mesaj gönderme alanı
   - `TicketActionButtons.tsx`: Bilet işlem butonları
   - `TicketHeader.tsx`: Bilet başlığı ve durum kontrolleri

2. **Backend İyileştirmeleri**:
   - `systemMessageService.js`: Hem nesne hem de ayrı parametrelerle çalışabilen API
   - `ticketController.js`: Operatör atama sürecinde sistem mesajı iyileştirmesi

3. **Yeni Veritabanı Alanları**:
   - `Message.readAt`: Mesajın okunma zamanı
   - `Message.isSystem`: Sistem otomatik mesajı olup olmadığı
   - `Message.attachments`: Mesaj ekleri için JSON alanı

### Bağlantılı Özellikler

Bu geliştirmeler, Gelişmiş Destek Talebi Sistemi planında belirtilen aşağıdaki özellikleri desteklemektedir:

- **İletişim Özellikleri**: Zengin metin desteği, kullanıcı dostu arayüz
- **Gerçek Zamanlı Mesajlaşma Sistemi**: Modern ve sezgisel kullanıcı deneyimi
- **Durum/Statü Yönetimi**: Operatör atama, bilet durumu takibi
- **Bildirim Sistemi**: Sistem mesajları için iyileştirilmiş backend yapısı

### Notlar

- Sidebar yapısı, gelecekte bilgi bankası entegrasyonu için genişletilebilir
- Mesajlaşma arayüzü tasarımı mobil cihazlara uyumludur

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

# Gelişmiş Destek Talebi Sistemi

![Destek Sistemi Logo](./assets/logo.png)

Gelişmiş Destek Talebi Sistemi, müşteri destek taleplerini yönetmek, izlemek ve çözmek için geliştirilen kapsamlı bir uygulamadır. SLA takibi, gerçek zamanlı mesajlaşma, bildirimler ve gelişmiş raporlama özellikleriyle destek ekiplerinin verimliliğini artırmak üzere tasarlanmıştır.

## 🌟 Özellikler

### 🎯 Temel Özellikler
- **Bilet Yönetimi**: ID, konu, içerik, öncelik, kategori, ürün, modül ve tip gibi detaylı bilgilerle bilet oluşturma ve takip etme
- **İlişkili Veri Yönetimi**: Talep açan, firma, atanan operatör(ler) ve bilgilendirilecek kişiler gibi ilgili tarafları yönetme
- **Sınıflandırma Sistemi**: Etiketler, tipler (hata, öneri, soru) ve öncelik düzeyleri ile talepleri kategorize etme
- **Durum Takibi**: Özelleştirilebilir iş akışlarıyla talep durumlarını izleme
- **Ek Dosya Desteği**: Ekran görüntüleri, dosyalar ve diğer belgeleri biletlere ekleyebilme
- **Çoklu Operatör Ataması**: Birincil ve ikincil operatör rolleriyle ekip çalışmasını destekleme

### ⏱️ SLA & İş Saatleri Yönetimi
- **Otomatik SLA Hesaplama**: Ürün ve öncelik bazlı yanıt/çözüm süreleri
- **İş Saatleri Entegrasyonu**: İş saatlerine göre otomatik SLA hesaplama
- **Duraklatma/Devam**: Müşteri yanıtı beklendiğinde SLA zamanlayıcılarını otomatik duraklatma
- **Tatil Günleri Desteği**: Resmi tatil ve özel günlerde SLA hesaplamasına ara verme

### 💬 İletişim Özellikleri
- **Gerçek Zamanlı Mesajlaşma**: WebSocket (Socket.io) ile anlık mesajlaşma ve bildirimler
- **İç Notlar**: Müşteriye görünmeden ekip içi iletişim sağlama
- **Hazır Mesajlar**: Değişken destekli şablonlarla hızlı yanıt verme
- **Ek Dosya Desteği**: Mesajlara dosya ve görsel ekleme imkanı

### 🔔 Bildirim Sistemi
- **Çoklu Kanal Desteği**: Email, web bildirimleri ve WebSocket ile gerçek zamanlı bildirimler
- **Kişiselleştirilebilir Tercihler**: Kullanıcı bazlı bildirim tercihleri ve sessiz saatler
- **Okunma Takibi**: Bildirimlerin okunma durumunu izleme

### 🏷️ Etiket ve Kategori Yönetimi
- **Etiket Sistemi**: Özelleştirilebilir etiketlerle biletleri sınıflandırma
- **Otomatik Etiketleme**: Kural tabanlı otomatik etiketleme sistemi
- **İstatistikler**: Etiket bazlı raporlama ve analizler

### 📝 Bilgi Bankası Entegrasyonu
- **Otomatik Çözüm Aktarımı**: Başarılı çözümleri bilgi bankasına aktarma
- **Arama ve Öneri**: Bilet oluşturmada ilgili makaleleri önerme

### 📊 Raporlama ve Analiz
- **SLA Performans Raporları**: Yanıt ve çözüm performansı analizi
- **Bilet Analizi**: Dağılım ve trend raporları
- **Operatör Performansı**: Çözüm oranları ve iş yükü analizi

## 🚀 Teknoloji Yığını

### Backend
- **Node.js**: Sunucu tarafı uygulama çerçevesi
- **Express**: API geliştirme framework'ü
- **PostgreSQL**: Veritabanı sistemi
- **Sequelize**: ORM (Object-Relational Mapping) aracı
- **Socket.io**: Gerçek zamanlı iletişim için WebSocket desteği
- **JWT**: Kimlik doğrulama sistemi
- **Nodemailer**: E-posta bildirimleri için kütüphane
- **Swagger**: API dokümantasyonu

### Frontend
- **React**: Kullanıcı arayüzü geliştirme kütüphanesi
- **Shadcn UI**: Modern ve duyarlı UI bileşenleri
- **TailwindCSS**: CSS framework'ü
- **Socket.io Client**: Gerçek zamanlı iletişim

## 🔧 Kurulum

### Ön Koşullar
- Node.js (v14 veya üzeri)
- PostgreSQL (v12 veya üzeri)
- npm (v6 veya üzeri)

### Backend Kurulumu
1. Repo'yu klonlayın:
   ```
   git clone https://github.com/arelbir/support-system.git
   ```

2. Backend dizinine gidin:
   ```
   cd support-system/promtaki/backend
   ```

3. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

4. `.env` dosyasını yapılandırın (örnek `.env.example` dosyasını kopyalayın):
   ```
   cp .env.example .env
   ```
   
5. `.env` dosyasını düzenleyerek veritabanı bağlantı bilgilerinizi girin.

6. Veritabanını migrate edin:
   ```
   npx sequelize-cli db:migrate
   ```

7. (Opsiyonel) Örnek verileri ekleyin:
   ```
   npx sequelize-cli db:seed:all
   ```

8. Sunucuyu başlatın:
   ```
   npm run dev
   ```

### Frontend Kurulumu
1. Frontend dizinine gidin:
   ```
   cd ../shadcn-ui-frontend
   ```

2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

3. `.env` dosyasını yapılandırın:
   ```
   cp .env.example .env
   ```

4. Frontend uygulamasını başlatın:
   ```
   npm run dev
   ```

## 🌐 API Dokümantasyonu

API dokümantasyonuna erişmek için, backend sunucusunu başlattıktan sonra tarayıcınızda aşağıdaki URL'yi ziyaret edin:

```
http://localhost:5000/api-docs
```

Swagger UI, tüm API endpoint'lerini, parametrelerini ve yanıt şemalarını gösterecektir.

## 📦 Proje Yapısı

```
support-system/
├── backend/                   # Backend uygulaması
│   ├── config/                # Yapılandırma dosyaları
│   ├── controllers/           # API kontrolörleri
│   ├── middleware/            # Express middleware'leri
│   ├── models/                # Sequelize modelleri
│   ├── routes/                # API rotaları
│   ├── seeders/               # Veritabanı seed dosyaları
│   ├── uploads/               # Yüklenen dosyalar
│   └── utils/                 # Yardımcı fonksiyonlar ve servisler
│       ├── notificationService.js  # Bildirim sistemi
│       ├── slaService.js      # SLA hesaplama servisi
│       ├── socketManager.js   # WebSocket yöneticisi
│       └── ...
├── shadcn-ui-frontend/        # Frontend uygulaması
│   ├── components/            # React bileşenleri
│   ├── hooks/                 # Custom React hooks
│   ├── pages/                 # Sayfa bileşenleri
│   ├── styles/                # CSS dosyaları
│   └── utils/                 # Yardımcı fonksiyonlar
└── docs/                      # Dokümantasyon dosyaları
```

## 🧪 Test Etme

Backend testlerini çalıştırmak için:

```
cd backend
npm test
```

Frontend testlerini çalıştırmak için:

```
cd shadcn-ui-frontend
npm test
```

## 🔍 Sorun Giderme

Yaygın hatalar ve çözümleri:

- **Veritabanı Bağlantı Hatası**: `.env` dosyasındaki veritabanı bilgilerinin doğru olduğundan emin olun
- **Bildirim Gönderilemiyor**: E-posta yapılandırmanızı kontrol edin veya loglara bakın
- **Port Çakışması**: Backend veya frontend başlatılırken port çakışması yaşanıyorsa, `.env` dosyasında port numaralarını değiştirin

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için [LICENSE](./LICENSE) dosyasına bakın.

## 👥 Katkıda Bulunanlar

- Ertuğrul Albayrak - Proje Sahibi ve Baş Geliştirici

## 🙏 Teşekkürler

Bu projenin geliştirilmesine katkıda bulunan tüm açık kaynak topluluğuna teşekkür ederiz.

# Promtaki Deployment Guide

## Gereksinimler

- Node.js 14.x veya üzeri
- PostgreSQL 12.x veya üzeri
- npm 6.x veya üzeri

## Kurulum

1. Projeyi indirin ve arşivden çıkarın
2. Komut satırında proje dizinine gidin
3. Tüm bağımlılıkları yükleyin:

```bash
npm run install:all
```

4. PostgreSQL veritabanı oluşturun:

```bash
createdb promtaki
```

5. Backend için `.env` dosyasını düzenleyin:

```
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=promtaki
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres
JWT_SECRET=your_secret_key
NODE_ENV=production
PORT=5000
```

6. Veritabanı tablolarını oluşturun:

```bash
cd backend
npx sequelize-cli db:migrate
```

7. Uygulamayı başlatın:

```bash
npm start
```

## Dağıtım

### Frontend Dağıtımı

Frontend uygulaması statik dosyalardan oluşur ve herhangi bir statik dosya sunucusu ile dağıtılabilir:

1. Frontend'i derleyin:

```bash
npm run build:frontend
```

2. `frontend/build` dizinindeki dosyaları statik dosya sunucunuza yükleyin

### Backend Dağıtımı

Backend uygulaması Node.js tabanlıdır ve herhangi bir Node.js hosting hizmeti ile dağıtılabilir:

1. `backend` dizinini ve içindeki tüm dosyaları Node.js hosting hizmetinize yükleyin
2. Gerekli ortam değişkenlerini ayarlayın
3. Uygulamayı başlatın: `node server.js`

## Docker ile Dağıtım

Docker kullanarak uygulamayı dağıtmak için:

1. Docker ve Docker Compose'u yükleyin
2. Proje dizininde aşağıdaki komutu çalıştırın:

```bash
docker-compose up -d
```

## Kullanım

Uygulama başlatıldıktan sonra:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Varsayılan Kullanıcılar

İlk kurulumda aşağıdaki kullanıcıları oluşturmanız önerilir:

1. Admin kullanıcısı:
   - E-posta: admin@example.com
   - Şifre: Admin123456!
   - Rol: admin

2. Operatör kullanıcısı:
   - E-posta: operator@example.com
   - Şifre: Operator123456!
   - Rol: operator

3. Müşteri kullanıcısı:
   - E-posta: customer@example.com
   - Şifre: Customer123456!
   - Rol: customer

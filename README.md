# 🏛️ Kovancılar Belediyesi · Saha Operasyon Merkezi

Belediye personeli için **birim izole** giriş sistemine sahip kapsamlı bir saha operasyon yönetim paneli. 5 birim (Operasyon Merkezi, Fen İşleri, Zabıta, Altyapı Koordinasyon, İdari İşler) için ayrı paneller, canlı harita, PDF rapor üretimi ve Socket.io ile gerçek zamanlı bildirimler içerir.

![Kovancılar Belediyesi](public/logo.svg)

## ✨ Özellikler

### 🔐 Birim İzole Giriş Sistemi
- Her birimin kendi sicil `0001` hesabı ve varsayılan şifresi `123456789`
- Türkçe karakter normalizasyonu (ı/i, ş/s, ğ/g vb.)
- Şifre değiştirme modalı (her birim için ayrı)
- Sicil numarası hatırlama

### 🗺️ Kovancılar İlçesine Sabit Harita
- Leaflet + OpenStreetMap tile'ları
- Kovancılar ilçe sınırı çizgisi (maxBounds ile dışına çıkılamaz)
- Zoom 13-18 arası (sokak seviyesi detay)
- Vaka noktaları öncelik renk koduyla (kritik/yüksek/orta/düşük)

### 📋 5 Birim Paneli

**Operasyon Merkezi** (Belediye Başkanı — tüm birimlere tam yetki)
- Tüm vakaların canlı durumu
- Kayıt Yönetimi (Araç/Ekip/Mahalle/Personel ekle/sil)
- Birim bazlı vaka dağılımı + aylık trend grafikleri
- Tüm birimlere broadcast bildirim

**Fen İşleri** (Yol/Kaldırım/Parke)
- Kategori bazlı vaka listesi
- Mahalle bazlı yük grafiği
- "Haritada Göster" entegrasyonu

**Zabıta** (Büro & saha denetim)
- Denetim kayıtları (arama + yeni denetim formu)
- Ceza kartları (renk kodlu)
- Şikayet yönetimi

**Altyapı Koordinasyon** (Su/Kanalizasyon)
- 5 tip su arıza kaydı (kırılma/sızıntı/koku/tıkanma/renk)
- Vana odası takip tablosu
- Şebeke istatistikleri (basınç/tüketim/kayıp oranı)
- Numune analizi kartları

**İdari İşler** (Raporlama & kayıt)
- Evrak kayıt sistemi (arama + yeni evrak + sil + PDF üretimi)
- Dijital arşiv klasörleri
- Personel listesi
- Aylık Faaliyet Raporu PDF (Türkçe karakter desteği ile)

### 🔄 İnteraktif Vaka Yönetimi
- Vaka oluştur (tüm birimlerde Yeni Vaka formu)
- Durum değiştir (Yeni → Atandı → Devam → Çözüldü / İptal)
- Ekip atama (müsait ekip seçimi + lider)
- Çözüm notu ile kapatma (min 10 karakter)
- Vaka silme (onay modalı ile)
- Vaka Detay Modalı (tüm bilgiler + hızlı aksiyonlar + PDF üretimi)

### 📄 PDF Üretimi
- **Aylık Faaliyet Raporu** (5 sayfalı resmi belge)
- **Vaka Detay Raporu** (tek vaka için)
- **Evrak Detay Raporu** (tek evrak için)
- DejaVu Sans fontu gömülü → **Türkçe karakterler tam destekli** (İ, ı, ş, ğ, ü, ö, ç)

### 🔔 Canlı Bildirimler (Socket.io)
- WebSocket üzerinden gerçek zamanlı broadcast
- Vaka olayları: oluştur, durum değiştir, ekip ata, kapat
- Header'da CANLI/OFFLINE rozeti + bağlı client sayısı
- Bildirim popover + tek tek okuma

### 🎨 Tasarım
- Koyu lacivert tema (#0B1120 arka plan, #2563EB mavi vurgu)
- Radial ışıma + grid arka plan
- Responsive (mobil sidebar sheet ile)
- shadcn/ui bileşenleri (40+ komponent)

## 🚀 Kurulum

### Gereksinimler
- Node.js 18.17+ veya [Bun](https://bun.sh) runtime
- npm/pnpm/bun paket yöneticisi

### Adımlar

```bash
# 1. Repoyu klonla
git clone https://github.com/USERNAME/REPO.git
cd REPO

# 2. Bağımlılıkları yükle
bun install
# veya
npm install

# 3. Çevre değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenleyin (DATABASE_URL ayarlayın)

# 4. (Opsiyonel) Prisma veritabanını başlat
bun run db:push

# 5. Geliştirme sunucusunu başlat
bun run dev
# veya
npm run dev
```

Tarayıcıda http://localhost:3000 adresini açın.

## 🔑 Giriş Bilgileri (Varsayılan)

Tüm birimlerde aynı:

| Birim | Sicil | Şifre | Rol |
|-------|-------|-------|-----|
| Operasyon Merkezi | `0001` | `123456789` | Belediye Başkanı / Sistem Yöneticisi |
| Fen İşleri | `0001` | `123456789` | Fen İşleri Müdürü |
| Zabıta Müdürlüğü | `0001` | `123456789` | Zabıta Müdürü |
| Altyapı Koordinasyon | `0001` | `123456789` | Altyapı Müdürü |
| İdari İşler | `0001` | `123456789` | İdari İşler Müdürü |

> Giriş ekranındaki **"Şifre Değiştir / İlk Giriş Şifre Belirle"** butonu ile her birim için ayrı şifre belirleyebilirsiniz. Şifreler tarayıcının localStorage'ında saklanır.

## 📂 Proje Yapısı

```
.
├── .env.example              # Çevre değişkenleri şablonu
├── .gitignore                # GitHub'a yüklenmeyecek dosyalar
├── README.md                 # Bu dosya
├── package.json              # Bağımlılıklar ve scripts
├── next.config.ts            # Next.js config
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind CSS config
├── postcss.config.mjs        # PostCSS config
├── eslint.config.mjs         # ESLint config
├── components.json           # shadcn/ui config
├── prisma/
│   └── schema.prisma         # Prisma şeması (opsiyonel DB kullanımı için)
├── public/
│   ├── fonts/
│   │   ├── DejaVuSans.ttf     # Türkçe PDF fontu (regular)
│   │   └── DejaVuSans-Bold.ttf
│   ├── logo.svg              # Z.ai default logo
│   └── robots.txt
├── mini-services/
│   └── notifications/
│       ├── package.json      # Socket.io servisi bağımlılıkları
│       └── index.ts         # Socket.io sunucusu (port 3004)
├── scripts/
│   └── sync-logo.sh         # Logo senkronizasyon yardımcı scripti
└── src/
    ├── app/
    │   ├── globals.css       # Tema renkleri (dark navy + blue accent)
    │   ├── layout.tsx        # Root layout
    │   ├── page.tsx          # Ana sayfa (giriş ↔ panel router)
    │   └── api/route.ts      # Health check endpoint
    ├── lib/
    │   ├── auth.ts           # Kimlik doğrulama + şifre yönetimi
    │   ├── store.ts          # Zustand global state (localStorage kalıcı)
    │   ├── types.ts          # TypeScript tipleri
    │   ├── mock-data.ts      # Demo veri (vakalar, ekipler, mahalleler)
    │   ├── pdf-rapor.ts      # jsPDF rapor üretimi (Türkçe fontlu)
    │   ├── db.ts             # Prisma client (opsiyonel)
    │   └── utils.ts          # Yardımcı fonksiyonlar
    ├── hooks/
    │   ├── use-notifications.ts  # Socket.io bağlantı hook'u
    │   ├── use-mobile.ts
    │   └── use-toast.ts
    └── components/
        ├── ui/               # shadcn/ui bileşenleri (40+ dosya)
        ├── shared/
        │   ├── belediye-logo.tsx       # Logo (fallback K rozeti)
        │   ├── mini-harita.tsx         # Kovancılar sabit Leaflet haritası
        │   ├── vaka-karti.tsx          # İnteraktif vaka kartı + modaller
        │   ├── yeni-vaka-formu.tsx     # Yeni vaka formu (tüm birimler)
        │   └── yeni-denetim-evrak-formu.tsx  # Yeni denetim/evrak modal'ları
        ├── dashboards/
        │   ├── operasyon-dashboard.tsx
        │   ├── fen-isleri-dashboard.tsx
        │   ├── zabita-dashboard.tsx
        │   ├── altyapi-dashboard.tsx
        │   ├── idari-isler-dashboard.tsx
        │   └── kayit-yonetimi.tsx      # Araç/Ekip/Mahalle/Personel yönetimi
        ├── app-shell.tsx     # Üst bar + sidebar + içerik alanı
        └── login-screen.tsx  # Giriş ekranı + Şifre Değiştir modalı
```

## 🚢 Vercel Deployment

Bu uygulama **Vercel'e doğrudan deploy edilebilir**. Next.js 16 ile uyumlu.

### Otomatik Deploy (GitHub entegrasyonu)

1. **GitHub'a push yapın** (yukarıdaki talimatlara göre)
2. [vercel.com](https://vercel.com)'a gidin → **Add New → Project**
3. GitHub reponuzu seçin → **Import**
4. Framework preset: **Next.js** (otomatik algılanır)
5. Environment Variables kısmında `.env.example`'daki değişkenleri girin:
   - `DATABASE_URL` — opsiyonel (uygulama localStorage kullanır)
6. **Deploy** butonuna tıklayın

### Manuel Deploy (Vercel CLI)

```bash
# Vercel CLI yükle
npm i -g vercel

# Proje kök dizininde
vercel

# Production deploy
vercel --prod
```

## ⚠️ Önemli Not: Socket.io ve Vercel

Vercel **serverless** platformudur ve uzun süreli WebSocket bağlantılarını (Socket.io) desteklemez. Bu yüzden **canlı bildirim özelliği** Vercel'de çalışmaz.

### Çözüm Seçenekleri

**Seçenek 1: Socket.io olmadan çalıştır (önerilir)**
- Uygulama **tamamen çalışır** — tüm paneller, vaka yönetimi, PDF üretimi, arama özellikleri
- Yalnızca **CANLI badge** OFFLINE görünür ve bildirimler tarayıcı içinde lokal kalır
- Vaka oluşturma/durum değiştirme sizin tarayıcınızda görünür, diğer tarayıcılarda anlık yayın olmaz
- Demo amaçlı kullanım için yeterli

**Seçenek 2: Socket.io'yu ayrı platforma deploy et**
- [Render](https://render.com)'un ücretsiz tier'ında Socket.io servisini çalıştırın
- `mini-services/notifications/` klasörünü ayrı repo olarak deploy edin
- Frontend'deki `NEXT_PUBLIC_SOCKET_URL` çevre değişkenini Render URL'i ile güncelleyin
- `src/hooks/use-notifications.ts` dosyasını `NEXT_PUBLIC_SOCKET_URL` kullanacak şekilde güncelleyin

### Socket.io'yu Render'a Deploy Etme

```bash
# mini-services/notifications/ klasöründe ayrı bir repo oluştur
cd mini-services/notifications
git init
git add .
git commit -m "Socket.io bildirim servisi"
# GitHub'a pushla
# Render'da yeni Web Service oluştur, bu repoyu seç
# Build: bun install
# Start: bun index.ts
# Port: 3004
```

Ardından `src/hooks/use-notifications.ts` dosyasında:

```ts
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";
// Eğer SOCKET_URL boşsa, localStorage modunda çalış (Vercel için)
```

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York)
- **State**: Zustand 5 + localStorage persist
- **Map**: Leaflet + react-leaflet
- **PDF**: jsPDF + jspdf-autotable (DejaVu Sans font gömme)
- **Realtime**: Socket.io (opsiyonel)
- **Icons**: Lucide React
- **Database**: Prisma ORM (opsiyonel, varsayılan localStorage)

## 📜 Lisans

Bu proje Kovancılar Belediyesi içindir. Tüm hakları saklıdır.

## 📞 İletişim

**Kovancılar Belediyesi · Elazığ**
- Koordinat: 38.4237°K · 27.1428°D
- Sistem versiyon: v1.1 (demo)

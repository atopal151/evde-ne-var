# Evde Ne Var?

Akıllı mutfak ve buzdolabı asistanı — stok yönetimi, SKT takibi ve AI destekli tarif önerileri.

## Teknoloji

| Katman | Seçim |
|--------|--------|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS v4 |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| AI (Faz 2) | Google Gemini API |
| Barkod | html5-qrcode |

## Hızlı Başlangıç

```bash
cd evde-ne-var
cp .env.example .env.local
npm install
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) açın.

**Demo modu** varsayılan olarak açıktır (`NEXT_PUBLIC_USE_MOCK_DATA=true`). Veriler `localStorage`'da tutulur; Supabase kurulumu gerekmez.

## Supabase Kurulumu

### 1. Proje oluştur

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Proje adı + şifre belirleyin, bölge seçin

### 2. Veritabanı şeması

Dashboard → **SQL Editor** → New query → sırayla çalıştırın:

| Dosya | Ne yapar |
|-------|----------|
| `supabase/migrations/001_initial_schema.sql` | Tablolar + RLS |
| `supabase/migrations/002_enable_realtime.sql` | Realtime sync |
| `supabase/migrations/003_seed_demo_home.sql` | Demo ev kaydı |

### 3. API anahtarları

Settings → **API** → kopyalayın:

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. `.env.local` güncelle

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_DEMO_HOME_ID=00000000-0000-4000-a800-000000000001
```

### 5. Doğrula

```bash
npm run verify:supabase
npm run dev
```

Ana sayfada **yeşil "Supabase bağlı"** banner'ı görünmeli; badge **Bulut** olur.

> **Not:** Mock modda `NEXT_PUBLIC_DEMO_HOME_ID=demo-home-001` kullanılır. Supabase modunda UUID gerekir (migration 003).

## Auth Kurulumu

1. SQL Editor'de `supabase/migrations/004_auth_rls.sql` çalıştırın
2. Dashboard → **Authentication** → **Providers** → Email açık olsun
3. Geliştirme için: **Authentication** → **Sign In / Providers** → **Confirm email** kapalı (hızlı test)
4. Uygulamayı yeniden başlatın → `/register` ile hesap oluşturun

Giriş yapmadan korumalı sayfalara erişilemez (demo mod hariç).

## Proje Yapısı

```
src/
├── app/                 # Next.js sayfaları + API routes
│   ├── api/recipes/     # Gemini tarif endpoint'i
│   └── recipes/         # Tarif sayfası
├── components/          # UI bileşenleri (inventory, recipes, layout)
├── hooks/               # React hook'ları
├── lib/                 # Yardımcılar, Supabase client
├── services/            # IInventoryService soyutlaması
│   ├── interfaces/
│   ├── mock/            # Geliştirme / demo
│   └── supabase/        # Production
└── types/               # Domain tipleri
```

## Geliştirme Yol Haritası

- [x] **Faz 1** — El ile giriş, barkod tarayıcı, SKT dashboard
- [x] **Faz 2** — Gemini tarif motoru, "Pişirdim" stok düşümü
- [x] **Faz 3** — Alışveriş listesi, Supabase Realtime sync

## Mobil Taşınabilirlik

`src/services/interfaces/` altındaki arayüzler React Native / Flutter istemcileri tarafından aynı Supabase API'si üzerinden tüketilebilir şekilde tasarlanmıştır.

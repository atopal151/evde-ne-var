# Bugün Ne Pişirsem?

Eldeki malzemelerle AI destekli tarif önerileri — stok yönetimi, SKT takibi ve akıllı alışveriş listesi.

## Teknoloji

| Katman | Seçim |
|--------|--------|
| Frontend | Next.js 16, React 19, TypeScript, TailwindCSS v4 |
| Backend | Supabase (PostgreSQL, Auth, Realtime) |
| AI | Google Gemini API |
| Barkod | html5-qrcode |

## Hızlı Başlangıç

```bash
cd bugun-ne-pisirsem   # veya mevcut klasör adınız
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

Dashboard → **SQL Editor** → sırayla çalıştırın:

| Dosya | Ne yapar |
|-------|----------|
| `supabase/setup_all.sql` | Tablolar + RLS + Realtime + demo ev (tek seferde) |
| `supabase/migrations/004_auth_rls.sql` | Auth + kullanıcı bazlı RLS |
| `supabase/migrations/005_ensure_profile.sql` | Profil/ev otomatik oluşturma |

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
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
```

### 5. Doğrula

```bash
npm run verify:supabase
npm run dev
```

Ana sayfada **yeşil "Supabase bağlı"** banner'ı görünmeli; badge **Bulut** olur.

## Auth Kurulumu

1. SQL Editor'de `004_auth_rls.sql` ve `005_ensure_profile.sql` çalıştırın
2. Dashboard → **Authentication** → **Providers** → Email açık olsun
3. Geliştirme için: **Confirm email** kapalı (hızlı test)
4. Uygulamayı yeniden başlatın → `/register` ile hesap oluşturun

## Vercel Deploy

1. Kodu GitHub'a push edin
2. [vercel.com/new](https://vercel.com/new) → repo'yu import edin
3. **Environment Variables** ekleyin (`.env.local` ile aynı değerler, `NEXT_PUBLIC_USE_MOCK_DATA=false`)
4. Deploy → canlı URL'yi kopyalayın
5. Supabase → **Authentication → URL Configuration**:
   - **Site URL:** `https://SIZIN-URL.vercel.app`
   - **Redirect URLs:** `https://SIZIN-URL.vercel.app/auth/callback`

## Proje Yapısı

```
src/
├── app/                 # Next.js sayfaları + API routes
├── components/          # UI, auth, brand (Logo)
├── hooks/
├── lib/brand.ts         # Uygulama adı ve meta
├── services/            # Mock + Supabase servisleri
└── types/
```

## Geliştirme Yol Haritası

- [x] **Faz 1** — Stok girişi, barkod, SKT dashboard
- [x] **Faz 2** — Gemini tarif motoru, "Pişirdim" stok düşümü
- [x] **Faz 3** — Alışveriş listesi, Realtime sync
- [x] **Auth** — Login, kayıt, RLS

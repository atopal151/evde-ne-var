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

1. [supabase.com](https://supabase.com) üzerinde proje oluşturun
2. `supabase/migrations/001_initial_schema.sql` dosyasını SQL Editor'de çalıştırın
3. `.env.local` dosyasına URL ve anon key ekleyin
4. `NEXT_PUBLIC_USE_MOCK_DATA=false` yapın

## Proje Yapısı

```
src/
├── app/                 # Next.js sayfaları
├── components/          # UI bileşenleri
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
- [ ] **Faz 2** — Gemini tarif motoru, "Pişirdim" stok düşümü
- [ ] **Faz 3** — Alışveriş listesi, çoklu kullanıcı sync

## Mobil Taşınabilirlik

`src/services/interfaces/` altındaki arayüzler React Native / Flutter istemcileri tarafından aynı Supabase API'si üzerinden tüketilebilir şekilde tasarlanmıştır.

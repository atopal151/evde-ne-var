#!/usr/bin/env node
/**
 * Supabase bağlantısını doğrular.
 * Kullanım: npm run verify:supabase
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(path, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    console.error("❌ .env.local bulunamadı. cp .env.example .env.local");
    process.exit(1);
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const mock = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const homeId =
  process.env.NEXT_PUBLIC_DEMO_HOME_ID ??
  "00000000-0000-4000-a800-000000000001";

console.log("\n🔍 Supabase doğrulama\n");

if (mock) {
  console.log("⚠️  NEXT_PUBLIC_USE_MOCK_DATA=true → veriler localStorage'da");
}

if (!url || !key) {
  console.log("❌ NEXT_PUBLIC_SUPABASE_URL veya ANON_KEY eksik");
  console.log("\nAdımlar:");
  console.log("  1. supabase.com → New project");
  console.log("  2. Settings → API → URL + anon key kopyala");
  console.log("  3. .env.local dosyasına yapıştır");
  process.exit(1);
}

console.log(`📡 URL: ${url.slice(0, 30)}...`);
console.log(`🏠 Home ID: ${homeId}`);

const res = await fetch(`${url}/rest/v1/homes?id=eq.${homeId}&select=id,name`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

if (!res.ok) {
  console.log(`❌ API hatası: ${res.status} ${await res.text()}`);
  process.exit(1);
}

const homes = await res.json();

if (!homes.length) {
  console.log("⚠️  Bağlantı OK ama demo ev yok");
  console.log("   → supabase/migrations/003_seed_demo_home.sql çalıştırın");
  process.exit(1);
}

console.log(`✅ Bağlantı OK — ev: ${homes[0].name}`);

if (mock) {
  console.log("\n→ Supabase'e geçmek için .env.local:");
  console.log("   NEXT_PUBLIC_USE_MOCK_DATA=false");
  console.log("   Sunucuyu yeniden başlatın");
} else {
  console.log("\n✅ Supabase modu aktif — veriler bulutta");
}

console.log("");

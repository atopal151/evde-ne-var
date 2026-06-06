import { NextResponse } from "next/server";
import { SUPABASE_DEMO_HOME_ID } from "@/lib/supabase/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { shouldUseMockData } from "@/services";

export interface SupabaseSetupStatus {
  configured: boolean;
  connected: boolean;
  mockMode: boolean;
  homeId: string;
  homeExists: boolean;
  tablesOk: boolean;
  message: string;
  steps?: string[];
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const mockMode = shouldUseMockData();
  const homeId =
    process.env.NEXT_PUBLIC_DEMO_HOME_ID ?? SUPABASE_DEMO_HOME_ID;

  const status: SupabaseSetupStatus = {
    configured: Boolean(url && key),
    connected: false,
    mockMode,
    homeId,
    homeExists: false,
    tablesOk: false,
    message: "",
  };

  if (mockMode) {
    status.message = url && key
      ? "Supabase env tanımlı ama NEXT_PUBLIC_USE_MOCK_DATA=true — veriler localStorage'da."
      : "Demo mod: Supabase URL/key .env.local dosyasında tanımlı değil.";
    status.steps = [
      "supabase.com → New project",
      "SQL Editor'de migration dosyalarını sırayla çalıştırın",
      ".env.local → URL, anon key, USE_MOCK_DATA=false",
      "Sunucuyu yeniden başlatın",
    ];
    return NextResponse.json(status);
  }

  if (!url || !key) {
    status.message = "NEXT_PUBLIC_SUPABASE_URL veya ANON_KEY eksik.";
    return NextResponse.json(status);
  }

  const client = await createServerSupabaseClient();
  if (!client) {
    status.message = "Supabase istemcisi oluşturulamadı.";
    return NextResponse.json(status);
  }

  const { data: home, error: homeError } = await client
    .from("homes")
    .select("id, name")
    .eq("id", homeId)
    .maybeSingle();

  if (homeError) {
    status.message = `Bağlantı hatası: ${homeError.message}`;
    status.steps = [
      "Migration 001–003 SQL dosyalarını çalıştırdınız mı?",
      "NEXT_PUBLIC_DEMO_HOME_ID UUID formatında mı?",
    ];
    return NextResponse.json(status);
  }

  status.connected = true;
  status.homeExists = Boolean(home);

  const { error: inventoryError } = await client
    .from("inventory")
    .select("id")
    .eq("home_id", homeId)
    .limit(1);

  status.tablesOk = !inventoryError;

  if (!home) {
    status.message =
      "Supabase bağlı ama demo ev bulunamadı. 003_seed_demo_home.sql migration'ını çalıştırın.";
    status.steps = [
      `NEXT_PUBLIC_DEMO_HOME_ID=${SUPABASE_DEMO_HOME_ID}`,
      "supabase/migrations/003_seed_demo_home.sql → SQL Editor",
    ];
    return NextResponse.json(status);
  }

  if (inventoryError) {
    status.message = `Tablo erişim hatası: ${inventoryError.message}`;
    return NextResponse.json(status);
  }

  status.message = `Supabase bağlı — ev: ${home.name}. Giriş yaparak kendi mutfağınızı kullanın.`;
  return NextResponse.json(status);
}

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase yapılandırılmamış" }, { status: 500 });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Oturum bulunamadı" }, { status: 401 });
  }

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Evim";

  const { data, error } = await supabase.rpc("ensure_user_profile", {
    p_full_name: fullName,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  const homeId = row?.out_home_id as string | undefined;

  if (!homeId) {
    return NextResponse.json({ error: "Ev oluşturulamadı" }, { status: 500 });
  }

  return NextResponse.json({ homeId });
}

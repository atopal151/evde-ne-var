import type { SupabaseClient } from "@supabase/supabase-js";
import type { IInventoryService } from "@/services/interfaces/IInventoryService";
import { MockInventoryService } from "@/services/mock/MockInventoryService";
import { SupabaseInventoryService } from "@/services/supabase/SupabaseInventoryService";

export function getHomeId(): string {
  return (
    process.env.NEXT_PUBLIC_DEMO_HOME_ID ?? "demo-home-001"
  );
}

export function shouldUseMockData(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") return true;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function createInventoryService(
  client?: SupabaseClient
): IInventoryService {
  const homeId = getHomeId();

  if (shouldUseMockData() || !client) {
    return new MockInventoryService(homeId);
  }

  return new SupabaseInventoryService(client);
}

export type { IInventoryService } from "@/services/interfaces/IInventoryService";

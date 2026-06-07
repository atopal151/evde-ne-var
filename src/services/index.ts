import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MOCK_DEMO_HOME_ID,
  SUPABASE_DEMO_HOME_ID,
} from "@/lib/supabase/constants";
import type { IFamilyService } from "@/services/interfaces/IFamilyService";
import type { IInventoryService } from "@/services/interfaces/IInventoryService";
import type { IShoppingListService } from "@/services/interfaces/IShoppingListService";
import { MockFamilyService } from "@/services/mock/MockFamilyService";
import { MockInventoryService } from "@/services/mock/MockInventoryService";
import { MockShoppingListService } from "@/services/mock/MockShoppingListService";
import { SupabaseFamilyService } from "@/services/supabase/SupabaseFamilyService";
import { SupabaseInventoryService } from "@/services/supabase/SupabaseInventoryService";
import { SupabaseShoppingListService } from "@/services/supabase/SupabaseShoppingListService";

export function getHomeId(): string {
  if (process.env.NEXT_PUBLIC_DEMO_HOME_ID) {
    return process.env.NEXT_PUBLIC_DEMO_HOME_ID;
  }

  return shouldUseMockData() ? MOCK_DEMO_HOME_ID : SUPABASE_DEMO_HOME_ID;
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

export function createShoppingListService(
  client?: SupabaseClient
): IShoppingListService {
  if (shouldUseMockData() || !client) {
    return new MockShoppingListService();
  }

  return new SupabaseShoppingListService(client);
}

export function createFamilyService(
  client?: SupabaseClient,
  userEmail?: string | null
): IFamilyService {
  if (shouldUseMockData() || !client) {
    return new MockFamilyService(userEmail ?? undefined);
  }

  return new SupabaseFamilyService(client);
}

export type { IFamilyService } from "@/services/interfaces/IFamilyService";
export type { IInventoryService } from "@/services/interfaces/IInventoryService";
export type { IShoppingListService } from "@/services/interfaces/IShoppingListService";
export type { IRecipeService } from "@/services/interfaces/IRecipeService";

export function shouldUseMockRecipes(): boolean {
  return !process.env.GEMINI_API_KEY;
}

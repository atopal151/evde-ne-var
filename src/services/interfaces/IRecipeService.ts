import type { Locale } from "@/i18n/config";
import type { InventoryItem } from "@/types/database";
import type { RecipeResponse } from "@/types/recipes";

export interface IRecipeService {
  generate(inventory: InventoryItem[], locale?: Locale): Promise<RecipeResponse>;
}

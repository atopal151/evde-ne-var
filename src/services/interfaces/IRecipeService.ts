import type { InventoryItem } from "@/types/database";
import type { RecipeResponse } from "@/types/recipes";

export interface IRecipeService {
  generate(inventory: InventoryItem[]): Promise<RecipeResponse>;
}

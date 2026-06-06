import type { InventoryItem } from "@/types/database";
import type {
  IngredientDeduction,
  RecipeIngredientUsage,
} from "@/types/recipes";

function normalizeName(name: string): string {
  return name.toLocaleLowerCase("tr").trim();
}

export function resolveIngredientDeductions(
  ingredients: RecipeIngredientUsage[],
  inventory: InventoryItem[]
): IngredientDeduction[] {
  return ingredients.map((ingredient) => {
    const item = inventory.find(
      (i) =>
        normalizeName(i.product_name) === normalizeName(ingredient.product_name)
    );

    return {
      inventoryId: item?.id ?? "",
      product_name: ingredient.product_name,
      amount: ingredient.amount,
      unit: ingredient.unit,
      currentQuantity: item?.quantity ?? 0,
      matched: Boolean(item),
    };
  });
}

export function hasUnmatchedIngredients(deductions: IngredientDeduction[]): boolean {
  return deductions.some((d) => !d.matched);
}

export function hasInsufficientStock(deductions: IngredientDeduction[]): boolean {
  return deductions.some(
    (d) => d.matched && d.amount > d.currentQuantity
  );
}

export interface RecipeIngredientUsage {
  product_name: string;
  amount: number;
  unit: string;
}

export interface Recipe {
  name: string;
  match_rate: string;
  required_extra_ingredients: string[];
  instructions: string[];
  prep_time: string;
  ingredients_used: RecipeIngredientUsage[];
}

export interface RecipeResponse {
  recipes: Recipe[];
  warning?: string;
  source?: "gemini" | "mock";
}

export interface IngredientDeduction {
  inventoryId: string;
  product_name: string;
  amount: number;
  unit: string;
  currentQuantity: number;
  matched: boolean;
}

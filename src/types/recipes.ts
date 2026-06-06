export interface Recipe {
  name: string;
  match_rate: string;
  required_extra_ingredients: string[];
  instructions: string[];
  prep_time: string;
}

export interface RecipeResponse {
  recipes: Recipe[];
}

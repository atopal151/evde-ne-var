import { z } from "zod";

export const recipeIngredientSchema = z.object({
  product_name: z.string().min(1),
  amount: z.number().positive(),
  unit: z.string().min(1),
});

export const recipeSchema = z.object({
  name: z.string().min(1),
  match_rate: z.string().min(1),
  required_extra_ingredients: z.array(z.string()),
  instructions: z.array(z.string().min(1)).min(1),
  prep_time: z.string().min(1),
  ingredients_used: z.array(recipeIngredientSchema).min(1),
});

export const recipeResponseSchema = z.object({
  recipes: z.array(recipeSchema).min(1).max(3),
});

export const generateRecipesRequestSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      product_name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      category: z.string(),
      expiration_date: z.string().nullable().optional(),
    })
  ),
});

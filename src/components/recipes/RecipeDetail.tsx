"use client";

import { useTranslations } from "next-intl";
import { X, Clock, ListOrdered, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Recipe } from "@/types/recipes";

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
  onCooked: (recipe: Recipe) => void;
}

export function RecipeDetail({ recipe, onClose, onCooked }: RecipeDetailProps) {
  const t = useTranslations("recipes");
  const tCommon = useTranslations("common");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-detail-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-start justify-between border-b border-cream-300 bg-white px-5 py-4">
          <div>
            <h2 id="recipe-detail-title" className="text-lg font-bold text-navy-900">
              {recipe.name}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-navy-500">
              <Clock className="h-3.5 w-3.5" />
              {t("detailMeta", { time: recipe.prep_time, rate: recipe.match_rate })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-400 hover:bg-cream-200"
            aria-label={tCommon("close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-4">
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-plum-700">
              <Package className="h-4 w-4" />
              {t("ingredientsUsed")}
            </h3>
            <ul className="space-y-1 text-sm text-navy-700">
              {recipe.ingredients_used.map((ing) => (
                <li key={`${ing.product_name}-${ing.amount}`}>
                  {ing.product_name} — {ing.amount} {ing.unit}
                </li>
              ))}
            </ul>
          </section>

          {recipe.required_extra_ingredients.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-semibold text-orange-700">
                {t("extraIngredients")}
              </h3>
              <p className="text-sm text-navy-600">
                {recipe.required_extra_ingredients.join(", ")}
              </p>
            </section>
          )}

          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-forest-700">
              <ListOrdered className="h-4 w-4" />
              {t("instructions")}
            </h3>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-navy-700">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <div className="sticky bottom-0 border-t border-cream-300 bg-white px-5 py-4">
          <Button fullWidth size="lg" onClick={() => onCooked(recipe)}>
            {t("cookedButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}

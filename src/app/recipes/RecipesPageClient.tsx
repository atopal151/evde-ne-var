"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChefHat, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeIllustration } from "@/components/illustrations/KitchenIllustrations";
import { CookedConfirmDialog } from "@/components/recipes/CookedConfirmDialog";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSection } from "@/components/ui/PageSection";
import { useInventory } from "@/hooks/useInventory";
import { useRecipes } from "@/hooks/useRecipes";
import { isFromLatestBatch } from "@/lib/recipes/recipeHistory";
import { resolveIngredientDeductions } from "@/lib/recipes/matchIngredients";
import type { Recipe } from "@/types/recipes";

export function RecipesPageClient() {
  const t = useTranslations("recipes");
  const { items, loading: inventoryLoading, deductIngredients } =
    useInventory();
  const { entries, lastBatchAt, maxHistory, hydrated, loading, error, warning, generate } =
    useRecipes();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cookedRecipe, setCookedRecipe] = useState<Recipe | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const deductions = useMemo(() => {
    if (!cookedRecipe) return [];
    return resolveIngredientDeductions(cookedRecipe.ingredients_used, items);
  }, [cookedRecipe, items]);

  const handleGenerate = () => {
    setSuccessMessage(null);
    void generate(items);
  };

  const handleConfirmCooked = async () => {
    if (!cookedRecipe) return;

    setSubmitting(true);
    try {
      await deductIngredients(
        deductions
          .filter((d) => d.matched && d.amount > 0)
          .map((d) => ({ inventoryId: d.inventoryId, amount: d.amount }))
      );
      setSuccessMessage(t("cookedSuccess", { name: cookedRecipe.name }));
      setCookedRecipe(null);
      setSelectedRecipe(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <div className="mb-6 space-y-4">
        <PageSection
          title={t("suggestTitle")}
          subtitle={
            inventoryLoading
              ? t("inventoryLoading")
              : entries.length > 0
                ? t("summaryWithRecipes", {
                    count: entries.length,
                    max: maxHistory,
                    ingredients: items.length,
                  })
                : t("summaryNoRecipes", { ingredients: items.length })
          }
          icon={ChefHat}
          actions={
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={loading || inventoryLoading || items.length === 0}
            >
              <Sparkles className="h-4 w-4" />
              {loading ? t("generating") : t("generate")}
            </Button>
          }
        />

        {items.length === 0 && !inventoryLoading && (
          <EmptyState
            illustration={<RecipeIllustration className="h-32 w-32" />}
            title={t("emptyStockTitle")}
            description={t("emptyStockDescription")}
          />
        )}

        {warning && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
            {warning}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
            {successMessage}
          </div>
        )}
      </div>

      {!hydrated ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : loading && entries.length === 0 ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : entries.length > 0 ? (
        <div>
          <ul className="space-y-3">
            {entries.map((entry) => (
              <li key={entry.id}>
                <RecipeCard
                  recipe={entry.recipe}
                  onSelect={setSelectedRecipe}
                  isNew={isFromLatestBatch(entry, lastBatchAt)}
                />
              </li>
            ))}
          </ul>
          {loading && (
            <p className="mt-4 text-center text-sm text-navy-500">
              {t("generatingMore")}
            </p>
          )}
        </div>
      ) : (
        !error &&
        items.length > 0 && (
          <EmptyState
            illustration={<RecipeIllustration className="h-36 w-36" />}
            title={t("emptyRecipesTitle")}
            description={t("emptyRecipesDescription")}
            action={
              <Button onClick={handleGenerate} disabled={loading}>
                <Sparkles className="h-4 w-4" />
                {t("generate")}
              </Button>
            }
          />
        )
      )}

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onCooked={(recipe) => {
            setSelectedRecipe(null);
            setCookedRecipe(recipe);
          }}
        />
      )}

      {cookedRecipe && (
        <CookedConfirmDialog
          recipeName={cookedRecipe.name}
          deductions={deductions}
          submitting={submitting}
          onConfirm={() => void handleConfirmCooked()}
          onClose={() => setCookedRecipe(null)}
        />
      )}
    </AppShell>
  );
}

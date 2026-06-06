"use client";

import { useMemo, useState } from "react";
import { ChefHat, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { RecipeIllustration } from "@/components/illustrations/KitchenIllustrations";
import { GeminiStatusBanner } from "@/components/recipes/GeminiStatusBanner";
import { CookedConfirmDialog } from "@/components/recipes/CookedConfirmDialog";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSection } from "@/components/ui/PageSection";
import { useGeminiStatus } from "@/hooks/useGeminiStatus";
import { useInventory } from "@/hooks/useInventory";
import { useRecipes } from "@/hooks/useRecipes";
import { resolveIngredientDeductions } from "@/lib/recipes/matchIngredients";
import type { Recipe } from "@/types/recipes";

export function RecipesPageClient() {
  const { status: geminiStatus, message: geminiMessage, isGeminiReady } =
    useGeminiStatus();
  const { items, loading: inventoryLoading, deductIngredients } =
    useInventory();
  const { recipes, loading, error, warning, source, generate } = useRecipes();

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
      setSuccessMessage(`${cookedRecipe.name} pişirildi — stok güncellendi.`);
      setCookedRecipe(null);
      setSelectedRecipe(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Tarifler"
      subtitle="Eldeki malzemelerle AI destekli öneriler"
      badge={isGeminiReady ? "Gemini ✓" : "Demo"}
    >
      <div className="mb-6 space-y-4">
        <GeminiStatusBanner status={geminiStatus} message={geminiMessage} />

        <PageSection
          title="Tarif Öner"
          subtitle={
            inventoryLoading
              ? "Stok yükleniyor..."
              : `${items.length} malzeme ile tarif üret`
          }
          icon={ChefHat}
          actions={
            <Button
              size="sm"
              onClick={handleGenerate}
              disabled={loading || inventoryLoading || items.length === 0}
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "Üretiliyor..." : "Tarif Öner"}
            </Button>
          }
        />

        {items.length === 0 && !inventoryLoading && (
          <EmptyState
            illustration={<RecipeIllustration className="h-32 w-32" />}
            title="Stok boş"
            description="Tarif almak için önce malzeme ekleyin. Stok sayfasından hızlıca ürün girebilirsiniz."
          />
        )}

        {source === "gemini" && recipes.length > 0 && (
          <div className="rounded-2xl border border-forest-200/60 bg-gradient-to-r from-forest-50 to-emerald-50/40 px-4 py-3 text-sm text-forest-800">
            ✨ Son tarifler Gemini AI ile üretildi.
          </div>
        )}

        {source === "mock" && recipes.length > 0 && !warning && (
          <div className="rounded-2xl border border-cream-300 bg-cream-100/80 px-4 py-3 text-sm text-navy-700">
            Son tarifler demo modda üretildi (API key yok veya geçersiz).
          </div>
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

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <ul className="space-y-3">
          {recipes.map((recipe) => (
            <li key={recipe.name}>
              <RecipeCard recipe={recipe} onSelect={setSelectedRecipe} />
            </li>
          ))}
        </ul>
      ) : (
        !error &&
        items.length > 0 && (
          <EmptyState
            illustration={<RecipeIllustration className="h-36 w-36" />}
            title="Henüz tarif üretilmedi"
            description='"Tarif Öner" ile eldeki malzemelere göre 3 tarif alın.'
            action={
              <Button onClick={handleGenerate} disabled={loading}>
                <Sparkles className="h-4 w-4" />
                Tarif Öner
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

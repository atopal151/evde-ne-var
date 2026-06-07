"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  appendRecipesToHistory,
  clearRecipeHistory,
  loadRecipeHistory,
  MAX_RECIPE_HISTORY,
  saveRecipeHistory,
  type StoredRecipe,
} from "@/lib/recipes/recipeHistory";
import type { InventoryItem } from "@/types/database";
import type { RecipeResponse } from "@/types/recipes";

export function useRecipes() {
  const { user } = useAuth();
  const scope = user?.id ?? "guest";

  const [entries, setEntries] = useState<StoredRecipe[]>([]);
  const [lastBatchAt, setLastBatchAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<"gemini" | "mock" | null>(null);

  useEffect(() => {
    const history = loadRecipeHistory(scope);
    setEntries(history.entries);
    setLastBatchAt(history.lastBatchAt ?? null);
    setSource(history.lastSource ?? null);
    setWarning(history.lastWarning ?? null);
    setHydrated(true);
  }, [scope]);

  const generate = useCallback(
    async (items: InventoryItem[]) => {
      setLoading(true);
      setError(null);
      setWarning(null);

      try {
        const response = await fetch("/api/recipes/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        const data = (await response.json()) as RecipeResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Tarifler oluşturulamadı");
        }

        const current = loadRecipeHistory(scope);
        const updated = appendRecipesToHistory(current, data.recipes, {
          source: data.source,
          warning: data.warning ?? null,
        });

        saveRecipeHistory(scope, updated);
        setEntries(updated.entries);
        setLastBatchAt(updated.lastBatchAt ?? null);
        if (data.warning) setWarning(data.warning);
        if (data.source) setSource(data.source);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Tarifler oluşturulamadı");
      } finally {
        setLoading(false);
      }
    },
    [scope]
  );

  const clear = useCallback(() => {
    clearRecipeHistory(scope);
    setEntries([]);
    setLastBatchAt(null);
    setError(null);
    setWarning(null);
    setSource(null);
  }, [scope]);

  return {
    entries,
    lastBatchAt,
    recipes: entries.map((entry) => entry.recipe),
    maxHistory: MAX_RECIPE_HISTORY,
    hydrated,
    loading,
    error,
    warning,
    source,
    generate,
    clear,
  };
}

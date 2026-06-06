"use client";

import { useCallback, useState } from "react";
import type { InventoryItem } from "@/types/database";
import type { Recipe, RecipeResponse } from "@/types/recipes";

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [source, setSource] = useState<"gemini" | "mock" | null>(null);

  const generate = useCallback(async (items: InventoryItem[]) => {
    setLoading(true);
    setError(null);
    setWarning(null);
    setSource(null);

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

      setRecipes(data.recipes);
      if (data.warning) setWarning(data.warning);
      if (data.source) setSource(data.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tarifler oluşturulamadı");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setRecipes([]);
    setError(null);
    setWarning(null);
    setSource(null);
  }, []);

  return { recipes, loading, error, warning, source, generate, clear };
}

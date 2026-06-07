import type { Recipe } from "@/types/recipes";

export const MAX_RECIPE_HISTORY = 10;

export const RECIPE_HISTORY_STORAGE_PREFIX = "bugun-ne-pisirsem-recipe-history";

export interface StoredRecipe {
  id: string;
  savedAt: string;
  recipe: Recipe;
}

export interface RecipeHistory {
  entries: StoredRecipe[];
  lastSource?: "gemini" | "mock";
  lastWarning?: string | null;
}

function storageKey(scope: string): string {
  return `${RECIPE_HISTORY_STORAGE_PREFIX}-${scope}`;
}

export function loadRecipeHistory(scope: string): RecipeHistory {
  if (typeof window === "undefined") {
    return { entries: [] };
  }

  try {
    const raw = localStorage.getItem(storageKey(scope));
    if (!raw) return { entries: [] };

    const parsed = JSON.parse(raw) as RecipeHistory;
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];

    return {
      entries: sortEntriesOldestFirst(entries).slice(-MAX_RECIPE_HISTORY),
      lastSource: parsed.lastSource,
      lastWarning: parsed.lastWarning ?? null,
    };
  } catch {
    return { entries: [] };
  }
}

export function saveRecipeHistory(scope: string, history: RecipeHistory): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    storageKey(scope),
    JSON.stringify({
      ...history,
      entries: sortEntriesOldestFirst(history.entries).slice(-MAX_RECIPE_HISTORY),
    })
  );
}

function sortEntriesOldestFirst(entries: StoredRecipe[]): StoredRecipe[] {
  return [...entries].sort(
    (a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime()
  );
}

function createEntryId(index: number): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${Date.now()}-${index}-${crypto.randomUUID()}`;
  }
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`;
}

export function appendRecipesToHistory(
  history: RecipeHistory,
  newRecipes: Recipe[],
  meta: { source?: "gemini" | "mock"; warning?: string | null }
): RecipeHistory {
  const savedAt = new Date().toISOString();
  const newEntries: StoredRecipe[] = newRecipes.map((recipe, index) => ({
    id: createEntryId(index),
    savedAt,
    recipe,
  }));

  const byName = new Map<string, StoredRecipe>();
  for (const entry of [...history.entries, ...newEntries]) {
    const existing = byName.get(entry.recipe.name);
    if (!existing || entry.savedAt >= existing.savedAt) {
      byName.set(entry.recipe.name, entry);
    }
  }

  const merged = sortEntriesOldestFirst(Array.from(byName.values()));
  const trimmed =
    merged.length > MAX_RECIPE_HISTORY
      ? merged.slice(merged.length - MAX_RECIPE_HISTORY)
      : merged;

  return {
    entries: trimmed,
    lastSource: meta.source,
    lastWarning: meta.warning ?? null,
  };
}

export function clearRecipeHistory(scope: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(scope));
}

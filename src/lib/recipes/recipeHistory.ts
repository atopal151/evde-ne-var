import type { Recipe } from "@/types/recipes";

export const MAX_RECIPE_HISTORY = 10;

export const RECIPE_HISTORY_STORAGE_PREFIX = "nepisirsem-recipe-history";

export interface StoredRecipe {
  id: string;
  savedAt: string;
  recipe: Recipe;
}

export interface RecipeHistory {
  entries: StoredRecipe[];
  lastSource?: "gemini" | "mock";
  lastWarning?: string | null;
  lastBatchAt?: string | null;
}

function storageKey(scope: string): string {
  return `${RECIPE_HISTORY_STORAGE_PREFIX}-${scope}`;
}

function getLatestSavedAt(entries: StoredRecipe[]): string | null {
  if (entries.length === 0) return null;
  return entries.reduce(
    (latest, entry) => (entry.savedAt > latest ? entry.savedAt : latest),
    entries[0].savedAt
  );
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

    const sorted = sortEntriesNewestFirst(entries).slice(0, MAX_RECIPE_HISTORY);

    return {
      entries: sorted,
      lastSource: parsed.lastSource,
      lastWarning: parsed.lastWarning ?? null,
      lastBatchAt: parsed.lastBatchAt ?? getLatestSavedAt(sorted),
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
      entries: sortEntriesNewestFirst(history.entries).slice(0, MAX_RECIPE_HISTORY),
    })
  );
}

function sortEntriesNewestFirst(entries: StoredRecipe[]): StoredRecipe[] {
  return [...entries].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export function isFromLatestBatch(
  entry: StoredRecipe,
  lastBatchAt: string | null | undefined
): boolean {
  return Boolean(lastBatchAt && entry.savedAt === lastBatchAt);
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

  const merged = sortEntriesNewestFirst(Array.from(byName.values()));
  const trimmed = merged.slice(0, MAX_RECIPE_HISTORY);

  return {
    entries: trimmed,
    lastSource: meta.source,
    lastWarning: meta.warning ?? null,
    lastBatchAt: savedAt,
  };
}

export function clearRecipeHistory(scope: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(scope));
}

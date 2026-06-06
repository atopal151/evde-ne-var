export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash-lite";

const DEFAULT_FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
  "gemini-2.5-flash",
] as const;

/** Models to try in order when quota is hit on the preferred model. */
export function getGeminiModelCandidates(): string[] {
  const preferred = GEMINI_MODEL;
  return [...new Set([preferred, ...DEFAULT_FALLBACK_MODELS])];
}

/** Google issues both legacy AIza… keys and new AQ.… authentication keys. */
export function isValidGeminiKeyFormat(apiKey?: string): boolean {
  const key = apiKey?.trim();
  if (!key) return false;

  if (key.startsWith("AIza") && key.length >= 30) return true;
  if (key.startsWith("AQ.") && key.length >= 20) return true;

  return false;
}

export function normalizeGeminiKey(apiKey?: string): string {
  return apiKey?.trim() ?? "";
}

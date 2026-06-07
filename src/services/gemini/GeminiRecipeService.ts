import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  getGeminiModelCandidates,
  normalizeGeminiKey,
} from "@/lib/gemini/config";
import { isQuotaError } from "@/lib/gemini/validateApiKey";
import type { Locale } from "@/i18n/config";
import { buildRecipePrompt } from "@/lib/gemini/prompt";
import { recipeResponseSchema } from "@/lib/gemini/recipeSchema";
import type { InventoryItem } from "@/types/database";
import type { IRecipeService } from "@/services/interfaces/IRecipeService";
import type { RecipeResponse } from "@/types/recipes";

function parseRecipeResponse(text: string): RecipeResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini yanıtı geçersiz JSON");
  }

  const validated = recipeResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("Tarif formatı doğrulanamadı");
  }

  return validated.data;
}

export class GeminiRecipeService implements IRecipeService {
  async generate(
    inventory: InventoryItem[],
    locale: Locale = "tr"
  ): Promise<RecipeResponse> {
    const apiKey = normalizeGeminiKey(process.env.GEMINI_API_KEY);
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY tanımlı değil");
    }

    if (inventory.length === 0) {
      throw new Error("Stok boş — önce malzeme ekleyin");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = buildRecipePrompt(inventory, locale);
    const models = getGeminiModelCandidates();
    let lastQuotaError: Error | null = null;

    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const result = await model.generateContent(prompt);
        return parseRecipeResponse(result.response.text());
      } catch (error) {
        if (isQuotaError(error)) {
          lastQuotaError =
            error instanceof Error
              ? error
              : new Error("Gemini kotası dolmuş");
          continue;
        }
        throw error;
      }
    }

    throw (
      lastQuotaError ??
      new Error(
        "Tüm Gemini modellerinde ücretsiz kota dolmuş. Birkaç dakika bekleyip tekrar deneyin."
      )
    );
  }
}

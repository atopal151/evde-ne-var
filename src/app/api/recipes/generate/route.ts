import { NextResponse } from "next/server";
import { isValidGeminiKeyFormat, normalizeGeminiKey } from "@/lib/gemini/config";
import {
  isInvalidApiKeyError,
  isQuotaError,
} from "@/lib/gemini/validateApiKey";
import { generateRecipesRequestSchema } from "@/lib/gemini/recipeSchema";
import { GeminiRecipeService } from "@/services/gemini/GeminiRecipeService";
import { MockRecipeService } from "@/services/mock/MockRecipeService";
import type { InventoryItem } from "@/types/database";

const FORMAT_WARNING =
  "API key formatı tanınmıyor. Google AI Studio → Copy key ile kopyalayın (AIza… veya AQ.… formatı).";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = generateRecipesRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
    }

    const items = parsed.data.items as InventoryItem[];
    const mockService = new MockRecipeService();
    const apiKey = normalizeGeminiKey(process.env.GEMINI_API_KEY);

    if (apiKey && !isValidGeminiKeyFormat(apiKey)) {
      const fallback = await mockService.generate(items);
      return NextResponse.json({
        ...fallback,
        source: "mock" as const,
        warning: FORMAT_WARNING,
      });
    }

    if (apiKey) {
      try {
        const result = await new GeminiRecipeService().generate(items);
        return NextResponse.json({ ...result, source: "gemini" as const });
      } catch (error) {
        if (isInvalidApiKeyError(error) || isQuotaError(error)) {
          const fallback = await mockService.generate(items);
          const warning = isQuotaError(error)
            ? "Gemini ücretsiz kotası dolmuş. Birkaç dakika bekleyin — şimdilik demo tarifler gösteriliyor."
            : "Gemini API key geçersiz. Demo tarifler gösteriliyor.";
          return NextResponse.json({
            ...fallback,
            source: "mock" as const,
            warning,
          });
        }
        throw error;
      }
    }

    const result = await mockService.generate(items);
    return NextResponse.json({ ...result, source: "mock" as const });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tarifler oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

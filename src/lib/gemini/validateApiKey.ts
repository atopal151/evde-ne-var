import {
  getGeminiModelCandidates,
  normalizeGeminiKey,
} from "@/lib/gemini/config";

export type GeminiKeyStatus = "ok" | "missing" | "invalid" | "quota";

export interface GeminiKeyCheckResult {
  status: GeminiKeyStatus;
  message: string;
  model?: string;
}

function isInvalidKeyResponse(body: {
  error?: { message?: string; reason?: string; code?: number };
}): boolean {
  const message = body.error?.message ?? "";
  const reason = body.error?.reason ?? "";
  return (
    reason === "API_KEY_INVALID" ||
    message.includes("API key not valid") ||
    message.includes("API_KEY_INVALID")
  );
}

function isQuotaResponse(body: {
  error?: { message?: string; code?: number };
}): boolean {
  const message = body.error?.message ?? "";
  return (
    body.error?.code === 429 ||
    message.includes("quota") ||
    message.includes("Quota exceeded") ||
    message.includes("Too Many Requests")
  );
}

async function probeModel(
  apiKey: string,
  model: string
): Promise<{ ok: true } | { ok: false; quota: boolean; message: string }> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "OK" }] }],
      }),
    }
  );

  const body = (await response.json()) as {
    error?: { message?: string; reason?: string; code?: number };
  };

  if (isInvalidKeyResponse(body)) {
    return { ok: false, quota: false, message: "API key geçersiz" };
  }

  if (isQuotaResponse(body)) {
    return { ok: false, quota: true, message: body.error?.message ?? "Kota dolu" };
  }

  if (!response.ok) {
    return {
      ok: false,
      quota: false,
      message: body.error?.message ?? "Model yanıt vermedi",
    };
  }

  return { ok: true };
}

export async function validateGeminiApiKey(
  apiKey?: string
): Promise<GeminiKeyCheckResult> {
  const key = normalizeGeminiKey(apiKey);

  if (!key) {
    return {
      status: "missing",
      message:
        "GEMINI_API_KEY tanımlı değil. Google AI Studio → Copy key ile .env.local dosyasına ekleyin.",
    };
  }

  if (!key.startsWith("AIza") && !key.startsWith("AQ.")) {
    return {
      status: "invalid",
      message:
        "Key formatı tanınmıyor. Google AI Studio → Copy key ile kopyalayın.",
    };
  }

  try {
    let quotaHits = 0;

    for (const model of getGeminiModelCandidates()) {
      const result = await probeModel(key, model);

      if (result.ok) {
        return {
          status: "ok",
          model,
          message: `Gemini bağlantısı çalışıyor (${model}).`,
        };
      }

      if (result.quota) {
        quotaHits++;
        continue;
      }

      return {
        status: "invalid",
        message: result.message,
      };
    }

    if (quotaHits > 0) {
      return {
        status: "quota",
        message:
          "Ücretsiz kota geçici olarak dolmuş. Birkaç dakika bekleyin veya demo tarifler kullanın. Google AI Studio → Usage sayfasından limitinizi kontrol edebilirsiniz.",
      };
    }

    return {
      status: "invalid",
      message: "Gemini API yanıt vermedi.",
    };
  } catch {
    return {
      status: "invalid",
      message: "Gemini API'ye bağlanılamadı.",
    };
  }
}

export function isInvalidApiKeyError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("API_KEY_INVALID") ||
    message.includes("API key not valid")
  );
}

export function isQuotaError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("Quota exceeded") ||
    message.includes("Too Many Requests") ||
    message.includes("kota")
  );
}

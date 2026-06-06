"use client";

import { useCallback, useEffect, useState } from "react";
import type { GeminiKeyCheckResult, GeminiKeyStatus } from "@/lib/gemini/validateApiKey";

export function useGeminiStatus() {
  const [status, setStatus] = useState<GeminiKeyStatus | "loading">("loading");
  const [message, setMessage] = useState("");

  const check = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await fetch("/api/recipes/status");
      const data = (await response.json()) as GeminiKeyCheckResult;
      setStatus(data.status);
      setMessage(data.message);
    } catch {
      setStatus("invalid");
      setMessage("Bağlantı durumu kontrol edilemedi.");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return { status, message, check, isGeminiReady: status === "ok" };
}

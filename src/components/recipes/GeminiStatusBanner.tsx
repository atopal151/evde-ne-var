"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, AlertTriangle, KeyRound, Loader2 } from "lucide-react";
import type { GeminiKeyStatus } from "@/lib/gemini/validateApiKey";

interface GeminiStatusBannerProps {
  status: GeminiKeyStatus | "loading";
  message: string;
}

const styles: Record<
  GeminiKeyStatus | "loading",
  { bg: string; text: string; icon: typeof CheckCircle2 }
> = {
  loading: {
    bg: "bg-cream-200 border-cream-400",
    text: "text-navy-700",
    icon: Loader2,
  },
  ok: {
    bg: "bg-forest-50 border-forest-200",
    text: "text-forest-800",
    icon: CheckCircle2,
  },
  missing: {
    bg: "bg-cream-200 border-cream-400",
    text: "text-navy-700",
    icon: KeyRound,
  },
  invalid: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: AlertTriangle,
  },
  quota: {
    bg: "bg-orange-50 border-orange-200",
    text: "text-orange-800",
    icon: AlertTriangle,
  },
};

const statusTitleKeys: Record<GeminiKeyStatus | "loading", string> = {
  loading: "geminiLoading",
  ok: "geminiOk",
  missing: "geminiMissing",
  invalid: "geminiInvalid",
  quota: "geminiQuota",
};

export function GeminiStatusBanner({ status, message }: GeminiStatusBannerProps) {
  const t = useTranslations("recipes");
  const style = styles[status];
  const Icon = style.icon;

  return (
    <div
      className={[
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
        style.bg,
        style.text,
      ].join(" ")}
      role="status"
    >
      <Icon
        className={[
          "mt-0.5 h-4 w-4 shrink-0",
          status === "loading" ? "animate-spin" : "",
        ].join(" ")}
        aria-hidden
      />
      <div>
        <p className="font-semibold">{t(statusTitleKeys[status])}</p>
        <p className="mt-0.5 opacity-90">{message}</p>
      </div>
    </div>
  );
}

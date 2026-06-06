"use client";

import { Database } from "lucide-react";
import type { SupabaseSetupStatus } from "@/hooks/useSupabaseSetup";

interface SupabaseSetupBannerProps {
  status: SupabaseSetupStatus | null;
  loading: boolean;
}

export function SupabaseSetupBanner({ status, loading }: SupabaseSetupBannerProps) {
  if (loading || !status) return null;

  if (!status.mockMode && status.connected && status.homeExists) {
    return (
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-800">
        <Database className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-semibold">Supabase bağlı</p>
          <p className="mt-0.5 opacity-90">{status.message}</p>
        </div>
      </div>
    );
  }

  if (!status.mockMode && !status.connected) {
    return (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p className="font-semibold">Supabase bağlantı hatası</p>
        <p className="mt-1">{status.message}</p>
        {status.steps && (
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {status.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        )}
      </div>
    );
  }

  if (status.mockMode) {
    return (
      <div className="mb-4 rounded-xl border border-cream-400 bg-cream-200/60 px-4 py-3 text-sm text-navy-800">
        <p className="font-semibold">Veriler tarayıcıda (demo mod)</p>
        <p className="mt-1">{status.message}</p>
        {status.steps && status.steps.length > 0 && (
          <details className="mt-2" open>
            <summary className="cursor-pointer font-medium text-forest-800">
              Nasıl düzeltilir?
            </summary>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-navy-700">
              {status.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </details>
        )}
      </div>
    );
  }

  return null;
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

function getInitials(
  fullName: string | null | undefined,
  email: string | undefined
): string {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }

  const local = email?.split("@")[0] ?? "?";
  return local.slice(0, 2).toUpperCase();
}

function getDisplayName(
  fullName: string | null | undefined,
  email: string | undefined,
  fallback: string
): string {
  if (fullName?.trim()) return fullName.trim();
  return email?.split("@")[0] ?? fallback;
}

export function AuthHeaderActions() {
  const t = useTranslations("auth");
  const { user, profile, isMockMode, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  if (isMockMode || !user) return null;

  const displayName = getDisplayName(
    profile?.full_name,
    user.email,
    t("account")
  );
  const initials = getInitials(profile?.full_name, user.email);
  const email = user.email ?? "";

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div
      className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/15 bg-white/10 p-1 shadow-lg shadow-black/10 backdrop-blur-md"
      aria-label={t("sessionInfo")}
    >
      <div className="flex min-w-0 items-center gap-2.5 py-0.5 pl-1.5 pr-1 sm:pr-2">
        <div
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-plum-500 via-plum-600 to-forest-600 text-xs font-bold tracking-wide text-white shadow-inner shadow-black/10 ring-1 ring-white/25"
          aria-hidden
        >
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-forest-900 bg-forest-400" />
        </div>

        <div className="hidden min-w-0 max-w-[148px] sm:block">
          <p className="truncate text-sm font-semibold leading-tight text-white">
            {displayName}
          </p>
          <p className="truncate text-[11px] leading-tight text-cream-300/90">
            {email}
          </p>
        </div>
      </div>

      <div className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />

      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={signingOut}
        title={t("signOutTitle")}
        aria-label={t("signOut")}
        className="inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-xl px-2.5 text-cream-100 transition-all hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-60 sm:px-3"
      >
        {signingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span className="hidden text-xs font-medium md:inline">
          {signingOut ? t("signingOut") : t("signOut")}
        </span>
      </button>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/brand/Logo";
import { AuthHeaderActions } from "@/components/auth/AuthHeaderActions";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function Header({ title, subtitle, badge }: HeaderProps) {
  const t = useTranslations("brand");
  const resolvedTitle = title ?? t("appName");
  const resolvedSubtitle = subtitle ?? t("tagline");
  const isHome = !title;

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-navy-900 px-4 pb-10 pt-6 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-plum-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 top-8 h-40 w-40 rounded-full bg-forest-400/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-[100%] bg-cream-100/10 blur-2xl" />

      <div className="relative mx-auto flex max-w-2xl items-center gap-3">
        <LogoMark size={48} className="ring-1 ring-white/15" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1
              className={[
                "font-bold tracking-tight",
                isHome ? "text-lg sm:text-xl" : "text-xl sm:text-2xl",
              ].join(" ")}
            >
              {resolvedTitle}
            </h1>
            {badge && (
              <span className="rounded-full border border-white/10 bg-plum-600/70 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-cream-200/90">
            {resolvedSubtitle}
          </p>
        </div>

        <AuthHeaderActions />
      </div>

      <div className="absolute -bottom-px left-0 right-0">
        <svg
          viewBox="0 0 1440 48"
          fill="none"
          preserveAspectRatio="none"
          className="block h-6 w-full text-cream-100"
          aria-hidden
        >
          <path
            d="M0 48V24C240 0 480 0 720 24C960 48 1200 48 1440 24V48H0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </header>
  );
}

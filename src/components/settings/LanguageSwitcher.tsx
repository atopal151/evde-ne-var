"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { LocaleFlag } from "@/components/settings/LocaleFlag";
import { Card } from "@/components/ui/Card";
import { localeNativeNames, locales, type Locale } from "@/i18n/config";
import { localeCookieValue } from "@/lib/i18n/locale-cookie";

export function LanguageSwitcher() {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const router = useRouter();

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    document.cookie = localeCookieValue(nextLocale);
    router.refresh();
  };

  return (
    <Card padding="lg" className="mb-6 border-forest-100/80">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-navy-900">{t("language")}</h2>
          <p className="mt-0.5 text-sm text-navy-500">
            {t("languageDescription")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {locales.map((code) => {
          const active = locale === code;
          const label = localeNativeNames[code];
          return (
            <button
              key={code}
              type="button"
              onClick={() => handleChange(code)}
              aria-label={label}
              aria-pressed={active}
              className={[
                "flex items-center gap-3 rounded-2xl border px-3 py-3 text-start text-sm font-semibold transition-all",
                active
                  ? "border-forest-500 bg-forest-50 text-forest-900 shadow-sm shadow-forest-900/5"
                  : "border-cream-300 bg-white text-navy-700 hover:border-forest-200 hover:bg-cream-50",
              ].join(" ")}
            >
              <LocaleFlag
                locale={code}
                size={32}
                className={active ? "ring-forest-300" : ""}
              />
              <span className="min-w-0 leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

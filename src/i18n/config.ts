export const locales = ["tr", "en", "de", "ru", "zh", "ar", "fr", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";
export const localeCookieName = "NEXT_LOCALE";

export const rtlLocales: readonly Locale[] = ["ar"];

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

/** ISO 3166-1 alpha-2 codes — maps to /public/flags/{code}.svg */
export const localeCountryCodes: Record<Locale, string> = {
  tr: "tr",
  en: "us",
  de: "de",
  ru: "ru",
  zh: "cn",
  ar: "sa",
  fr: "fr",
  es: "es",
};

/** Native language names (shown in language picker) */
export const localeNativeNames: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  ru: "Русский",
  zh: "中文",
  ar: "العربية",
  fr: "Français",
  es: "Español",
};

export const openGraphLocales: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
  ru: "ru_RU",
  zh: "zh_CN",
  ar: "ar_SA",
  fr: "fr_FR",
  es: "es_ES",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

export function resolveLocaleFromAcceptLanguage(
  header: string | null | undefined
): Locale {
  if (!header) return defaultLocale;

  const languages = header
    .split(",")
    .map((part) => part.trim().split(";")[0]?.toLowerCase())
    .filter(Boolean);

  for (const lang of languages) {
    if (lang.startsWith("tr")) return "tr";
    if (lang.startsWith("en")) return "en";
    if (lang.startsWith("de")) return "de";
    if (lang.startsWith("ru")) return "ru";
    if (lang.startsWith("zh")) return "zh";
    if (lang.startsWith("ar")) return "ar";
    if (lang.startsWith("fr")) return "fr";
    if (lang.startsWith("es")) return "es";
  }

  return defaultLocale;
}

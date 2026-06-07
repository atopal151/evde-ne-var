import {
  defaultLocale,
  isLocale,
  localeCookieName,
  resolveLocaleFromAcceptLanguage,
  type Locale,
} from "@/i18n/config";

export function getLocaleFromCookie(
  cookieValue: string | undefined
): Locale | null {
  return isLocale(cookieValue) ? cookieValue : null;
}

export function resolveInitialLocale(
  cookieValue: string | undefined,
  acceptLanguage: string | null | undefined
): Locale {
  return (
    getLocaleFromCookie(cookieValue) ??
    resolveLocaleFromAcceptLanguage(acceptLanguage)
  );
}

export const localeCookieOptions = {
  name: localeCookieName,
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
  sameSite: "lax" as const,
};

export function localeCookieValue(locale: Locale = defaultLocale): string {
  return `${localeCookieOptions.name}=${locale};path=${localeCookieOptions.path};max-age=${localeCookieOptions.maxAge};samesite=${localeCookieOptions.sameSite}`;
}

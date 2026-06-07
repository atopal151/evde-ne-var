import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { localeCookieName } from "@/i18n/config";
import { resolveInitialLocale } from "@/lib/i18n/locale-cookie";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const locale = resolveInitialLocale(
    cookieStore.get(localeCookieName)?.value,
    headerStore.get("accept-language")
  );

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { AppProviders } from "@/components/providers/AppProviders";
import {
  isRtlLocale,
  openGraphLocales,
  type Locale,
} from "@/i18n/config";
import { APP_LOGO_PATH } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("brand");
  const appName = t("appName");

  return {
    title: {
      default: `${appName} | ${t("metaTitle")}`,
      template: `%s | ${appName}`,
    },
    description: t("description"),
    applicationName: appName,
    icons: {
      icon: [{ url: APP_LOGO_PATH, type: "image/png" }],
      apple: [{ url: APP_LOGO_PATH, type: "image/png" }],
    },
    openGraph: {
      title: appName,
      description: t("description"),
      type: "website",
      locale: openGraphLocales[(await getLocale()) as Locale] ?? "tr_TR",
    },
    manifest: "/manifest.json",
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1b4332",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as Locale;
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={isRtlLocale(locale) ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

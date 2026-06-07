"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function AuthTabs() {
  const pathname = usePathname();
  const t = useTranslations("auth");
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  const tabClass = (active: boolean) =>
    [
      "flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors",
      active
        ? "bg-white text-forest-800"
        : "text-navy-600 hover:text-navy-900",
    ].join(" ");

  return (
    <div className="mb-6 rounded-xl bg-cream-200 p-1">
      <div className="flex">
        <Link href="/login" className={tabClass(isLogin)}>
          {t("loginTab")}
        </Link>
        <Link href="/register" className={tabClass(isRegister)}>
          {t("registerTab")}
        </Link>
      </div>
    </div>
  );
}

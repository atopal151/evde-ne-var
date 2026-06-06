"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthTabs() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  const tabClass = (active: boolean) =>
    [
      "flex-1 rounded-lg py-2.5 text-center text-sm font-semibold transition-colors",
      active
        ? "bg-white text-forest-800 shadow-sm"
        : "text-navy-600 hover:text-navy-900",
    ].join(" ");

  return (
    <div className="mb-6 rounded-xl bg-cream-200 p-1">
      <div className="flex">
        <Link href="/login" className={tabClass(isLogin)}>
          Giriş Yap
        </Link>
        <Link href="/register" className={tabClass(isRegister)}>
          Kayıt Ol
        </Link>
      </div>
    </div>
  );
}

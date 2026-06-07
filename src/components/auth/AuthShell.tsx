"use client";

import { useTranslations } from "next-intl";
import { Logo } from "@/components/brand/Logo";
import { AuthShowcase } from "@/components/auth/AuthShowcase";
import { AuthTabs } from "@/components/auth/AuthTabs";
import { ChefHat, Package, ShoppingCart } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const t = useTranslations("nav");

  const mobileFeatures = [
    { icon: Package, label: t("stock") },
    { icon: ChefHat, label: t("recipesShort") },
    { icon: ShoppingCart, label: t("list") },
  ];

  return (
    <div className="min-h-full lg:grid lg:grid-cols-2">
      <AuthShowcase />

      <div className="flex flex-col justify-center bg-cream-100 px-6 py-10 sm:px-10 lg:relative lg:px-14 lg:py-12">
        <div className="pointer-events-none absolute inset-0 lg:left-1/2">
          <div className="absolute right-10 top-20 h-40 w-40 rounded-full bg-plum-200/20 blur-3xl" />
          <div className="absolute bottom-32 left-10 h-48 w-48 rounded-full bg-forest-200/20 blur-3xl" />
        </div>

        <div className="relative mb-8 lg:hidden">
          <Logo variant="dark" markSize={44} />
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
            <p className="mt-1 text-sm text-navy-500">{subtitle}</p>
          </div>

          <AuthTabs />

          <div className="mb-6 flex flex-wrap gap-2 lg:hidden">
            {mobileFeatures.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-navy-700 shadow-sm"
              >
                <Icon className="h-3.5 w-3.5 text-forest-700" />
                {label}
              </span>
            ))}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

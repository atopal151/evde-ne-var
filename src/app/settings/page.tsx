"use client";

import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout/AppShell";
import { FamilySharingCard } from "@/components/family/FamilySharingCard";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";

export default function SettingsPage() {
  const t = useTranslations("settings");

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <LanguageSwitcher />
      <FamilySharingCard />
    </AppShell>
  );
}

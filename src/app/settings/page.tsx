"use client";

import { AppShell } from "@/components/layout/AppShell";
import { FamilySharingCard } from "@/components/family/FamilySharingCard";

export default function SettingsPage() {
  return (
    <AppShell
      title="Ayarlar"
      subtitle="Aile mutfağı ve hesap tercihleri"
    >
      <FamilySharingCard />
    </AppShell>
  );
}

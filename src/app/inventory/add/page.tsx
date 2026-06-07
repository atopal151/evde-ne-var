"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AppShell } from "@/components/layout/AppShell";
import { ScanIllustration } from "@/components/illustrations/KitchenIllustrations";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import { Card } from "@/components/ui/Card";
import { useInventory } from "@/hooks/useInventory";

export default function AddInventoryPage() {
  const router = useRouter();
  const t = useTranslations("inventory");
  const { addItem } = useInventory();

  return (
    <AppShell title={t("addTitle")} subtitle={t("addSubtitle")}>
      <div className="mb-6 overflow-hidden rounded-3xl border border-forest-200/40 bg-gradient-to-br from-forest-50 via-white to-plum-50/30 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <ScanIllustration className="h-24 w-24 shrink-0" />
          <div>
            <h2 className="text-lg font-bold text-navy-900">
              {t("quickAddTitle")}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-navy-500">
              {t("quickAddDescription")}
            </p>
          </div>
        </div>
      </div>

      <Card padding="lg" className="border-forest-100/60">
        <InventoryForm
          onSubmit={async (input) => {
            await addItem(input);
            router.push("/");
          }}
        />
      </Card>
    </AppShell>
  );
}

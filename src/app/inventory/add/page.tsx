"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import { Card } from "@/components/ui/Card";
import { useInventory } from "@/hooks/useInventory";

export default function AddInventoryPage() {
  const router = useRouter();
  const { addItem } = useInventory();

  return (
    <AppShell
      title="Malzeme Ekle"
      subtitle="El ile veya barkod ile giriş"
      hideHeader={false}
    >
      <Card padding="lg">
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

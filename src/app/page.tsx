"use client";

import { useRouter } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { InventoryList } from "@/components/inventory/InventoryList";
import { Button } from "@/components/ui/Button";
import { useInventory } from "@/hooks/useInventory";

export default function HomePage() {
  const router = useRouter();
  const { items, loading, error, refresh, removeItem, isMockMode } =
    useInventory();

  return (
    <AppShell
      subtitle="Buzdolabı ve mutfak stoklarınız"
      badge={isMockMode ? "Demo" : undefined}
    >
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Stoklarım</h2>
          <p className="text-sm text-navy-500">
            {loading ? "Yükleniyor..." : `${items.length} ürün`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            aria-label="Yenile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => router.push("/inventory/add")}>
            <Plus className="h-4 w-4" />
            Ekle
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-cream-300"
            />
          ))}
        </div>
      ) : (
        <InventoryList
          items={items}
          onDelete={(id) => void removeItem(id)}
        />
      )}
    </AppShell>
  );
}

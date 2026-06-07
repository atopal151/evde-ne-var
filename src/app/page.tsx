"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AlertTriangle, Package, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { InventoryList } from "@/components/inventory/InventoryList";
import { Button } from "@/components/ui/Button";
import { PageSection } from "@/components/ui/PageSection";
import { StatCard } from "@/components/ui/StatCard";
import { useInventory } from "@/hooks/useInventory";
import { getExpirationInfo } from "@/lib/utils/expiration";

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, isMockMode } = useAuth();
  const { items, loading, error, refresh, removeItem, authLoading: inventoryAuthLoading } =
    useInventory();

  useEffect(() => {
    if (!isMockMode && !authLoading && !user) {
      router.replace("/login");
    }
  }, [isMockMode, authLoading, user, router]);

  const urgentCount = useMemo(
    () =>
      items.filter((i) => {
        const s = getExpirationInfo(i.expiration_date).status;
        return s === "expired" || s === "critical" || s === "warning";
      }).length,
    [items]
  );

  const isLoading = loading || authLoading || inventoryAuthLoading;

  return (
    <AppShell subtitle="Stoklarınız ve tarif önerileriniz">

      {!isLoading && items.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <StatCard
            label="Toplam ürün"
            value={items.length}
            icon={Package}
            tone="forest"
          />
          <StatCard
            label="SKT uyarısı"
            value={urgentCount}
            icon={AlertTriangle}
            tone={urgentCount > 0 ? "orange" : "plum"}
          />
        </div>
      )}

      <PageSection
        title="Stoklarım"
        subtitle={
          isLoading ? "Yükleniyor..." : `${items.length} ürün takip ediliyor`
        }
        actions={
          <>
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
          </>
        }
      />

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl skeleton-shimmer"
            />
          ))}
        </div>
      ) : (
        <InventoryList
          items={items}
          onDelete={(id) => void removeItem(id)}
          emptyAction={
            <Button onClick={() => router.push("/inventory/add")}>
              <Plus className="h-4 w-4" />
              İlk ürünü ekle
            </Button>
          }
        />
      )}
    </AppShell>
  );
}

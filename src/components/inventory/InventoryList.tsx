"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import {
  getExpirationInfo,
  sortByExpirationPriority,
} from "@/lib/utils/expiration";
import type { InventoryItem, ProductCategory } from "@/types/database";

interface InventoryListProps {
  items: InventoryItem[];
  onDelete?: (id: string) => void;
}

export function InventoryList({ items, onDelete }: InventoryListProps) {
  const sorted = useMemo(() => sortByExpirationPriority(items), [items]);

  const grouped = useMemo(() => {
    const map = new Map<ProductCategory, InventoryItem[]>();
    for (const item of sorted) {
      const list = map.get(item.category) ?? [];
      list.push(item);
      map.set(item.category, list);
    }
    return map;
  }, [sorted]);

  const urgentCount = useMemo(
    () =>
      items.filter((i) => {
        const s = getExpirationInfo(i.expiration_date).status;
        return s === "expired" || s === "critical" || s === "warning";
      }).length,
    [items]
  );

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-cream-400 bg-cream-100/50 p-10 text-center">
        <p className="text-lg font-medium text-navy-700">Stok boş</p>
        <p className="mt-1 text-sm text-navy-500">
          İlk malzemenizi ekleyerek başlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {urgentCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <p className="font-semibold text-orange-900">
              {urgentCount} ürünün SKT&apos;si yaklaşıyor
            </p>
            <p className="text-sm text-orange-700">
              Kritik ürünler listenin en üstünde gösteriliyor.
            </p>
          </div>
        </div>
      )}

      {Array.from(grouped.entries()).map(([category, categoryItems]) => (
        <section key={category}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-plum-700">
            {category}
          </h2>
          <ul className="space-y-3">
            {categoryItems.map((item) => (
              <li key={item.id}>
                <InventoryCard item={item} onDelete={onDelete} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

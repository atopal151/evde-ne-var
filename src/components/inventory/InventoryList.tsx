"use client";

import { useMemo, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { FridgeIllustration } from "@/components/illustrations/KitchenIllustrations";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategoryLabel } from "@/lib/i18n/category";
import {
  getExpirationInfo,
  sortByExpirationPriority,
} from "@/lib/utils/expiration";
import type { InventoryItem, ProductCategory } from "@/types/database";

interface InventoryListProps {
  items: InventoryItem[];
  onDelete?: (id: string) => void;
  emptyAction?: ReactNode;
}

export function InventoryList({ items, onDelete, emptyAction }: InventoryListProps) {
  const locale = useLocale();
  const t = useTranslations("inventory");
  const tCategories = useTranslations("categories");

  const sorted = useMemo(
    () => sortByExpirationPriority(items, locale),
    [items, locale]
  );

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
      <EmptyState
        illustration={<FridgeIllustration className="h-36 w-36" />}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-6">
      {urgentCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200/80 bg-gradient-to-r from-orange-50 to-amber-50/80 p-4 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-orange-900">
              {t("urgentTitle", { count: urgentCount })}
            </p>
            <p className="text-sm text-orange-700/90">{t("urgentDescription")}</p>
          </div>
        </div>
      )}

      {Array.from(grouped.entries()).map(([category, categoryItems]) => (
        <section key={category}>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-plum-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-plum-700">
              {getCategoryLabel(category, tCategories)}
            </h2>
            <span className="rounded-full bg-plum-100 px-2 py-0.5 text-xs font-medium text-plum-700">
              {categoryItems.length}
            </span>
          </div>
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

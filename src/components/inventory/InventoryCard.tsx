import { Trash2 } from "lucide-react";
import { ExpirationBadge } from "@/components/inventory/ExpirationBadge";
import { getCategoryVisual } from "@/lib/constants/categoryVisuals";
import type { InventoryItem } from "@/types/database";

interface InventoryCardProps {
  item: InventoryItem;
  onDelete?: (id: string) => void;
}

export function InventoryCard({ item, onDelete }: InventoryCardProps) {
  const visual = getCategoryVisual(item.category);

  return (
    <article className="group flex items-start gap-3 rounded-2xl border border-cream-300/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-forest-200/60 hover:shadow-lg hover:shadow-forest-900/5">
      <div
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg shadow-inner shadow-black/5",
          visual.gradient,
        ].join(" ")}
        aria-hidden
      >
        <span className="drop-shadow-sm">{visual.emoji}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-navy-900">{item.product_name}</h3>
            <span
              className={[
                "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                visual.accent,
              ].join(" ")}
            >
              {item.category}
            </span>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="shrink-0 rounded-xl p-2 text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600 active:bg-red-100 active:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
              aria-label={`${item.product_name} sil`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-coffee-100/80 px-2.5 py-1 text-sm font-semibold text-coffee-700">
            {item.quantity} {item.unit}
          </span>
          <ExpirationBadge expirationDate={item.expiration_date} />
        </div>

        {item.barcode && (
          <p className="mt-2 font-mono text-xs text-navy-400">
            Barkod: {item.barcode}
          </p>
        )}
      </div>
    </article>
  );
}

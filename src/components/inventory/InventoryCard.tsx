import { Package, Trash2 } from "lucide-react";
import { ExpirationBadge } from "@/components/inventory/ExpirationBadge";
import type { InventoryItem } from "@/types/database";

interface InventoryCardProps {
  item: InventoryItem;
  onDelete?: (id: string) => void;
}

export function InventoryCard({ item, onDelete }: InventoryCardProps) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-cream-300 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-plum-100 text-plum-700">
        <Package className="h-5 w-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-navy-900">{item.product_name}</h3>
            <p className="text-sm text-navy-500">{item.category}</p>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={`${item.product_name} sil`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-coffee-700">
            {item.quantity} {item.unit}
          </span>
          <ExpirationBadge expirationDate={item.expiration_date} />
        </div>

        {item.barcode && (
          <p className="mt-1 font-mono text-xs text-navy-400">
            Barkod: {item.barcode}
          </p>
        )}
      </div>
    </article>
  );
}

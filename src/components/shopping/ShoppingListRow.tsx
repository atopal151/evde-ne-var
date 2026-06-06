import { Check, Trash2 } from "lucide-react";
import type { ShoppingListItem } from "@/types/database";

interface ShoppingListRowProps {
  item: ShoppingListItem;
  onToggle: (id: string, completed: boolean) => void;
  onRemove: (id: string) => void;
}

export function ShoppingListRow({
  item,
  onToggle,
  onRemove,
}: ShoppingListRowProps) {
  return (
    <li
      className={[
        "group flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200",
        item.is_completed
          ? "border-cream-300/60 bg-cream-100/60 opacity-75"
          : "border-cream-300/80 bg-white shadow-sm hover:-translate-y-0.5 hover:border-forest-200/50 hover:shadow-md",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => onToggle(item.id, !item.is_completed)}
        className={[
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          item.is_completed
            ? "border-forest-600 bg-gradient-to-b from-forest-500 to-forest-700 text-white shadow-sm"
            : "border-cream-400 bg-white hover:border-forest-500 hover:bg-forest-50",
        ].join(" ")}
        aria-label={
          item.is_completed
            ? `${item.product_name} — alınmadı olarak işaretle`
            : `${item.product_name} — alındı olarak işaretle`
        }
      >
        {item.is_completed && <Check className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={[
            "font-medium text-navy-900",
            item.is_completed ? "text-navy-400 line-through" : "",
          ].join(" ")}
        >
          {item.product_name}
        </p>
        <p className="text-sm text-navy-500">
          {item.quantity} {item.unit}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="rounded-xl p-2 text-navy-400 opacity-0 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        aria-label={`${item.product_name} sil`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

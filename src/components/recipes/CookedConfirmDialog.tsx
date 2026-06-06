"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  hasInsufficientStock,
  hasUnmatchedIngredients,
} from "@/lib/recipes/matchIngredients";
import type { IngredientDeduction } from "@/types/recipes";

interface CookedConfirmDialogProps {
  recipeName: string;
  deductions: IngredientDeduction[];
  submitting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function CookedConfirmDialog({
  recipeName,
  deductions,
  submitting,
  onConfirm,
  onClose,
}: CookedConfirmDialogProps) {
  const unmatched = hasUnmatchedIngredients(deductions);
  const insufficient = hasInsufficientStock(deductions);
  const canConfirm = !unmatched && !insufficient;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cooked-dialog-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-cream-300 px-5 py-4">
          <div>
            <h2 id="cooked-dialog-title" className="text-lg font-bold text-navy-900">
              Stoktan düşülsün mü?
            </h2>
            <p className="mt-0.5 text-sm text-navy-500">{recipeName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-navy-400 hover:bg-cream-200"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <ul className="space-y-2 text-sm">
            {deductions.map((d) => (
              <li
                key={d.product_name}
                className={[
                  "flex justify-between rounded-xl px-3 py-2",
                  !d.matched
                    ? "bg-red-50 text-red-800"
                    : d.amount > d.currentQuantity
                      ? "bg-orange-50 text-orange-800"
                      : "bg-cream-100 text-navy-800",
                ].join(" ")}
              >
                <span>{d.product_name}</span>
                <span className="font-medium">
                  −{d.amount} {d.unit}
                  {d.matched && (
                    <span className="ml-1 text-xs opacity-70">
                      (stok: {d.currentQuantity})
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>

          {unmatched && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Bazı malzemeler stokta bulunamadı. Stok adlarını kontrol edin.
            </div>
          )}

          {insufficient && !unmatched && (
            <div className="flex items-start gap-2 rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              Bazı malzemeler için stok yetersiz.
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-cream-300 px-5 py-4">
          <Button variant="ghost" fullWidth onClick={onClose} disabled={submitting}>
            Vazgeç
          </Button>
          <Button
            fullWidth
            onClick={onConfirm}
            disabled={!canConfirm || submitting}
          >
            {submitting ? "Düşülüyor..." : "Onayla"}
          </Button>
        </div>
      </div>
    </div>
  );
}

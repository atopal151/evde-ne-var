"use client";

import { useTranslations } from "next-intl";
import { RefreshCw, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ShoppingIllustration } from "@/components/illustrations/KitchenIllustrations";
import { AddShoppingItemForm } from "@/components/shopping/AddShoppingItemForm";
import { ShoppingListRow } from "@/components/shopping/ShoppingListRow";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageSection } from "@/components/ui/PageSection";
import { useShoppingList } from "@/hooks/useShoppingList";

export default function ShoppingPage() {
  const t = useTranslations("shopping");
  const tCommon = useTranslations("common");
  const {
    pending,
    completed,
    loading,
    error,
    refresh,
    addItem,
    toggleComplete,
    removeItem,
    clearCompleted,
  } = useShoppingList();

  return (
    <AppShell title={t("title")} subtitle={t("subtitle")}>
      <PageSection
        title={t("myList")}
        subtitle={
          loading
            ? tCommon("loading")
            : t("summary", {
                pending: pending.length,
                completed: completed.length,
              })
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            aria-label={tCommon("refresh")}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card padding="lg" className="mb-6 border-forest-100/80">
        <AddShoppingItemForm
          onSubmit={async (input) => {
            await addItem(input);
          }}
        />
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : pending.length === 0 && completed.length === 0 ? (
        <EmptyState
          illustration={<ShoppingIllustration className="h-36 w-36" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest-700">
                  {t("pending")}
                </h3>
                <span className="rounded-full bg-forest-100 px-2 py-0.5 text-xs font-medium text-forest-700">
                  {pending.length}
                </span>
              </div>
              <ul className="space-y-2">
                {pending.map((item) => (
                  <ShoppingListRow
                    key={item.id}
                    item={item}
                    onToggle={(id, done) => void toggleComplete(id, done)}
                    onRemove={(id) => void removeItem(id)}
                  />
                ))}
              </ul>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-navy-300" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-navy-400">
                    {t("completed")}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void clearCompleted()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {tCommon("clear")}
                </Button>
              </div>
              <ul className="space-y-2">
                {completed.map((item) => (
                  <ShoppingListRow
                    key={item.id}
                    item={item}
                    onToggle={(id, done) => void toggleComplete(id, done)}
                    onRemove={(id) => void removeItem(id)}
                  />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </AppShell>
  );
}

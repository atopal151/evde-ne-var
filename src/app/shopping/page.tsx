"use client";

import { RefreshCw, Trash2, Wifi } from "lucide-react";
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
    isMockMode,
    isRealtime,
  } = useShoppingList();

  return (
    <AppShell
      title="Alışveriş Listesi"
      subtitle="Eksik malzemeleri takip edin"
      badge={isMockMode ? "Demo" : isRealtime ? "Canlı" : undefined}
    >
      <PageSection
        title="Listem"
        subtitle={
          loading
            ? "Yükleniyor..."
            : `${pending.length} alınacak · ${completed.length} tamamlandı`
        }
        actions={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void refresh()}
            aria-label="Yenile"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {isRealtime && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-forest-200/60 bg-gradient-to-r from-forest-50 to-emerald-50/50 px-4 py-3 text-sm text-forest-800 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-100">
            <Wifi className="h-4 w-4 text-forest-700" />
          </div>
          <p>
            Supabase Realtime — diğer cihazlardan yapılan değişiklikler otomatik
            yansır.
          </p>
        </div>
      )}

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
          title="Alışveriş listeniz boş"
          description="Tariflerdeki eksik malzemeleri veya ihtiyaçlarınızı ekleyin. Markete giderken yanınızda taşıyın."
        />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-forest-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-forest-700">
                  Alınacaklar
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
                    Tamamlananlar
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void clearCompleted()}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Temizle
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

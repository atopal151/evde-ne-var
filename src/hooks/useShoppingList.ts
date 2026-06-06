"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useResolvedHomeId } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  createShoppingListService,
  shouldUseMockData,
} from "@/services";
import type { CreateShoppingItemInput } from "@/services/interfaces/IShoppingListService";
import type { ShoppingListItem } from "@/types/database";

export function useShoppingList() {
  const { homeId, ready, authLoading } = useResolvedHomeId();
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const isMockMode = shouldUseMockData();

  const service = useMemo(
    () => createShoppingListService(supabase ?? undefined),
    [supabase]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listByHome(homeId);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Liste yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [homeId, service]);

  useEffect(() => {
    if (authLoading) return;
    if (ready) {
      void refresh();
    } else {
      setLoading(false);
      setError("Mutfak evi hazırlanamadı. Lütfen sayfayı yenileyin.");
    }
  }, [refresh, ready, authLoading]);

  useEffect(() => {
    if (!ready || isMockMode || !supabase) return;

    const channel = supabase
      .channel(`shopping_list:${homeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_list",
          filter: `home_id=eq.${homeId}`,
        },
        () => {
          void refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [homeId, isMockMode, supabase, refresh, ready]);

  const addItem = useCallback(
    async (input: CreateShoppingItemInput) => {
      const created = await service.add(homeId, input);
      if (isMockMode) {
        setItems((prev) => [created, ...prev]);
      }
      return created;
    },
    [homeId, service, isMockMode]
  );

  const toggleComplete = useCallback(
    async (id: string, isCompleted: boolean) => {
      const updated = await service.toggleComplete(id, isCompleted);
      if (isMockMode) {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? updated : i))
        );
      }
      return updated;
    },
    [service, isMockMode]
  );

  const removeItem = useCallback(
    async (id: string) => {
      await service.remove(id);
      if (isMockMode) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    },
    [service, isMockMode]
  );

  const clearCompleted = useCallback(async () => {
    const completed = items.filter((i) => i.is_completed);
    for (const item of completed) {
      await service.remove(item.id);
    }
    if (isMockMode) {
      setItems((prev) => prev.filter((i) => !i.is_completed));
    } else {
      await refresh();
    }
  }, [items, service, isMockMode, refresh]);

  const pending = items.filter((i) => !i.is_completed);
  const completed = items.filter((i) => i.is_completed);

  return {
    items,
    pending,
    completed,
    loading,
    error,
    refresh,
    addItem,
    toggleComplete,
    removeItem,
    clearCompleted,
    homeId,
    isMockMode,
    isRealtime: !isMockMode && Boolean(supabase),
    authReady: ready,
    authLoading,
  };
}

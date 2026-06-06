"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useResolvedHomeId } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  createInventoryService,
  shouldUseMockData,
} from "@/services";
import type { IInventoryService } from "@/services/interfaces/IInventoryService";
import type {
  CreateInventoryInput,
  InventoryItem,
} from "@/types/database";

export function useInventory() {
  const { homeId, ready, authLoading } = useResolvedHomeId();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service: IInventoryService = useMemo(() => {
    const supabase = createClient();
    return createInventoryService(supabase ?? undefined);
  }, []);

  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listByHome(homeId);
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stok yüklenemedi");
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
      setError(
        "Mutfak evi hazırlanamadı. Supabase'de 004 ve 005 SQL dosyalarını çalıştırın, sonra sayfayı yenileyin."
      );
    }
  }, [refresh, ready, authLoading]);

  useEffect(() => {
    if (!ready || shouldUseMockData() || !supabase) return;

    const channel = supabase
      .channel(`inventory:${homeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inventory",
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
  }, [homeId, supabase, refresh, ready]);

  const addItem = useCallback(
    async (input: CreateInventoryInput) => {
      const created = await service.create(homeId, input);
      setItems((prev) => [...prev, created]);
      return created;
    },
    [homeId, service]
  );

  const removeItem = useCallback(
    async (id: string) => {
      await service.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    },
    [service]
  );

  const deductQuantity = useCallback(
    async (id: string, amount: number) => {
      const updated = await service.deductQuantity(id, amount);
      setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
      return updated;
    },
    [service]
  );

  const deductIngredients = useCallback(
    async (deductions: { inventoryId: string; amount: number }[]) => {
      for (const { inventoryId, amount } of deductions) {
        if (inventoryId && amount > 0) {
          await service.deductQuantity(inventoryId, amount);
        }
      }
      await refresh();
    },
    [service, refresh]
  );

  return {
    items,
    loading,
    error,
    refresh,
    addItem,
    removeItem,
    deductQuantity,
    deductIngredients,
    homeId,
    isMockMode: shouldUseMockData(),
    authReady: ready,
    authLoading,
  };
}

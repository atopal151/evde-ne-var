"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createInventoryService,
  getHomeId,
  shouldUseMockData,
} from "@/services";
import type { IInventoryService } from "@/services/interfaces/IInventoryService";
import type {
  CreateInventoryInput,
  InventoryItem,
} from "@/types/database";

export function useInventory() {
  const homeId = getHomeId();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const service: IInventoryService = useMemo(() => {
    const supabase = createClient();
    return createInventoryService(supabase ?? undefined);
  }, []);

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
    void refresh();
  }, [refresh]);

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

  return {
    items,
    loading,
    error,
    refresh,
    addItem,
    removeItem,
    homeId,
    isMockMode: shouldUseMockData(),
  };
}

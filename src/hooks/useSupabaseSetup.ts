"use client";

import { useCallback, useEffect, useState } from "react";

export interface SupabaseSetupStatus {
  configured: boolean;
  connected: boolean;
  mockMode: boolean;
  homeId: string;
  homeExists: boolean;
  tablesOk: boolean;
  message: string;
  steps?: string[];
}

export function useSupabaseSetup() {
  const [status, setStatus] = useState<SupabaseSetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/setup/supabase");
      setStatus((await res.json()) as SupabaseSetupStatus);
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return { status, loading, check };
}

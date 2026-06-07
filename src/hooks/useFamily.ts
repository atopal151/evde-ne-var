"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth, useResolvedHomeId } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { createFamilyService, shouldUseMockData } from "@/services";
import type { HomeInvitation, HomeMember } from "@/types/family";

export function useFamily() {
  const { user, refreshProfile } = useAuth();
  const { ready, authLoading } = useResolvedHomeId();
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [invitations, setInvitations] = useState<HomeInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const isMockMode = shouldUseMockData();

  const service = useMemo(
    () => createFamilyService(supabase ?? undefined, user?.email),
    [supabase, user?.email]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [memberList, inviteList] = await Promise.all([
        service.listMembers(),
        service.listPendingInvitations(),
      ]);
      setMembers(memberList);
      setInvitations(inviteList);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Aile bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    if (authLoading) return;
    if (ready || isMockMode) {
      void refresh();
    } else {
      setLoading(false);
    }
  }, [refresh, ready, authLoading, isMockMode]);

  useEffect(() => {
    if (!ready || isMockMode || !supabase) return;

    const channel = supabase
      .channel(`home_invitations:${user?.id ?? "anon"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "home_invitations" },
        () => {
          void refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isMockMode, ready, supabase, refresh, user?.id]);

  const invite = useCallback(
    async (email: string) => {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await service.inviteByEmail(email);
        setSuccess("Davet gönderildi. Karşı taraf onaylayınca listeyi birlikte görürsünüz.");
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Davet gönderilemedi");
      } finally {
        setActionLoading(false);
      }
    },
    [service, refresh]
  );

  const respond = useCallback(
    async (invitationId: string, accept: boolean) => {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await service.respondToInvitation(invitationId, accept);
        if (accept) {
          await refreshProfile();
          setSuccess("Daveti kabul ettiniz. Artık ortak alışveriş listesini görüyorsunuz.");
        } else {
          setSuccess("Davet reddedildi.");
        }
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "İşlem tamamlanamadı");
      } finally {
        setActionLoading(false);
      }
    },
    [service, refresh, refreshProfile]
  );

  const cancel = useCallback(
    async (invitationId: string) => {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await service.cancelInvitation(invitationId);
        setSuccess("Davet iptal edildi.");
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Davet iptal edilemedi");
      } finally {
        setActionLoading(false);
      }
    },
    [service, refresh]
  );

  const incoming = invitations.filter((i) => i.direction === "incoming");
  const outgoing = invitations.filter((i) => i.direction === "outgoing");

  return {
    members,
    invitations,
    incoming,
    outgoing,
    loading,
    actionLoading,
    error,
    success,
    invite,
    respond,
    cancel,
    refresh,
    isMockMode,
    isAvailable: ready || isMockMode,
    authLoading,
  };
}

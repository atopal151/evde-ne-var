"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth, useResolvedHomeId } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { createFamilyService, shouldUseMockData } from "@/services";
import type { HomeInvitation, HomeMember } from "@/types/family";

interface FamilyContextValue {
  members: HomeMember[];
  invitations: HomeInvitation[];
  incoming: HomeInvitation[];
  outgoing: HomeInvitation[];
  loading: boolean;
  invitationsLoading: boolean;
  actionLoading: boolean;
  error: string | null;
  invitationsError: string | null;
  success: string | null;
  invite: (email: string) => Promise<void>;
  respond: (invitationId: string, accept: boolean) => Promise<void>;
  cancel: (invitationId: string) => Promise<void>;
  refresh: () => Promise<void>;
  isMockMode: boolean;
  isAvailable: boolean;
  authLoading: boolean;
}

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const { user, refreshProfile } = useAuth();
  const { ready, authLoading } = useResolvedHomeId();
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [invitations, setInvitations] = useState<HomeInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const isMockMode = shouldUseMockData();

  const service = useMemo(
    () => createFamilyService(supabase ?? undefined, user?.email),
    [supabase, user?.email]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setInvitationsLoading(true);
    setError(null);
    setInvitationsError(null);

    const membersPromise = service
      .listMembers()
      .then((memberList) => {
        setMembers(memberList);
        setLoading(false);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Üyeler yüklenemedi");
        setLoading(false);
      });

    const invitationsPromise = service
      .listPendingInvitations()
      .then((inviteList) => {
        setInvitations(inviteList);
        setInvitationsLoading(false);
      })
      .catch((e) => {
        const message = e instanceof Error ? e.message : "Davetler yüklenemedi";
        setInvitationsError(
          message.includes("get_home_invitations") ||
            message.includes("does not exist")
            ? "Aile daveti sistemi kurulmamış. Supabase'de 006 ve 008 SQL dosyalarını çalıştırın."
            : message
        );
        setInvitationsLoading(false);
      });

    await Promise.all([membersPromise, invitationsPromise]);
  }, [service]);

  useEffect(() => {
    if (authLoading) return;
    if (ready || isMockMode) {
      void refresh();
    } else {
      setLoading(false);
      setInvitationsLoading(false);
    }
  }, [refresh, ready, authLoading, isMockMode]);

  useEffect(() => {
    if (!ready || isMockMode || !supabase || !user?.id) return;

    const channel = supabase.channel(`home_invitations:${user.id}`);
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "home_invitations" },
      () => {
        void refresh();
      }
    );
    channel.subscribe();

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
        setSuccess(
          "Davet gönderildi. Karşı taraf onaylayınca listeyi birlikte görürsünüz."
        );
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
          setSuccess(
            "Daveti kabul ettiniz. Artık ortak alışveriş listesini görüyorsunuz."
          );
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

  const value: FamilyContextValue = {
    members,
    invitations,
    incoming,
    outgoing,
    loading,
    invitationsLoading,
    actionLoading,
    error,
    invitationsError,
    success,
    invite,
    respond,
    cancel,
    refresh,
    isMockMode,
    isAvailable: ready || isMockMode,
    authLoading,
  };

  return (
    <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) {
    throw new Error("useFamily FamilyProvider içinde kullanılmalı");
  }
  return ctx;
}

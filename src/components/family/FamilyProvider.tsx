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
import { useTranslations } from "next-intl";
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
  const t = useTranslations("family");
  const tErrors = useTranslations("family.errors");
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
        setError(
          e instanceof Error ? e.message : tErrors("membersLoadFailed")
        );
        setLoading(false);
      });

    const invitationsPromise = service
      .listPendingInvitations()
      .then((inviteList) => {
        setInvitations(inviteList);
        setInvitationsLoading(false);
      })
      .catch((e) => {
        const message =
          e instanceof Error ? e.message : tErrors("invitesLoadFailed");
        setInvitationsError(
          message.includes("get_home_invitations") ||
            message.includes("does not exist")
            ? tErrors("migrationRequired")
            : message
        );
        setInvitationsLoading(false);
      });

    await Promise.all([membersPromise, invitationsPromise]);
  }, [service, tErrors]);

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
        setSuccess(t("inviteSent"));
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : tErrors("inviteFailed"));
      } finally {
        setActionLoading(false);
      }
    },
    [service, refresh, t, tErrors]
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
          setSuccess(t("inviteAccepted"));
        } else {
          setSuccess(t("inviteRejected"));
        }
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : tErrors("actionFailed"));
      } finally {
        setActionLoading(false);
      }
    },
    [service, refresh, refreshProfile, t, tErrors]
  );

  const cancel = useCallback(
    async (invitationId: string) => {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      try {
        await service.cancelInvitation(invitationId);
        setSuccess(t("inviteCancelled"));
        await refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : tErrors("cancelFailed"));
      } finally {
        setActionLoading(false);
      }
    },
    [service, refresh, t, tErrors]
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

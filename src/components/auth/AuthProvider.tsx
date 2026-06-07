"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  MOCK_DEMO_HOME_ID,
  SUPABASE_DEMO_HOME_ID,
} from "@/lib/supabase/constants";
import { shouldUseMockData } from "@/services";
import type { Profile } from "@/types/database";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  homeId: string | null;
  loading: boolean;
  isMockMode: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(
  userId: string
): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) return null;
  return data as Profile | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMockMode = shouldUseMockData();

  const refreshProfile = useCallback(async () => {
    if (isMockMode) return;

    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    if (!currentUser) {
      setProfile(null);
      return;
    }

    const loaded = await fetchProfile(currentUser.id);
    setProfile(loaded);
  }, [isMockMode]);

  useEffect(() => {
    if (isMockMode) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const bootstrapIfNeeded = async (userId: string, fullName?: string) => {
      const loaded = await fetchProfile(userId);
      if (loaded?.home_id) {
        setProfile(loaded);
        return;
      }

      const res = await fetch("/api/auth/bootstrap", { method: "POST" });
      if (res.ok) {
        const reloaded = await fetchProfile(userId);
        setProfile(reloaded);
        return;
      }

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      console.error("Profil bootstrap hatası:", body.error);
    };

    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const fullName = currentUser.user_metadata?.full_name as string | undefined;
        await bootstrapIfNeeded(currentUser.id, fullName);
      }

      setLoading(false);
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        void bootstrapIfNeeded(
          session.user.id,
          session.user.user_metadata?.full_name as string | undefined
        );
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isMockMode]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createClient();
    if (!supabase) return "Supabase bağlantısı yok";

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return error?.message ?? null;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const supabase = createClient();
      if (!supabase) return "Supabase bağlantısı yok";

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return error?.message ?? null;
    },
    []
  );

  const signOut = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const homeId = useMemo(() => {
    if (isMockMode) {
      return process.env.NEXT_PUBLIC_DEMO_HOME_ID ?? MOCK_DEMO_HOME_ID;
    }
    return profile?.home_id ?? null;
  }, [isMockMode, profile?.home_id]);

  const value: AuthContextValue = {
    user,
    profile,
    homeId,
    loading,
    isMockMode,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth AuthProvider içinde kullanılmalı");
  }
  return ctx;
}

export function useResolvedHomeId(): {
  homeId: string;
  ready: boolean;
  authLoading: boolean;
} {
  const { homeId, loading, isMockMode } = useAuth();

  if (isMockMode) {
    return {
      homeId: homeId ?? MOCK_DEMO_HOME_ID,
      ready: true,
      authLoading: false,
    };
  }

  if (loading) {
    return { homeId: SUPABASE_DEMO_HOME_ID, ready: false, authLoading: true };
  }

  return {
    homeId: homeId ?? SUPABASE_DEMO_HOME_ID,
    ready: Boolean(homeId),
    authLoading: false,
  };
}

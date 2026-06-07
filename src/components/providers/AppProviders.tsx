"use client";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { FamilyProvider } from "@/components/family/FamilyProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FamilyProvider>{children}</FamilyProvider>
    </AuthProvider>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { useFamily } from "@/hooks/useFamily";

export function IncomingInvitationBanner() {
  const t = useTranslations("family");
  const { incoming, invitationsLoading, isAvailable, authLoading } = useFamily();

  if (authLoading || !isAvailable || invitationsLoading || incoming.length === 0) {
    return null;
  }

  return (
    <Link
      href="/settings"
      className="mb-4 flex items-center gap-3 rounded-2xl border border-plum-300/80 bg-gradient-to-r from-plum-50 to-forest-50 px-4 py-3 text-sm shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum-600 text-white">
        <Bell className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-navy-900">
          {t("bannerTitle", { count: incoming.length })}
        </p>
        <p className="text-xs text-navy-500">{t("bannerSubtitle")}</p>
      </div>
      <span className="shrink-0 rounded-full bg-plum-600 px-2.5 py-1 text-xs font-bold text-white">
        {incoming.length}
      </span>
    </Link>
  );
}

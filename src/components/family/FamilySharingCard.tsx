"use client";

import { useState } from "react";
import { Check, Mail, UserPlus, Users, X } from "lucide-react";
import { useFamily } from "@/hooks/useFamily";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

function memberInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function FamilySharingCard() {
  const {
    members,
    incoming,
    outgoing,
    loading,
    actionLoading,
    error,
    success,
    invite,
    respond,
    cancel,
    isMockMode,
    isAvailable,
    authLoading,
  } = useFamily();

  const [email, setEmail] = useState("");

  if (authLoading) {
    return (
      <Card padding="lg" className="mb-6 border-plum-100/80">
        <div className="h-20 rounded-xl skeleton-shimmer" />
      </Card>
    );
  }

  if (!isAvailable) {
    return (
      <Card padding="lg" className="mb-6 border-amber-200/80 bg-amber-50/50">
        <p className="text-sm text-amber-900">
          Aile paylaşımı için giriş yapın. Eşinizi davet edip onayladıktan sonra
          alışveriş listesini birlikte görürsünüz.
        </p>
      </Card>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    await invite(trimmed);
    setEmail("");
  };

  return (
    <Card padding="lg" className="mb-6 border-plum-100/80">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-plum-100 text-plum-700">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-navy-900">Aile Mutfağı</h2>
          <p className="mt-0.5 text-sm text-navy-500">
            Eşinizi veya aile bireyini davet edin. Onayladıktan sonra alışveriş
            listesi ortak görünür.
          </p>
          {isMockMode && (
            <p className="mt-1 text-xs text-plum-600">
              Demo mod: davetler tarayıcıda simüle edilir.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-xl border border-forest-200 bg-forest-50 px-3 py-2 text-sm text-forest-800">
          {success}
        </div>
      )}

      {incoming.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-plum-700">
            Gelen davetler
          </p>
          {incoming.map((invitation) => (
            <div
              key={invitation.id}
              className="flex flex-col gap-3 rounded-xl border border-plum-200/80 bg-plum-50/60 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-navy-900">
                  {invitation.inviter_name} sizi mutfağına davet ediyor
                </p>
                <p className="text-xs text-navy-500">{invitation.home_name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => void respond(invitation.id, true)}
                  disabled={actionLoading}
                >
                  <Check className="h-4 w-4" />
                  Kabul Et
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => void respond(invitation.id, false)}
                  disabled={actionLoading}
                >
                  <X className="h-4 w-4" />
                  Reddet
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy-400">
          Mutfak üyeleri
        </p>
        {loading ? (
          <div className="h-12 rounded-xl skeleton-shimmer" />
        ) : (
          <ul className="space-y-2">
            {members.map((member) => (
              <li
                key={member.user_id}
                className="flex items-center gap-3 rounded-xl border border-cream-300/80 bg-cream-50/50 px-3 py-2"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-100 text-xs font-bold text-forest-800">
                  {memberInitials(member.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy-900">
                    {member.full_name}
                  </p>
                  <p className="truncate text-xs text-navy-500">{member.email}</p>
                </div>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-500">
                  {member.role === "owner" ? "Sahip" : "Üye"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {outgoing.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-navy-400">
            Bekleyen davetler
          </p>
          {outgoing.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-cream-300/80 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-800">
                  {invitation.invitee_email}
                </p>
                <p className="text-xs text-navy-400">Onay bekliyor</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => void cancel(invitation.id)}
                disabled={actionLoading}
              >
                İptal
              </Button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => void handleInvite(e)} className="space-y-3">
        <Input
          label="Aile bireyi e-postası"
          name="invite_email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="es@ornek.com"
          required
        />
        <Button
          type="submit"
          variant="secondary"
          fullWidth
          disabled={actionLoading || !email.trim()}
        >
          <UserPlus className="h-4 w-4" />
          {actionLoading ? "Gönderiliyor..." : "Davet Gönder"}
        </Button>
        <p className="flex items-start gap-2 text-xs text-navy-400">
          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Davet edilen kişinin uygulamada kayıtlı olması gerekir. Kabul edince
          stok ve alışveriş listesi ortaklaşır.
        </p>
      </form>
    </Card>
  );
}

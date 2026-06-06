import { differenceInCalendarDays, parseISO, isValid } from "date-fns";

export type ExpirationStatus = "expired" | "critical" | "warning" | "ok" | "none";

export interface ExpirationInfo {
  status: ExpirationStatus;
  daysLeft: number | null;
  label: string;
}

export function getExpirationInfo(
  expirationDate: string | null
): ExpirationInfo {
  if (!expirationDate) {
    return { status: "none", daysLeft: null, label: "SKT yok" };
  }

  const date = parseISO(expirationDate);
  if (!isValid(date)) {
    return { status: "none", daysLeft: null, label: "Geçersiz tarih" };
  }

  const daysLeft = differenceInCalendarDays(date, new Date());

  if (daysLeft < 0) {
    return {
      status: "expired",
      daysLeft,
      label: `${Math.abs(daysLeft)} gün önce bitti`,
    };
  }
  if (daysLeft <= 2) {
    return {
      status: "critical",
      daysLeft,
      label: daysLeft === 0 ? "Bugün son gün!" : `${daysLeft} gün kaldı`,
    };
  }
  if (daysLeft <= 7) {
    return {
      status: "warning",
      daysLeft,
      label: `${daysLeft} gün kaldı`,
    };
  }

  return {
    status: "ok",
    daysLeft,
    label: `${daysLeft} gün kaldı`,
  };
}

export function sortByExpirationPriority<
  T extends { expiration_date: string | null; product_name: string }
>(items: T[]): T[] {
  const priority: Record<ExpirationStatus, number> = {
    expired: 0,
    critical: 1,
    warning: 2,
    ok: 3,
    none: 4,
  };

  return [...items].sort((a, b) => {
    const pa = priority[getExpirationInfo(a.expiration_date).status];
    const pb = priority[getExpirationInfo(b.expiration_date).status];
    if (pa !== pb) return pa - pb;
    return a.product_name.localeCompare(b.product_name, "tr");
  });
}

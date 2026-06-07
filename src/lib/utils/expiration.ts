import { differenceInCalendarDays, parseISO, isValid } from "date-fns";

export type ExpirationStatus = "expired" | "critical" | "warning" | "ok" | "none";

export interface ExpirationInfo {
  status: ExpirationStatus;
  daysLeft: number | null;
  label: string;
}

type ExpirationTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

const defaultLabels: ExpirationTranslator = (key, values) => {
  const count = values?.count ?? "";
  switch (key) {
    case "none":
      return "SKT yok";
    case "invalidDate":
      return "Geçersiz tarih";
    case "expiredDaysAgo":
      return `${count} gün önce bitti`;
    case "lastDayToday":
      return "Bugün son gün!";
    case "daysLeft":
      return `${count} gün kaldı`;
    default:
      return key;
  }
};

export function getExpirationInfo(
  expirationDate: string | null,
  t: ExpirationTranslator = defaultLabels
): ExpirationInfo {
  if (!expirationDate) {
    return { status: "none", daysLeft: null, label: t("none") };
  }

  const date = parseISO(expirationDate);
  if (!isValid(date)) {
    return { status: "none", daysLeft: null, label: t("invalidDate") };
  }

  const daysLeft = differenceInCalendarDays(date, new Date());

  if (daysLeft < 0) {
    return {
      status: "expired",
      daysLeft,
      label: t("expiredDaysAgo", { count: Math.abs(daysLeft) }),
    };
  }
  if (daysLeft <= 2) {
    return {
      status: "critical",
      daysLeft,
      label:
        daysLeft === 0
          ? t("lastDayToday")
          : t("daysLeft", { count: daysLeft }),
    };
  }
  if (daysLeft <= 7) {
    return {
      status: "warning",
      daysLeft,
      label: t("daysLeft", { count: daysLeft }),
    };
  }

  return {
    status: "ok",
    daysLeft,
    label: t("daysLeft", { count: daysLeft }),
  };
}

export function sortByExpirationPriority<
  T extends { expiration_date: string | null; product_name: string }
>(items: T[], locale = "tr"): T[] {
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
    return a.product_name.localeCompare(b.product_name, locale);
  });
}

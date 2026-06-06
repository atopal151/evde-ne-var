import { getExpirationInfo } from "@/lib/utils/expiration";

interface ExpirationBadgeProps {
  expirationDate: string | null;
}

const statusStyles = {
  expired: "bg-red-100 text-red-800 border-red-200",
  critical: "bg-orange-100 text-orange-800 border-orange-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  ok: "bg-forest-100 text-forest-800 border-forest-200",
  none: "bg-cream-200 text-navy-600 border-cream-300",
};

export function ExpirationBadge({ expirationDate }: ExpirationBadgeProps) {
  const info = getExpirationInfo(expirationDate);

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusStyles[info.status],
      ].join(" ")}
    >
      {info.label}
    </span>
  );
}

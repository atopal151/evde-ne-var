import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "forest" | "plum" | "coffee" | "orange";
}

const toneStyles = {
  forest: {
    card: "from-forest-50 to-white border-forest-200/60",
    icon: "bg-forest-100 text-forest-700",
    value: "text-forest-800",
  },
  plum: {
    card: "from-plum-100/40 to-white border-plum-200/60",
    icon: "bg-plum-100 text-plum-700",
    value: "text-plum-800",
  },
  coffee: {
    card: "from-coffee-100/50 to-white border-coffee-400/30",
    icon: "bg-coffee-100 text-coffee-700",
    value: "text-coffee-800",
  },
  orange: {
    card: "from-orange-50 to-white border-orange-200/60",
    icon: "bg-orange-100 text-orange-700",
    value: "text-orange-800",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "forest",
}: StatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl border bg-gradient-to-br p-3.5 shadow-sm",
        styles.card,
      ].join(" ")}
    >
      <div
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          styles.icon,
        ].join(" ")}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-navy-500">{label}</p>
        <p className={["truncate text-lg font-bold", styles.value].join(" ")}>
          {value}
        </p>
      </div>
    </div>
  );
}

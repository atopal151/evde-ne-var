import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageSectionProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageSection({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}: PageSectionProps) {
  return (
    <section className="mb-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-forest-600 to-forest-800 text-white shadow-md shadow-forest-900/20">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold tracking-tight text-navy-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

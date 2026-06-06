import type { ReactNode } from "react";

interface EmptyStateProps {
  illustration?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-cream-400/80 bg-gradient-to-b from-white to-cream-100/60 px-6 py-12 text-center shadow-inner shadow-white/50">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-plum-200/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-forest-200/30 blur-2xl" />

      {illustration && (
        <div className="relative mx-auto mb-5 flex justify-center animate-float">
          {illustration}
        </div>
      )}

      <h3 className="relative text-lg font-bold text-navy-900">{title}</h3>
      <p className="relative mx-auto mt-2 max-w-xs text-sm leading-relaxed text-navy-500">
        {description}
      </p>

      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

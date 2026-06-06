import { Refrigerator } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
}

export function Header({
  title = "Evde Ne Var?",
  subtitle = "Akıllı mutfak asistanınız",
  badge,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-br from-forest-900 via-forest-800 to-navy-900 px-4 pb-8 pt-6 text-white sm:px-6">
      <div className="mx-auto flex max-w-2xl items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
          <Refrigerator className="h-6 w-6" aria-hidden />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h1>
            {badge && (
              <span className="rounded-full bg-plum-600/80 px-2 py-0.5 text-xs font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-cream-200">{subtitle}</p>
        </div>
      </div>
    </header>
  );
}

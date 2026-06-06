import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  badge?: string;
  hideHeader?: boolean;
}

export function AppShell({
  children,
  title,
  subtitle,
  badge,
  hideHeader,
}: AppShellProps) {
  return (
    <div className="app-bg flex min-h-full flex-col">
      {!hideHeader && (
        <Header title={title} subtitle={subtitle} badge={badge} />
      )}
      <main className="relative mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-32 sm:px-6">
        <div className="animate-fade-up">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}

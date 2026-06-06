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
    <div className="flex min-h-full flex-col bg-cream-100">
      {!hideHeader && (
        <Header title={title} subtitle={subtitle} badge={badge} />
      )}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pb-28 sm:px-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

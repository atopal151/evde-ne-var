"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ChefHat, ShoppingCart, Settings } from "lucide-react";
import { useFamily } from "@/hooks/useFamily";

const links = [
  { href: "/", label: "Stok", icon: Home },
  { href: "/inventory/add", label: "Ekle", icon: PlusCircle },
  { href: "/recipes", label: "Tarifler", icon: ChefHat },
  { href: "/shopping", label: "Liste", icon: ShoppingCart },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  const { incoming, invitationsLoading, isAvailable, authLoading } = useFamily();
  const hasPendingInvitations =
    !authLoading && isAvailable && !invitationsLoading && incoming.length > 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3 pt-2 safe-area-pb">
      <div className="mx-auto max-w-md rounded-2xl border border-cream-300/80 bg-white/90 shadow-xl shadow-navy-900/10 backdrop-blur-xl">
        <ul className="flex justify-around px-1 py-1.5">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className={[
                    "relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-200",
                    active
                      ? "bg-forest-100 text-forest-800"
                      : "text-navy-400 hover:text-navy-600",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute -top-0.5 h-1 w-8 rounded-full bg-forest-600" />
                  )}
                  <span className="relative">
                    <Icon
                      className={[
                        "h-5 w-5 transition-transform",
                        active ? "scale-110 text-forest-700" : "",
                      ].join(" ")}
                    />
                    {href === "/settings" && hasPendingInvitations && (
                      <span
                        className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"
                        aria-label={`${incoming.length} bekleyen davet`}
                      />
                    )}
                  </span>
                  <span
                    className={[
                      "text-[11px] font-semibold",
                      active ? "text-forest-800" : "text-navy-500",
                    ].join(" ")}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

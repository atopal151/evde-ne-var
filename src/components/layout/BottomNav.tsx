"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ChefHat, ShoppingCart } from "lucide-react";

const links = [
  { href: "/", label: "Stok", icon: Home },
  { href: "/inventory/add", label: "Ekle", icon: PlusCircle },
  { href: "/recipes", label: "Tarifler", icon: ChefHat, disabled: true },
  { href: "/shopping", label: "Liste", icon: ShoppingCart, disabled: true },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-cream-300 bg-white/95 backdrop-blur-md safe-area-pb">
      <ul className="mx-auto flex max-w-2xl justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon, disabled }) => {
          const active = pathname === href;
          const content = (
            <>
              <Icon
                className={[
                  "h-5 w-5",
                  active ? "text-forest-700" : "text-navy-400",
                  disabled ? "opacity-40" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "text-xs font-medium",
                  active ? "text-forest-800" : "text-navy-500",
                  disabled ? "opacity-40" : "",
                ].join(" ")}
              >
                {label}
              </span>
            </>
          );

          return (
            <li key={href} className="flex-1">
              {disabled ? (
                <span className="flex flex-col items-center gap-1 py-1 cursor-not-allowed">
                  {content}
                </span>
              ) : (
                <Link
                  href={href}
                  className="flex flex-col items-center gap-1 py-1 transition-colors"
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

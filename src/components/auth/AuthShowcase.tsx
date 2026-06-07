import { Logo } from "@/components/brand/Logo";
import {
  ChefHat,
  Package,
  ShoppingCart,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Stok takibi",
    description: "Buzdolabı ve mutfak ürünlerinizi tek yerden yönetin.",
  },
  {
    icon: Sparkles,
    title: "AI tarifler",
    description: "Eldeki malzemelerle Gemini destekli tarif önerileri alın.",
  },
  {
    icon: ShoppingCart,
    title: "Alışveriş listesi",
    description: "Eksikleri not edin, markete giderken yanınızda taşıyın.",
  },
];

export function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-navy-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-plum-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-32 h-64 w-64 rounded-full bg-forest-400/15 blur-3xl" />

      <div className="relative z-10">
        <Logo variant="light" markSize={48} />

        <h2 className="mt-10 max-w-md text-3xl font-bold leading-tight text-white">
          Ne pişireceğinize karar verin.
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-cream-200">
          Eldeki malzemelerle AI tarifleri, stok takibi, SKT uyarıları ve
          alışveriş listesi — hepsi tek uygulamada.
        </p>

        <ul className="mt-8 space-y-4">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-cream-100">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-cream-300">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-10">
        <div className="relative mx-auto max-w-sm">
          <div className="absolute -left-4 top-6 w-[88%] rotate-[-6deg] rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
            <div className="flex items-center gap-2 text-cream-100">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Domates · 3 gün kaldı</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-orange-400/60" />
          </div>

          <div className="relative z-10 ml-auto w-[88%] rotate-[3deg] rounded-2xl border border-white/15 bg-white/95 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-forest-700" />
                <span className="text-sm font-semibold text-navy-900">Menemen</span>
              </div>
              <span className="rounded-full bg-plum-100 px-2 py-0.5 text-xs font-semibold text-plum-700">
                %95
              </span>
            </div>
            <p className="mt-2 text-xs text-navy-500">15 dk · 3 malzeme</p>
          </div>

          <div className="absolute -bottom-2 right-0 w-[75%] rotate-[2deg] rounded-2xl border border-white/10 bg-forest-700/80 p-3 backdrop-blur">
            <div className="flex items-center gap-2 text-cream-100">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">Süt, ekmek, zeytinyağı</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

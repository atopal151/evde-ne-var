import type { ProductCategory } from "@/types/database";

export const CATEGORY_VISUALS: Record<
  ProductCategory,
  { emoji: string; gradient: string; accent: string }
> = {
  "Sebze & Meyve": {
    emoji: "🥬",
    gradient: "from-emerald-400 to-forest-500",
    accent: "bg-emerald-50 text-emerald-800",
  },
  "Süt & Kahvaltılık": {
    emoji: "🥛",
    gradient: "from-sky-300 to-blue-500",
    accent: "bg-sky-50 text-sky-800",
  },
  "Et & Balık": {
    emoji: "🥩",
    gradient: "from-rose-400 to-red-600",
    accent: "bg-rose-50 text-rose-800",
  },
  "Bakliyat & Tahıl": {
    emoji: "🌾",
    gradient: "from-amber-400 to-orange-600",
    accent: "bg-amber-50 text-amber-800",
  },
  İçecek: {
    emoji: "🥤",
    gradient: "from-cyan-400 to-teal-600",
    accent: "bg-cyan-50 text-cyan-800",
  },
  Atıştırmalık: {
    emoji: "🍪",
    gradient: "from-yellow-400 to-amber-600",
    accent: "bg-yellow-50 text-yellow-800",
  },
  "Baharat & Sos": {
    emoji: "🌶️",
    gradient: "from-orange-400 to-red-500",
    accent: "bg-orange-50 text-orange-800",
  },
  Dondurulmuş: {
    emoji: "🧊",
    gradient: "from-blue-300 to-indigo-500",
    accent: "bg-blue-50 text-blue-800",
  },
  Diğer: {
    emoji: "📦",
    gradient: "from-plum-400 to-plum-600",
    accent: "bg-plum-100 text-plum-800",
  },
};

export function getCategoryVisual(category: ProductCategory) {
  return CATEGORY_VISUALS[category] ?? CATEGORY_VISUALS.Diğer;
}

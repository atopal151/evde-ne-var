import type { InventoryUnit, ProductCategory } from "@/types/database";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Sebze & Meyve",
  "Süt & Kahvaltılık",
  "Et & Balık",
  "Bakliyat & Tahıl",
  "İçecek",
  "Atıştırmalık",
  "Baharat & Sos",
  "Dondurulmuş",
  "Diğer",
];

export const INVENTORY_UNITS: InventoryUnit[] = [
  "adet",
  "gram",
  "kg",
  "litre",
  "ml",
  "paket",
  "demet",
];

export const BARCODE_PRODUCT_HINTS: Record<string, { name: string; category: ProductCategory; unit: InventoryUnit }> = {
  "8690632001234": { name: "Süt", category: "Süt & Kahvaltılık", unit: "litre" },
  "8690507001234": { name: "Yoğurt", category: "Süt & Kahvaltılık", unit: "adet" },
  "8690526001234": { name: "Ekmek", category: "Bakliyat & Tahıl", unit: "adet" },
};

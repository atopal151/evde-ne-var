import { BARCODE_PRODUCT_HINTS } from "@/lib/constants";
import type { InventoryUnit, ProductCategory } from "@/types/database";

export interface BarcodeLookupResult {
  barcode: string;
  name: string;
  category: ProductCategory;
  unit: InventoryUnit;
  brand?: string;
  source: "local" | "openfoodfacts";
}

interface OpenFoodFactsResponse {
  status?: number;
  product?: {
    product_name?: string;
    product_name_tr?: string;
    brands?: string;
    quantity?: string;
    categories_tags?: string[];
  };
}

const CATEGORY_KEYWORDS: { category: ProductCategory; keywords: string[] }[] = [
  {
    category: "Süt & Kahvaltılık",
    keywords: [
      "süt",
      "milk",
      "yoğurt",
      "yogurt",
      "peynir",
      "cheese",
      "tereyağ",
      "butter",
      "yumurta",
      "egg",
      "kahvalt",
      "breakfast",
      "dairy",
    ],
  },
  {
    category: "Sebze & Meyve",
    keywords: [
      "sebze",
      "vegetable",
      "meyve",
      "fruit",
      "domates",
      "tomato",
      "elma",
      "apple",
      "salad",
    ],
  },
  {
    category: "Et & Balık",
    keywords: ["et", "meat", "tavuk", "chicken", "balık", "fish", "sucuk", "salam"],
  },
  {
    category: "Bakliyat & Tahıl",
    keywords: [
      "pirinç",
      "rice",
      "makarna",
      "pasta",
      "un",
      "flour",
      "bakliyat",
      "legume",
      "ekmek",
      "bread",
      "tahıl",
      "cereal",
    ],
  },
  {
    category: "İçecek",
    keywords: ["içecek", "beverage", "drink", "su", "water", "cola", "juice", "meyve suyu"],
  },
  {
    category: "Atıştırmalık",
    keywords: ["snack", "atıştır", "cips", "chips", "çikolata", "chocolate", "bisküvi", "cookie"],
  },
  {
    category: "Baharat & Sos",
    keywords: ["baharat", "spice", "sos", "sauce", "ketçap", "ketchup", "mayonez"],
  },
  {
    category: "Dondurulmuş",
    keywords: ["dondurul", "frozen", "ice cream", "dondurma"],
  },
];

function inferCategory(text: string): ProductCategory {
  const haystack = text.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => haystack.includes(kw))) {
      return category;
    }
  }
  return "Diğer";
}

function inferUnit(quantity?: string, name?: string): InventoryUnit {
  const text = `${quantity ?? ""} ${name ?? ""}`.toLowerCase();

  if (/\b\d+\s*(ml|mililitre)\b/.test(text) || text.includes(" ml")) return "ml";
  if (/\b\d+\s*(l|lt|litre|liter)\b/.test(text) || /\b1\s*l\b/.test(text)) return "litre";
  if (/\b\d+\s*(kg|kilogram)\b/.test(text)) return "kg";
  if (/\b\d+\s*(g|gr|gram)\b/.test(text)) return "gram";
  if (/\b(paket|pack)\b/.test(text)) return "paket";
  if (/\b(demet|bunch)\b/.test(text)) return "demet";

  return "adet";
}

function pickProductName(product: OpenFoodFactsResponse["product"]): string {
  const tr = product?.product_name_tr?.trim();
  const name = product?.product_name?.trim();
  return tr || name || "";
}

export function lookupLocalBarcode(barcode: string): BarcodeLookupResult | null {
  const hint = BARCODE_PRODUCT_HINTS[barcode];
  if (!hint) return null;

  return {
    barcode,
    name: hint.name,
    category: hint.category,
    unit: hint.unit,
    source: "local",
  };
}

export async function lookupBarcodeOnline(
  barcode: string
): Promise<BarcodeLookupResult | null> {
  const local = lookupLocalBarcode(barcode);
  if (local) return local;

  const normalized = barcode.replace(/\D/g, "");
  if (normalized.length < 8) return null;

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(normalized)}.json`,
      {
        headers: { "User-Agent": "BugunNePisirsem/1.0 (kitchen inventory app)" },
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as OpenFoodFactsResponse;
    if (data.status !== 1 || !data.product) return null;

    const name = pickProductName(data.product);
    if (!name) return null;

    const tags = (data.product.categories_tags ?? []).join(" ");
    const brand = data.product.brands?.split(",")[0]?.trim();
    const categoryText = `${name} ${tags} ${brand ?? ""}`;

    return {
      barcode: normalized,
      name: brand ? `${brand} ${name}` : name,
      category: inferCategory(categoryText),
      unit: inferUnit(data.product.quantity, name),
      brand,
      source: "openfoodfacts",
    };
  } catch {
    return null;
  }
}

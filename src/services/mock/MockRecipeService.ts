import type { InventoryItem } from "@/types/database";
import type { IRecipeService } from "@/services/interfaces/IRecipeService";
import type { Recipe, RecipeResponse } from "@/types/recipes";

function findItem(
  inventory: InventoryItem[],
  name: string
): InventoryItem | undefined {
  const key = name.toLocaleLowerCase("tr");
  return inventory.find((i) => i.product_name.toLocaleLowerCase("tr") === key);
}

function buildMenemen(inventory: InventoryItem[]): Recipe | null {
  const domates = findItem(inventory, "Domates");
  const yumurta = findItem(inventory, "Yumurta");
  if (!domates || !yumurta) return null;

  return {
    name: "Menemen",
    match_rate: "%95",
    required_extra_ingredients: ["tuz", "zeytinyağı", "biber"],
    prep_time: "15 dk",
    ingredients_used: [
      {
        product_name: domates.product_name,
        amount: Math.min(3, domates.quantity),
        unit: domates.unit,
      },
      {
        product_name: yumurta.product_name,
        amount: Math.min(3, yumurta.quantity),
        unit: yumurta.unit,
      },
    ],
    instructions: [
      "Domatesleri küp doğrayın, tavada zeytinyağında soteleyin.",
      "Yumurtaları kırıp karıştırın, kısık ateşte pişirin.",
      "Tuz ve isteğe göre biber ekleyip servis edin.",
    ],
  };
}

function buildOmlet(inventory: InventoryItem[]): Recipe | null {
  const yumurta = findItem(inventory, "Yumurta");
  const sut = findItem(inventory, "Süt");
  if (!yumurta) return null;

  const ingredients = [
    {
      product_name: yumurta.product_name,
      amount: Math.min(2, yumurta.quantity),
      unit: yumurta.unit,
    },
  ];

  if (sut) {
    ingredients.push({
      product_name: sut.product_name,
      amount: Math.min(0.1, sut.quantity),
      unit: sut.unit,
    });
  }

  return {
    name: "Sade Omlet",
    match_rate: sut ? "%90" : "%85",
    required_extra_ingredients: ["tuz", "zeytinyağı"],
    prep_time: "10 dk",
    ingredients_used: ingredients,
    instructions: [
      "Yumurtaları çırpın, tuz ekleyin.",
      sut ? "Az süt ekleyip karıştırın." : "Tavada yağı ısıtın.",
      "Tavada her iki tarafını pişirip servis edin.",
    ],
  };
}

function buildPilav(inventory: InventoryItem[]): Recipe | null {
  const pirinc = findItem(inventory, "Pirinç");
  if (!pirinc) return null;

  return {
    name: "Sade Pilav",
    match_rate: "%80",
    required_extra_ingredients: ["tuz", "tereyağı", "su"],
    prep_time: "25 dk",
    ingredients_used: [
      {
        product_name: pirinc.product_name,
        amount: Math.min(1, pirinc.quantity),
        unit: pirinc.unit,
      },
    ],
    instructions: [
      "Pirinci yıkayıp süzün.",
      "Tencerede yağda kavurun, sıcak su ve tuzu ekleyin.",
      "Kısık ateşte suyunu çekene kadar pişirin.",
    ],
  };
}

function buildFallback(item: InventoryItem): Recipe {
  return {
    name: `${item.product_name} ile Pratik Tarif`,
    match_rate: "%70",
    required_extra_ingredients: ["tuz", "zeytinyağı"],
    prep_time: "20 dk",
    ingredients_used: [
      {
        product_name: item.product_name,
        amount: Math.min(1, item.quantity),
        unit: item.unit,
      },
    ],
    instructions: [
      `${item.product_name} malzemesini hazırlayın.`,
      "Tuz ve yağ ile lezzetlendirip pişirin.",
      "Sıcak servis edin.",
    ],
  };
}

export class MockRecipeService implements IRecipeService {
  async generate(
    inventory: InventoryItem[],
    _locale?: import("@/i18n/config").Locale
  ): Promise<RecipeResponse> {
    if (inventory.length === 0) {
      throw new Error("Stok boş — önce malzeme ekleyin");
    }

    const candidates = [
      buildMenemen(inventory),
      buildOmlet(inventory),
      buildPilav(inventory),
    ].filter((r): r is Recipe => r !== null);

    if (candidates.length === 0) {
      candidates.push(buildFallback(inventory[0]));
    }

    while (candidates.length < 3 && inventory.length > 1) {
      const extra = buildFallback(inventory[candidates.length % inventory.length]);
      if (!candidates.some((r) => r.name === extra.name)) {
        candidates.push(extra);
      } else {
        break;
      }
    }

    return { recipes: candidates.slice(0, 3) };
  }
}

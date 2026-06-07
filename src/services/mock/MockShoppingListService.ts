import type { InventoryUnit, ShoppingListItem } from "@/types/database";
import type {
  CreateShoppingItemInput,
  IShoppingListService,
} from "@/services/interfaces/IShoppingListService";

const STORAGE_KEY = "nepisirsem-shopping";

function load(): ShoppingListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ShoppingListItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: ShoppingListItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export class MockShoppingListService implements IShoppingListService {
  async listByHome(homeId: string): Promise<ShoppingListItem[]> {
    return load().filter((i) => i.home_id === homeId);
  }

  async add(
    homeId: string,
    input: CreateShoppingItemInput
  ): Promise<ShoppingListItem> {
    const item: ShoppingListItem = {
      id: crypto.randomUUID(),
      home_id: homeId,
      product_name: input.product_name,
      quantity: input.quantity ?? 1,
      unit: (input.unit ?? "adet") as InventoryUnit,
      is_completed: false,
      created_at: new Date().toISOString(),
    };

    const items = load();
    items.push(item);
    save(items);
    return item;
  }

  async toggleComplete(
    id: string,
    isCompleted: boolean
  ): Promise<ShoppingListItem> {
    const items = load();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Liste öğesi bulunamadı");

    items[index] = { ...items[index], is_completed: isCompleted };
    save(items);
    return items[index];
  }

  async remove(id: string): Promise<void> {
    save(load().filter((i) => i.id !== id));
  }
}

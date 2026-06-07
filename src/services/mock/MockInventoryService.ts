import type {
  CreateInventoryInput,
  InventoryItem,
  UpdateInventoryInput,
} from "@/types/database";
import type { IInventoryService } from "@/services/interfaces/IInventoryService";

const STORAGE_KEY = "nepisirsem-inventory";

function load(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as InventoryItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: InventoryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function seedDemoData(homeId: string): InventoryItem[] {
  const now = new Date();
  const inDays = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    return date.toISOString().slice(0, 10);
  };

  return [
    {
      id: crypto.randomUUID(),
      home_id: homeId,
      product_name: "Süt",
      barcode: "8690632001234",
      category: "Süt & Kahvaltılık",
      quantity: 1,
      unit: "litre",
      expiration_date: inDays(2),
      added_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      home_id: homeId,
      product_name: "Domates",
      barcode: null,
      category: "Sebze & Meyve",
      quantity: 6,
      unit: "adet",
      expiration_date: inDays(5),
      added_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      home_id: homeId,
      product_name: "Yumurta",
      barcode: null,
      category: "Süt & Kahvaltılık",
      quantity: 12,
      unit: "adet",
      expiration_date: inDays(14),
      added_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      home_id: homeId,
      product_name: "Pirinç",
      barcode: null,
      category: "Bakliyat & Tahıl",
      quantity: 2,
      unit: "kg",
      expiration_date: inDays(180),
      added_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
  ];
}

export class MockInventoryService implements IInventoryService {
  constructor(private readonly homeId: string) {
    if (typeof window !== "undefined" && load().length === 0) {
      save(seedDemoData(homeId));
    }
  }

  async listByHome(homeId: string): Promise<InventoryItem[]> {
    return load().filter((i) => i.home_id === homeId);
  }

  async getById(id: string): Promise<InventoryItem | null> {
    return load().find((i) => i.id === id) ?? null;
  }

  async create(homeId: string, input: CreateInventoryInput): Promise<InventoryItem> {
    const now = new Date().toISOString();
    const item: InventoryItem = {
      id: crypto.randomUUID(),
      home_id: homeId,
      product_name: input.product_name,
      barcode: input.barcode ?? null,
      category: input.category ?? "Diğer",
      quantity: input.quantity,
      unit: input.unit,
      expiration_date: input.expiration_date ?? null,
      added_at: now,
      updated_at: now,
    };
    const items = load();
    items.push(item);
    save(items);
    return item;
  }

  async update(id: string, input: UpdateInventoryInput): Promise<InventoryItem> {
    const items = load();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new Error("Ürün bulunamadı");

    items[index] = {
      ...items[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    save(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    save(load().filter((i) => i.id !== id));
  }

  async findByBarcode(
    homeId: string,
    barcode: string
  ): Promise<InventoryItem | null> {
    return (
      load().find(
        (i) => i.home_id === homeId && i.barcode === barcode
      ) ?? null
    );
  }

  async deductQuantity(id: string, amount: number): Promise<InventoryItem> {
    const item = await this.getById(id);
    if (!item) throw new Error("Ürün bulunamadı");

    const newQty = Math.max(0, item.quantity - amount);
    return this.update(id, { quantity: newQty });
  }
}

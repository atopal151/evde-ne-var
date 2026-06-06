import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreateInventoryInput,
  InventoryItem,
  UpdateInventoryInput,
} from "@/types/database";
import type { IInventoryService } from "@/services/interfaces/IInventoryService";

export class SupabaseInventoryService implements IInventoryService {
  constructor(private readonly client: SupabaseClient) {}

  async listByHome(homeId: string): Promise<InventoryItem[]> {
    const { data, error } = await this.client
      .from("inventory")
      .select("*")
      .eq("home_id", homeId)
      .order("expiration_date", { ascending: true, nullsFirst: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as InventoryItem[];
  }

  async getById(id: string): Promise<InventoryItem | null> {
    const { data, error } = await this.client
      .from("inventory")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as InventoryItem | null;
  }

  async create(
    homeId: string,
    input: CreateInventoryInput
  ): Promise<InventoryItem> {
    const { data, error } = await this.client
      .from("inventory")
      .insert({
        home_id: homeId,
        product_name: input.product_name,
        barcode: input.barcode ?? null,
        category: input.category ?? "Diğer",
        quantity: input.quantity,
        unit: input.unit,
        expiration_date: input.expiration_date ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as InventoryItem;
  }

  async update(id: string, input: UpdateInventoryInput): Promise<InventoryItem> {
    const { data, error } = await this.client
      .from("inventory")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as InventoryItem;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from("inventory").delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async findByBarcode(
    homeId: string,
    barcode: string
  ): Promise<InventoryItem | null> {
    const { data, error } = await this.client
      .from("inventory")
      .select("*")
      .eq("home_id", homeId)
      .eq("barcode", barcode)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as InventoryItem | null;
  }

  async deductQuantity(id: string, amount: number): Promise<InventoryItem> {
    const item = await this.getById(id);
    if (!item) throw new Error("Ürün bulunamadı");

    const newQty = Math.max(0, Number(item.quantity) - amount);
    return this.update(id, { quantity: newQty });
  }
}

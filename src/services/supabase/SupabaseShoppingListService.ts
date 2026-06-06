import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShoppingListItem } from "@/types/database";
import type {
  CreateShoppingItemInput,
  IShoppingListService,
} from "@/services/interfaces/IShoppingListService";

export class SupabaseShoppingListService implements IShoppingListService {
  constructor(private readonly client: SupabaseClient) {}

  async listByHome(homeId: string): Promise<ShoppingListItem[]> {
    const { data, error } = await this.client
      .from("shopping_list")
      .select("*")
      .eq("home_id", homeId)
      .order("is_completed", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as ShoppingListItem[];
  }

  async add(
    homeId: string,
    input: CreateShoppingItemInput
  ): Promise<ShoppingListItem> {
    const { data, error } = await this.client
      .from("shopping_list")
      .insert({
        home_id: homeId,
        product_name: input.product_name,
        quantity: input.quantity ?? 1,
        unit: input.unit ?? "adet",
        is_completed: false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ShoppingListItem;
  }

  async toggleComplete(
    id: string,
    isCompleted: boolean
  ): Promise<ShoppingListItem> {
    const { data, error } = await this.client
      .from("shopping_list")
      .update({ is_completed: isCompleted })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as ShoppingListItem;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client
      .from("shopping_list")
      .delete()
      .eq("id", id);
    if (error) throw new Error(error.message);
  }
}

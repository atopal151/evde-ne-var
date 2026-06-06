import type { InventoryUnit, ShoppingListItem } from "@/types/database";

export interface CreateShoppingItemInput {
  product_name: string;
  quantity?: number;
  unit?: InventoryUnit;
}

export interface IShoppingListService {
  listByHome(homeId: string): Promise<ShoppingListItem[]>;
  add(homeId: string, input: CreateShoppingItemInput): Promise<ShoppingListItem>;
  toggleComplete(id: string, isCompleted: boolean): Promise<ShoppingListItem>;
  remove(id: string): Promise<void>;
}

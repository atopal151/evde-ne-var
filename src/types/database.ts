export type InventoryUnit = "adet" | "gram" | "kg" | "litre" | "ml" | "paket" | "demet";

export type ProductCategory =
  | "Sebze & Meyve"
  | "Süt & Kahvaltılık"
  | "Et & Balık"
  | "Bakliyat & Tahıl"
  | "İçecek"
  | "Atıştırmalık"
  | "Baharat & Sos"
  | "Dondurulmuş"
  | "Diğer";

export interface Home {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  home_id: string | null;
  full_name: string | null;
  dietary_preferences: string[];
  created_at: string;
}

export interface InventoryItem {
  id: string;
  home_id: string;
  product_name: string;
  barcode: string | null;
  category: ProductCategory;
  quantity: number;
  unit: InventoryUnit;
  expiration_date: string | null;
  added_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  home_id: string;
  product_name: string;
  quantity: number;
  unit: InventoryUnit;
  is_completed: boolean;
  created_at: string;
}

export interface CreateInventoryInput {
  product_name: string;
  barcode?: string | null;
  category?: ProductCategory;
  quantity: number;
  unit: InventoryUnit;
  expiration_date?: string | null;
}

export interface UpdateInventoryInput {
  product_name?: string;
  barcode?: string | null;
  category?: ProductCategory;
  quantity?: number;
  unit?: InventoryUnit;
  expiration_date?: string | null;
}

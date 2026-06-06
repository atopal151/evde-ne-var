import type {
  CreateInventoryInput,
  InventoryItem,
  UpdateInventoryInput,
} from "@/types/database";

export interface IInventoryService {
  listByHome(homeId: string): Promise<InventoryItem[]>;
  getById(id: string): Promise<InventoryItem | null>;
  create(homeId: string, input: CreateInventoryInput): Promise<InventoryItem>;
  update(id: string, input: UpdateInventoryInput): Promise<InventoryItem>;
  delete(id: string): Promise<void>;
  findByBarcode(homeId: string, barcode: string): Promise<InventoryItem | null>;
  deductQuantity(
    id: string,
    amount: number
  ): Promise<InventoryItem>;
}

import type { ProductCategory } from "@/types/database";

export function getCategoryLabel(
  category: ProductCategory,
  t: (key: string) => string
): string {
  return t(category);
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { INVENTORY_UNITS } from "@/lib/constants";
import type { CreateShoppingItemInput } from "@/services/interfaces/IShoppingListService";
import type { InventoryUnit } from "@/types/database";

interface AddShoppingItemFormProps {
  onSubmit: (input: CreateShoppingItemInput) => Promise<void>;
}

export function AddShoppingItemForm({ onSubmit }: AddShoppingItemFormProps) {
  const t = useTranslations("shopping");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState<InventoryUnit>("adet");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSubmitting(true);
    try {
      await onSubmit({
        product_name: trimmed,
        quantity: Number(quantity) || 1,
        unit,
      });
      setName("");
      setQuantity("1");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
      <Input
        label={t("productLabel")}
        name="product_name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("productPlaceholder")}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("quantityLabel")}
          name="quantity"
          type="number"
          min="0.01"
          step="0.01"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <Select
          label={t("unitLabel")}
          name="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value as InventoryUnit)}
          options={INVENTORY_UNITS.map((u) => ({ value: u, label: u }))}
        />
      </div>

      <Button type="submit" fullWidth disabled={submitting || !name.trim()}>
        <Plus className="h-4 w-4" />
        {submitting ? t("adding") : t("addToList")}
      </Button>
    </form>
  );
}

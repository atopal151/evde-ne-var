"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Barcode, PenLine } from "lucide-react";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { INVENTORY_UNITS, PRODUCT_CATEGORIES } from "@/lib/constants";
import { getCategoryLabel } from "@/lib/i18n/category";
import type { CreateInventoryInput, InventoryUnit, ProductCategory } from "@/types/database";

interface InventoryFormProps {
  onSubmit: (input: CreateInventoryInput) => Promise<void>;
  initialBarcode?: string;
}

type Tab = "manual" | "barcode";

export function InventoryForm({ onSubmit, initialBarcode }: InventoryFormProps) {
  const t = useTranslations("inventory");
  const tCategories = useTranslations("categories");

  const schema = useMemo(
    () =>
      z.object({
        product_name: z.string().min(1, t("validationName")),
        quantity: z.coerce.number().positive(t("validationQuantity")),
        unit: z.string(),
        category: z.string(),
        expiration_date: z.string().optional(),
        barcode: z.string().optional(),
      }),
    [t]
  );

  const [tab, setTab] = useState<Tab>(initialBarcode ? "barcode" : "manual");
  const [showScanner, setShowScanner] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    product_name: "",
    quantity: "1",
    unit: "adet" as InventoryUnit,
    category: "Diğer" as ProductCategory,
    expiration_date: "",
    barcode: initialBarcode ?? "",
  });

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setTab("manual");
    setLookupLoading(true);
    setLookupMessage(null);

    try {
      const response = await fetch(
        `/api/products/lookup?barcode=${encodeURIComponent(barcode)}`
      );
      const data = (await response.json()) as {
        found?: boolean;
        product?: {
          barcode: string;
          name: string;
          category: ProductCategory;
          unit: InventoryUnit;
        };
      };

      if (data.found && data.product) {
        setForm((prev) => ({
          ...prev,
          barcode: data.product!.barcode,
          product_name: data.product!.name,
          category: data.product!.category,
          unit: data.product!.unit,
        }));
        setLookupMessage(t("lookupFound", { name: data.product.name }));
        return;
      }

      setForm((prev) => ({
        ...prev,
        barcode: barcode.replace(/\D/g, "") || barcode,
      }));
      setLookupMessage(t("lookupNotFound"));
    } catch {
      setForm((prev) => ({
        ...prev,
        barcode: barcode.replace(/\D/g, "") || barcode,
      }));
      setLookupMessage(t("lookupFailed"));
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse({
      ...form,
      expiration_date: form.expiration_date || undefined,
      barcode: form.barcode || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        product_name: parsed.data.product_name,
        quantity: parsed.data.quantity,
        unit: parsed.data.unit as InventoryUnit,
        category: parsed.data.category as ProductCategory,
        expiration_date: parsed.data.expiration_date ?? null,
        barcode: parsed.data.barcode ?? null,
      });
      setForm({
        product_name: "",
        quantity: "1",
        unit: "adet",
        category: "Diğer",
        expiration_date: "",
        barcode: "",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl bg-cream-200 p-1">
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
            tab === "manual"
              ? "bg-white text-forest-800"
              : "text-navy-600 hover:text-navy-800",
          ].join(" ")}
        >
          <PenLine className="h-4 w-4" />
          {t("tabManual")}
        </button>
        <button
          type="button"
          onClick={() => {
            setTab("barcode");
            setShowScanner(true);
          }}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors",
            tab === "barcode"
              ? "bg-white text-forest-800"
              : "text-navy-600 hover:text-navy-800",
          ].join(" ")}
        >
          <Barcode className="h-4 w-4" />
          {t("tabBarcode")}
        </button>
      </div>

      {tab === "barcode" && showScanner && (
        <BarcodeScanner
          onScan={(code) => void handleBarcodeScan(code)}
          onClose={() => setShowScanner(false)}
        />
      )}

      {lookupLoading && (
        <p className="rounded-xl bg-forest-50 px-3 py-2 text-sm text-forest-800">
          {t("lookupSearching")}
        </p>
      )}

      {lookupMessage && !lookupLoading && (
        <p className="rounded-xl bg-cream-200/80 px-3 py-2 text-sm text-navy-700">
          {lookupMessage}
        </p>
      )}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <Input
          label={t("productName")}
          name="product_name"
          value={form.product_name}
          onChange={(e) =>
            setForm((p) => ({ ...p, product_name: e.target.value }))
          }
          placeholder={t("productPlaceholder")}
          error={errors.product_name}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("quantity")}
            name="quantity"
            type="number"
            min="0.01"
            step="0.01"
            value={form.quantity}
            onChange={(e) =>
              setForm((p) => ({ ...p, quantity: e.target.value }))
            }
            error={errors.quantity}
            required
          />
          <Select
            label={t("unit")}
            name="unit"
            value={form.unit}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                unit: e.target.value as InventoryUnit,
              }))
            }
            options={INVENTORY_UNITS.map((u) => ({ value: u, label: u }))}
          />
        </div>

        <Select
          label={t("category")}
          name="category"
          value={form.category}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              category: e.target.value as ProductCategory,
            }))
          }
          options={PRODUCT_CATEGORIES.map((c) => ({
            value: c,
            label: getCategoryLabel(c, tCategories),
          }))}
        />

        <Input
          label={t("expiration")}
          name="expiration_date"
          type="date"
          value={form.expiration_date}
          onChange={(e) =>
            setForm((p) => ({ ...p, expiration_date: e.target.value }))
          }
        />

        <Input
          label={t("barcode")}
          name="barcode"
          value={form.barcode}
          onChange={(e) =>
            setForm((p) => ({ ...p, barcode: e.target.value }))
          }
          placeholder={t("barcodePlaceholder")}
        />

        <Button type="submit" fullWidth disabled={submitting} size="lg">
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </div>
  );
}

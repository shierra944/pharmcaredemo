"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type FormState = {
  name: string;
  sku: string;
  category: string;
  costPrice: string;
  sellingPrice: string;
  stock: string;
  reorderLevel: string;
  expiryDate: string;
  supplier: string;
};

const EMPTY: FormState = {
  name: "",
  sku: "",
  category: "",
  costPrice: "",
  sellingPrice: "",
  stock: "0",
  reorderLevel: "20",
  expiryDate: "",
  supplier: "",
};

function toForm(p: Product): FormState {
  return {
    name: p.name,
    sku: p.sku,
    category: p.category,
    costPrice: String(p.costPrice),
    sellingPrice: String(p.sellingPrice),
    stock: String(p.stock),
    reorderLevel: String(p.reorderLevel),
    expiryDate: p.expiryDate ?? "",
    supplier: p.supplier,
  };
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  existingSkus,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  existingSkus: string[];
  onSave: (product: Product) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(product ? toForm(product) : EMPTY);
      setErrors({});
    }
  }, [open, product]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const cost = Number(form.costPrice) || 0;
  const price = Number(form.sellingPrice) || 0;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

  function validate() {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.sku.trim()) e.sku = "SKU is required.";
    else if (existingSkus.includes(form.sku.trim().toUpperCase()) && form.sku.trim().toUpperCase() !== product?.sku.toUpperCase())
      e.sku = "This SKU is already in use.";
    if (!form.category) e.category = "Choose a category.";
    if (!(cost > 0)) e.costPrice = "Enter a cost price.";
    if (!(price > 0)) e.sellingPrice = "Enter a selling price.";
    else if (price < cost) e.sellingPrice = "Selling price is below cost.";
    if (Number(form.stock) < 0 || form.stock === "") e.stock = "Stock can't be negative.";
    if (Number(form.reorderLevel) < 0 || form.reorderLevel === "") e.reorderLevel = "Enter a reorder level.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      id: product?.id ?? `prd_${Date.now()}`,
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      costPrice: cost,
      sellingPrice: price,
      stock: Math.floor(Number(form.stock)),
      reorderLevel: Math.floor(Number(form.reorderLevel)),
      expiryDate: form.expiryDate || null,
      supplier: form.supplier.trim() || "—",
    });
  }

  const field = (key: keyof FormState, label: string, input: React.ReactNode, className = "") => (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={key}>{label}</Label>
      {input}
      {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit product" : "Add product"}</DialogTitle>
          <DialogDescription>
            {product ? `Update details for ${product.sku}.` : "Add a new item to your catalog."} Changes are kept in this
            browser session only (mock data).
          </DialogDescription>
        </DialogHeader>

        <form id="product-form" onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          {field(
            "name",
            "Product name",
            <Input id="name" value={form.name} onChange={set("name")} placeholder="e.g. Vitamin C 500mg Tablet (Bottle of 100)" aria-invalid={!!errors.name} />,
            "sm:col-span-2",
          )}
          {field("sku", "SKU", <Input id="sku" value={form.sku} onChange={set("sku")} placeholder="VIT-1234" className="uppercase" aria-invalid={!!errors.sku} />)}
          {field(
            "category",
            "Category",
            <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
              <SelectTrigger id="category" aria-invalid={!!errors.category}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>,
          )}
          {field("costPrice", "Cost price (₱)", <Input id="costPrice" type="number" min={0} step="0.01" value={form.costPrice} onChange={set("costPrice")} aria-invalid={!!errors.costPrice} />)}
          {field(
            "sellingPrice",
            "Selling price (₱)",
            <Input id="sellingPrice" type="number" min={0} step="0.01" value={form.sellingPrice} onChange={set("sellingPrice")} aria-invalid={!!errors.sellingPrice} />,
          )}
          {field("stock", "Current stock", <Input id="stock" type="number" min={0} value={form.stock} onChange={set("stock")} aria-invalid={!!errors.stock} />)}
          {field("reorderLevel", "Reorder level", <Input id="reorderLevel" type="number" min={0} value={form.reorderLevel} onChange={set("reorderLevel")} aria-invalid={!!errors.reorderLevel} />)}
          {field("expiryDate", "Expiry date", <Input id="expiryDate" type="date" value={form.expiryDate} onChange={set("expiryDate")} />)}
          {field("supplier", "Supplier", <Input id="supplier" value={form.supplier} onChange={set("supplier")} placeholder="e.g. Zuellig Pharma" />)}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-muted/60 px-4 py-3 text-sm sm:col-span-2">
            <span className="text-muted-foreground">
              Margin per unit: <span className="font-semibold text-foreground">{formatCurrency(Math.max(0, price - cost))}</span>
            </span>
            <span className="text-muted-foreground">
              Gross margin:{" "}
              <span className={margin >= 25 ? "font-semibold text-emerald-600 dark:text-emerald-400" : "font-semibold text-amber-600"}>
                {margin.toFixed(1)}%
              </span>
            </span>
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="product-form">
            {product ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

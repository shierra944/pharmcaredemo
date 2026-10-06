/**
 * Client-safe helpers (no JSON imports) so client components don't pull the
 * whole mock dataset into the browser bundle.
 */
import type { Product, StockStatus } from "@/lib/types";

export const CATEGORIES = [
  "OTC Medicines",
  "Prescription Medicines",
  "Vitamins & Supplements",
  "Herbal & Natural",
  "Medical Devices",
  "Personal Care",
  "First Aid",
  "Mother & Baby",
] as const;

export function getStockStatus(p: Pick<Product, "stock" | "reorderLevel">): StockStatus {
  if (p.stock <= 0) return "Out of Stock";
  if (p.stock <= p.reorderLevel) return "Low Stock";
  return "In Stock";
}

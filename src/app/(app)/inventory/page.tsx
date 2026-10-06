import type { Metadata } from "next";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Package, Warehouse } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { InventoryTable } from "@/components/inventory/inventory-table";
import { getInventoryMovements, getProducts, getStockStatus, TODAY } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  const products = getProducts();
  const movements = getInventoryMovements();

  const stockValue = products.reduce((a, p) => a + p.stock * p.costPrice, 0);
  const units = products.reduce((a, p) => a + p.stock, 0);
  const low = products.filter((p) => getStockStatus(p) !== "In Stock");
  const out = low.filter((p) => p.stock <= 0).length;

  const since = new Date(TODAY);
  since.setDate(since.getDate() - 30);
  const sinceKey = since.toISOString().slice(0, 10);
  const recent = movements.filter((m) => m.date >= sinceKey);
  const unitsIn = recent.filter((m) => m.type === "Stock In").reduce((a, m) => a + m.quantity, 0);
  const unitsOut = recent.filter((m) => m.type === "Stock Out").reduce((a, m) => a + m.quantity, 0);

  return (
    <>
      <PageHeader title="Inventory" description="Stock levels and every movement in and out of your store." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Products" value={formatNumber(products.length)} icon={Package} tone="blue" hint={`${formatNumber(units)} units on hand`} />
        <StatCard
          label="Total Stock Value"
          value={formatCurrency(stockValue, { whole: true })}
          icon={Warehouse}
          tone="emerald"
          hint="Valued at cost price"
        />
        <StatCard
          label="Low Stock Products"
          value={formatNumber(low.length)}
          icon={AlertTriangle}
          tone="red"
          hint={`${out} out of stock`}
        />
        <StatCard
          label="Movement (30 days)"
          value={`${formatNumber(unitsIn)} in`}
          icon={unitsIn >= unitsOut ? ArrowDownToLine : ArrowUpFromLine}
          tone="violet"
          hint={`${formatNumber(unitsOut)} units out`}
        />
      </div>

      <div className="mt-6">
        <InventoryTable
          initialMovements={movements}
          products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))}
          today={TODAY}
        />
      </div>
    </>
  );
}

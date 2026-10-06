"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarClock, Download, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { ProductFormDialog } from "./product-form-dialog";
import { CATEGORIES, getStockStatus } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

type StatusFilter = "all" | "attention" | "In Stock" | "Low Stock" | "Out of Stock";

export function ProductsView({
  initialProducts,
  initialQuery = "",
  initialStatus = "all",
  asOfDate,
}: {
  initialProducts: Product[];
  initialQuery?: string;
  initialStatus?: StatusFilter;
  asOfDate?: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const counts = useMemo(() => {
    const c = { all: products.length, "In Stock": 0, "Low Stock": 0, "Out of Stock": 0 };
    for (const p of products) c[getStockStatus(p)]++;
    return c;
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
      if (category !== "all" && p.category !== category) return false;
      const s = getStockStatus(p);
      if (status === "attention" && s === "In Stock") return false;
      if (status !== "all" && status !== "attention" && s !== status) return false;
      return true;
    });
  }, [products, query, category, status]);

  const pager = usePagination(filtered, 12);

  const expirySoonLimit = useMemo(() => {
    const base = asOfDate ? new Date(asOfDate) : new Date();
    base.setDate(base.getDate() + 90);
    return base.toISOString().slice(0, 10);
  }, [asOfDate]);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setFormOpen(true);
  }

  function handleSave(p: Product) {
    setProducts((all) => {
      const exists = all.some((x) => x.id === p.id);
      return exists ? all.map((x) => (x.id === p.id ? p : x)) : [p, ...all];
    });
    setFormOpen(false);
    toast.success(editing ? "Product updated" : "Product added", { description: p.name });
  }

  function confirmDelete() {
    if (!deleting) return;
    setProducts((all) => all.filter((x) => x.id !== deleting.id));
    toast.success("Product deleted", { description: deleting.name });
    setDeleting(null);
  }

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "All products", count: counts.all },
    { key: "In Stock", label: "In stock", count: counts["In Stock"] },
    { key: "Low Stock", label: "Low stock", count: counts["Low Stock"] },
    { key: "Out of Stock", label: "Out of stock", count: counts["Out of Stock"] },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your catalog, pricing, reorder levels and expiry dates."
        actions={
          <>
            <Button variant="outline" onClick={() => toast("Export started", { description: "products.csv will download shortly (demo)." })}>
              <Download /> Export
            </Button>
            <Button onClick={openAdd}>
              <Plus /> Add Product
            </Button>
          </>
        }
      />

      <Card className="gap-0 py-0">
        {/* status tabs */}
        <div className="flex gap-1 overflow-x-auto border-b px-3 pt-2">
          {statusTabs.map((t) => {
            const active = status === t.key || (t.key === "Low Stock" && status === "attention");
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setStatus(t.key)}
                className={cn(
                  "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular",
                    active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* toolbar */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name or SKU…" className="sm:max-w-sm" />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-56" aria-label="Filter by category">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {status === "attention" && (
            <Button variant="ghost" size="sm" onClick={() => setStatus("all")}>
              Showing low & out of stock · Clear
            </Button>
          )}
        </div>

        {pager.total === 0 ? (
          <EmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Cost Price</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.pageRows.map((p) => {
                const s = getStockStatus(p);
                const expiringSoon = p.expiryDate !== null && p.expiryDate <= expirySoonLimit;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate font-medium" title={p.name}>
                        {p.name}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{p.supplier}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                    <TableCell className="text-muted-foreground">{p.category}</TableCell>
                    <TableCell className="text-right tabular text-muted-foreground">{formatCurrency(p.costPrice)}</TableCell>
                    <TableCell className="text-right font-medium tabular">{formatCurrency(p.sellingPrice)}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold tabular",
                        s === "Out of Stock" && "text-red-600 dark:text-red-400",
                        s === "Low Stock" && "text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {p.stock}
                    </TableCell>
                    <TableCell className="text-right tabular text-muted-foreground">{p.reorderLevel}</TableCell>
                    <TableCell>
                      {p.expiryDate ? (
                        <span className={cn("inline-flex items-center gap-1.5", expiringSoon && "font-medium text-red-600 dark:text-red-400")}>
                          {expiringSoon && <CalendarClock className="size-3.5" />}
                          {formatDate(p.expiryDate)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={s} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`} title="Edit">
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleting(p)}
                          aria-label={`Delete ${p.name}`}
                          title="Delete"
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        <Pagination {...pager} noun="products" />
      </Card>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        existingSkus={products.map((p) => p.sku.toUpperCase())}
        onSave={handleSave}
      />

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleting?.name}</span> ({deleting?.sku}) will be removed from
              your catalog. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete product</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

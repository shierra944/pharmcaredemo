"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDownLeft, ArrowUpRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination, usePagination } from "@/components/shared/pagination";
import type { InventoryMovement } from "@/lib/types";
import { cn, formatDate, initials } from "@/lib/utils";

type ProductOption = { id: string; name: string; sku: string };

export function InventoryTable({
  initialMovements,
  products,
  today,
}: {
  initialMovements: InventoryMovement[];
  products: ProductOption[];
  today: string;
}) {
  const [movements, setMovements] = useState(initialMovements);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [user, setUser] = useState("all");
  const [open, setOpen] = useState(false);

  const users = useMemo(() => [...new Set(movements.map((m) => m.user))].sort(), [movements]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movements.filter((m) => {
      if (type !== "all" && m.type !== type) return false;
      if (user !== "all" && m.user !== user) return false;
      if (q && !`${m.productName} ${m.sku} ${m.reference}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [movements, query, type, user]);

  const pager = usePagination(filtered, 15);

  function addMovement(m: InventoryMovement) {
    setMovements((all) => [m, ...all]);
    setOpen(false);
    toast.success(`${m.type} recorded`, { description: `${m.quantity} × ${m.productName}` });
  }

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex-col gap-4 border-b py-5 sm:flex-row sm:items-center">
        <div>
          <CardTitle>Inventory Movement History</CardTitle>
          <CardDescription>Deliveries, sales and adjustments over the last 45 days</CardDescription>
        </div>
        <Button onClick={() => setOpen(true)} className="sm:ml-auto">
          <Plus /> Record movement
        </Button>
      </CardHeader>

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search product, SKU or reference…" className="sm:max-w-sm" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="sm:w-44" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Stock In">Stock In</SelectItem>
            <SelectItem value="Stock Out">Stock Out</SelectItem>
          </SelectContent>
        </Select>
        <Select value={user} onValueChange={setUser}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by user">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All users</SelectItem>
            {users.map((u) => (
              <SelectItem key={u} value={u}>
                {u}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {pager.total === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pager.pageRows.map((m) => {
              const isIn = m.type === "Stock In";
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{formatDate(m.date)}</div>
                    <div className="text-xs text-muted-foreground">{m.time}</div>
                  </TableCell>
                  <TableCell className="max-w-[320px]">
                    <div className="truncate font-medium" title={m.productName}>
                      {m.productName}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">{m.sku}</div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                        isIn
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-blue-500/10 text-blue-700 dark:text-blue-400",
                      )}
                    >
                      {isIn ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}
                      {m.type}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-semibold tabular",
                      isIn ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
                    )}
                  >
                    {isIn ? "+" : "−"}
                    {m.quantity}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{m.reference}</div>
                    <div className="max-w-[220px] truncate text-xs text-muted-foreground">{m.reason}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarFallback className="text-[10px]">{initials(m.user)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{m.user}</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <Pagination {...pager} noun="movements" />

      <MovementDialog open={open} onOpenChange={setOpen} products={products} today={today} onSave={addMovement} />
    </Card>
  );
}

function MovementDialog({
  open,
  onOpenChange,
  products,
  today,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  products: ProductOption[];
  today: string;
  onSave: (m: InventoryMovement) => void;
}) {
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"Stock In" | "Stock Out">("Stock In");
  const [quantity, setQuantity] = useState("");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setProductId("");
    setType("Stock In");
    setQuantity("");
    setReference("");
    setReason("");
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const product = products.find((p) => p.id === productId);
    const qty = Math.floor(Number(quantity));
    if (!product) return setError("Select a product.");
    if (!(qty > 0)) return setError("Quantity must be at least 1.");
    const now = new Date();
    onSave({
      id: `mov_${Date.now()}`,
      date: today,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type,
      quantity: qty,
      reference: reference.trim() || (type === "Stock In" ? "PO-MANUAL" : "ADJ-MANUAL"),
      reason: reason.trim() || (type === "Stock In" ? "Manual stock in" : "Manual adjustment"),
      user: "Andrea Cruz",
    });
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record stock movement</DialogTitle>
          <DialogDescription>Log a delivery, return or adjustment. Saved for this session only.</DialogDescription>
        </DialogHeader>
        <form id="movement-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "Stock In" | "Stock Out")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stock In">Stock In</SelectItem>
                <SelectItem value="Stock Out">Stock Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ref">Reference</Label>
            <Input id="ref" placeholder="PO-2026-0123" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason / notes</Label>
            <Input id="reason" placeholder="Delivery from supplier" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
        </form>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="movement-form">
            Save movement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

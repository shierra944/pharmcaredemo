"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination, usePagination } from "@/components/shared/pagination";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  time: string;
  itemCount: number;
  total: number;
  amountPaid: number;
  status: string;
}

const STATUSES = ["all", "Paid", "Partial", "Unpaid", "Cancelled"] as const;

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [period, setPeriod] = useState("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const latest = rows[0]?.date ?? "";
    const cutoff = (() => {
      if (period === "all" || !latest) return "";
      const d = new Date(latest);
      d.setDate(d.getDate() - Number(period));
      return d.toISOString().slice(0, 10);
    })();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (cutoff && r.date < cutoff) return false;
      if (q && !`${r.orderNumber} ${r.customerName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, status, period]);

  const pager = usePagination(filtered, 15);

  return (
    <Card className="gap-0 py-0">
      <div className="flex gap-1 overflow-x-auto border-b px-3 pt-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={cn(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              status === s ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {s === "all" ? "All orders" : s}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular",
                status === s ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search order # or customer…" className="sm:max-w-sm" />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="sm:w-44" aria-label="Date range">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="sm:ml-auto"
          onClick={() => toast("Export started", { description: `${filtered.length} orders → orders.csv (demo)` })}
        >
          <Download /> Export
        </Button>
      </div>

      {pager.total === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Items</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pager.pageRows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Link href={`/orders/${r.orderNumber}`} className="font-medium text-primary hover:underline">
                    {r.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[240px] truncate font-medium">{r.customerName}</TableCell>
                <TableCell>
                  <div>{formatDate(r.date)}</div>
                  <div className="text-xs text-muted-foreground">{r.time}</div>
                </TableCell>
                <TableCell className="text-right tabular text-muted-foreground">{r.itemCount}</TableCell>
                <TableCell className="text-right font-semibold tabular">{formatCurrency(r.total)}</TableCell>
                <TableCell className="text-right tabular text-muted-foreground">
                  {r.status === "Cancelled" ? "—" : formatCurrency(r.amountPaid)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/orders/${r.orderNumber}`}>
                      <Eye /> View Order
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination {...pager} noun="orders" />
    </Card>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Phone, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from "@/components/shared/search-input";
import { SortHeader, type SortDir } from "@/components/shared/sort-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination, usePagination } from "@/components/shared/pagination";
import type { Customer } from "@/lib/types";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  clinic: "Clinic",
  pharmacy: "Pharmacy",
  business: "Business",
  individual: "Individual",
  walkin: "Walk-in",
};

type SortKey = "name" | "totalPurchases" | "outstandingBalance" | "lastPurchaseDate";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [balanceOnly, setBalanceOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>("totalPurchases");
  const [dir, setDir] = useState<SortDir>("desc");

  function onSort(key: SortKey) {
    if (sortKey === key) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setDir(key === "name" ? "asc" : "desc");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = customers.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (balanceOnly && c.outstandingBalance <= 0) return false;
      if (q && !`${c.name} ${c.phone} ${c.city}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (!sortKey) return rows;
    const m = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return (typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv))) * m;
    });
  }, [customers, query, type, balanceOnly, sortKey, dir]);

  const pager = usePagination(filtered, 12);

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
        <SearchInput value={query} onChange={setQuery} placeholder="Search name, phone or city…" className="sm:max-w-sm" />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="sm:w-44" aria-label="Customer type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant={balanceOnly ? "secondary" : "outline"} onClick={() => setBalanceOnly((b) => !b)} aria-pressed={balanceOnly}>
          With balance only
        </Button>
        <Button className="sm:ml-auto" onClick={() => toast("Coming soon", { description: "Customer creation will be enabled with the database." })}>
          <Plus /> Add customer
        </Button>
      </div>

      {pager.total === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader label="Customer Name" sortKey="name" current={sortKey} dir={dir} onSort={onSort} />
              <TableHead>Phone</TableHead>
              <SortHeader label="Total Purchases" sortKey="totalPurchases" current={sortKey} dir={dir} onSort={onSort} align="right" />
              <SortHeader label="Outstanding Balance" sortKey="outstandingBalance" current={sortKey} dir={dir} onSort={onSort} align="right" />
              <SortHeader label="Last Purchase Date" sortKey="lastPurchaseDate" current={sortKey} dir={dir} onSort={onSort} />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pager.pageRows.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback>{initials(c.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="neutral" className="px-1.5 py-0 text-[10px]">
                          {TYPE_LABEL[c.type] ?? c.type}
                        </Badge>
                        {c.city !== "—" && c.city}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {c.phone !== "—" ? (
                    <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                      <Phone className="size-3.5" /> {c.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="font-semibold tabular">{formatCurrency(c.totalPurchases)}</div>
                  <div className="text-xs text-muted-foreground">{c.totalOrders} orders</div>
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold tabular",
                    c.outstandingBalance > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground",
                  )}
                >
                  {formatCurrency(c.outstandingBalance)}
                </TableCell>
                <TableCell>{formatDate(c.lastPurchaseDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination {...pager} noun="customers" />
    </Card>
  );
}

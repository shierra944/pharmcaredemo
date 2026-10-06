"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination, usePagination } from "@/components/shared/pagination";
import type { Invoice, Payment } from "@/lib/types";
import { cn, daysBetween, formatCurrency, formatDate } from "@/lib/utils";

const STATUSES = ["all", "Paid", "Partial", "Unpaid", "Overdue"] as const;
const METHODS = ["Cash", "GCash", "Bank Transfer", "Check", "Credit Card"];

export function PaymentsView({
  initialInvoices,
  initialPayments,
  today,
}: {
  initialInvoices: Invoice[];
  initialPayments: Payment[];
  today: string;
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [payments, setPayments] = useState(initialPayments);
  const [paying, setPaying] = useState<Invoice | null>(null);

  function recordPayment(invoice: Invoice, amount: number, method: string) {
    const amountPaid = invoice.amountPaid + amount;
    const balance = Math.max(0, invoice.amountDue - amountPaid);
    const status = balance === 0 ? "Paid" : invoice.dueDate < today ? "Overdue" : "Partial";
    setInvoices((all) => all.map((i) => (i.id === invoice.id ? { ...i, amountPaid, balance, status } : i)));
    setPayments((all) => [
      {
        id: `pay_${Date.now()}`,
        receiptNumber: `OR-${today.slice(0, 4)}-${String(all.length + 1).padStart(5, "0")}`,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        date: today,
        amount,
        method,
        receivedBy: "Andrea Cruz",
      },
      ...all,
    ]);
    setPaying(null);
    toast.success("Payment recorded", {
      description: `${formatCurrency(amount)} applied to ${invoice.invoiceNumber}${balance === 0 ? " — fully paid" : ""}.`,
    });
  }

  return (
    <Tabs defaultValue="invoices">
      <TabsList>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="history">Payment history</TabsTrigger>
      </TabsList>
      <TabsContent value="invoices">
        <InvoicesTable invoices={invoices} today={today} onPay={setPaying} />
      </TabsContent>
      <TabsContent value="history">
        <HistoryTable payments={payments} />
      </TabsContent>

      <RecordPaymentDialog invoice={paying} onClose={() => setPaying(null)} onSubmit={recordPayment} />
    </Tabs>
  );
}

function InvoicesTable({ invoices, today, onPay }: { invoices: Invoice[]; today: string; onPay: (i: Invoice) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: invoices.length };
    for (const i of invoices) c[i.status] = (c[i.status] ?? 0) + 1;
    return c;
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return invoices.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (q && !`${i.invoiceNumber} ${i.customerName} ${i.orderNumber}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [invoices, query, status]);

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
            {s === "all" ? "All invoices" : s}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px] leading-none tabular",
                status === s
                  ? "bg-primary/10 text-primary"
                  : s === "Overdue"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="p-4">
        <SearchInput value={query} onChange={setQuery} placeholder="Search invoice, order or customer…" className="sm:max-w-sm" />
      </div>

      {pager.total === 0 ? (
        <EmptyState />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount Due</TableHead>
              <TableHead className="text-right">Amount Paid</TableHead>
              <TableHead className="text-right">Remaining Balance</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pager.pageRows.map((i) => {
              const daysOverdue = i.status === "Overdue" ? daysBetween(i.dueDate, today) : 0;
              return (
                <TableRow key={i.id}>
                  <TableCell>
                    <div className="font-medium">{i.invoiceNumber}</div>
                    <Link href={`/orders/${i.orderNumber}`} className="text-xs text-muted-foreground hover:text-primary hover:underline">
                      {i.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate font-medium">{i.customerName}</TableCell>
                  <TableCell className="text-right tabular">{formatCurrency(i.amountDue)}</TableCell>
                  <TableCell className="text-right tabular text-emerald-600 dark:text-emerald-400">{formatCurrency(i.amountPaid)}</TableCell>
                  <TableCell className={cn("text-right font-semibold tabular", i.balance > 0 ? "text-foreground" : "text-muted-foreground")}>
                    {formatCurrency(i.balance)}
                  </TableCell>
                  <TableCell>
                    <div>{formatDate(i.dueDate)}</div>
                    {daysOverdue > 0 && <div className="text-xs font-medium text-red-600 dark:text-red-400">{daysOverdue} days overdue</div>}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={i.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {i.balance > 0 ? (
                      <Button size="sm" variant="success" onClick={() => onPay(i)}>
                        <HandCoins /> Record payment
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">Settled</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <Pagination {...pager} noun="invoices" />
    </Card>
  );
}

function HistoryTable({ payments }: { payments: Payment[] }) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      if (method !== "all" && p.method !== method) return false;
      if (q && !`${p.receiptNumber} ${p.invoiceNumber} ${p.customerName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [payments, query, method]);

  const pager = usePagination(filtered, 15);

  return (
    <Card className="gap-0 py-0">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
        <SearchInput value={query} onChange={setQuery} placeholder="Search receipt, invoice or customer…" className="sm:max-w-sm" />
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="sm:w-48" aria-label="Payment method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All methods</SelectItem>
            {METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
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
              <TableHead>Receipt</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Received by</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pager.pageRows.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.receiptNumber}</TableCell>
                <TableCell>{formatDate(p.date)}</TableCell>
                <TableCell className="text-muted-foreground">{p.invoiceNumber}</TableCell>
                <TableCell className="max-w-[220px] truncate">{p.customerName}</TableCell>
                <TableCell>{p.method}</TableCell>
                <TableCell className="text-muted-foreground">{p.receivedBy}</TableCell>
                <TableCell className="text-right font-semibold tabular text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(p.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Pagination {...pager} noun="payments" />
    </Card>
  );
}

function RecordPaymentDialog({
  invoice,
  onClose,
  onSubmit,
}: {
  invoice: Invoice | null;
  onClose: () => void;
  onSubmit: (invoice: Invoice, amount: number, method: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Bank Transfer");
  const [error, setError] = useState<string | null>(null);
  const [lastId, setLastId] = useState<string | null>(null);

  // Reset the form whenever a different invoice is opened.
  if (invoice && invoice.id !== lastId) {
    setLastId(invoice.id);
    setAmount(String(invoice.balance));
    setMethod("Bank Transfer");
    setError(null);
  } else if (!invoice && lastId !== null) {
    setLastId(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;
    const value = Number(amount);
    if (!(value > 0)) return setError("Enter an amount greater than zero.");
    if (value > invoice.balance) return setError(`Amount can't exceed the balance of ${formatCurrency(invoice.balance)}.`);
    onSubmit(invoice, Math.round(value * 100) / 100, method);
  }

  return (
    <Dialog
      open={invoice !== null}
      onOpenChange={(o) => {
        if (!o) {
          setLastId(null);
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
          <DialogDescription>
            {invoice?.invoiceNumber} · {invoice?.customerName}
          </DialogDescription>
        </DialogHeader>
        {invoice && (
          <form id="payment-form" onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-3 gap-3 rounded-lg bg-muted/60 p-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Amount due</div>
                <div className="font-semibold tabular">{formatCurrency(invoice.amountDue)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Paid</div>
                <div className="font-semibold tabular">{formatCurrency(invoice.amountPaid)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Balance</div>
                <div className="font-semibold tabular text-red-600 dark:text-red-400">{formatCurrency(invoice.balance)}</div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount">Amount (₱)</Label>
                <Input id="pay-amount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Payment method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        )}
        <DialogFooter>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" variant="success">
            Save payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

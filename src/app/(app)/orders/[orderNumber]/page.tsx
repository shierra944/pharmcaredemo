import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, CalendarDays, CreditCard, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { PrintButton } from "@/components/shared/print-button";
import { getCustomers, getInvoices, getOrders, getPayments } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

type Params = Promise<{ orderNumber: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Order ${decodeURIComponent(orderNumber)}` };
}

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { orderNumber } = await params;
  const order = getOrders().find((o) => o.orderNumber === decodeURIComponent(orderNumber));
  if (!order) notFound();

  const customer = getCustomers().find((c) => c.id === order.customerId);
  const invoice = getInvoices().find((i) => i.orderNumber === order.orderNumber);
  const payments = invoice ? getPayments().filter((p) => p.invoiceNumber === invoice.invoiceNumber) : [];
  const balance = order.status === "Cancelled" ? 0 : order.total - order.amountPaid;
  const paidPct = order.total > 0 ? Math.round((order.amountPaid / order.total) * 100) : 0;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/orders" aria-label="Back to orders">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.date, "long")} at {order.time} by {order.createdBy}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <PrintButton label="Print invoice" />
          {balance > 0 && (
            <Button asChild>
              <Link href="/payments">
                <CreditCard /> Record payment
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="gap-0 pb-0 lg:col-span-2">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Order items</CardTitle>
              <CardDescription>{order.items.length} line items</CardDescription>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((it) => (
                <TableRow key={it.productId}>
                  <TableCell className="max-w-[360px]">
                    <div className="truncate font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{it.sku}</span> · {it.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular">{it.quantity}</TableCell>
                  <TableCell className="text-right tabular text-muted-foreground">{formatCurrency(it.unitPrice)}</TableCell>
                  <TableCell className="text-right font-medium tabular">{formatCurrency(it.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="border-t" />
          <div className="ml-auto w-full max-w-xs space-y-2 p-5 text-sm">
            <Row label="Subtotal" value={formatCurrency(order.subtotal)} />
            <Row label="Discount" value={order.discount ? `−${formatCurrency(order.discount)}` : formatCurrency(0)} />
            <Separator />
            <Row label="Total" value={formatCurrency(order.total)} strong />
            <Row label="Amount paid" value={formatCurrency(order.amountPaid)} />
            <Row
              label="Balance due"
              value={formatCurrency(balance)}
              strong
              className={balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 font-medium">
                {customer?.type === "individual" || customer?.type === "walkin" ? (
                  <User className="size-4 text-muted-foreground" />
                ) : (
                  <Building2 className="size-4 text-muted-foreground" />
                )}
                {order.customerName}
              </div>
              {customer && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" /> {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {customer.creditTerms ? `Net ${customer.creditTerms} terms` : "Cash on delivery"}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Payment</CardTitle>
                {invoice && <CardDescription>{invoice.invoiceNumber} · due {formatDate(invoice.dueDate)}</CardDescription>}
              </div>
              {invoice && <StatusBadge status={invoice.status} />}
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {order.status === "Cancelled" ? (
                <p className="text-muted-foreground">This order was cancelled. No invoice was issued.</p>
              ) : (
                <>
                  <div>
                    <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                      <span>{paidPct}% collected</span>
                      <span className="tabular">
                        {formatCurrency(order.amountPaid, { whole: true })} / {formatCurrency(order.total, { whole: true })}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidPct}%` }} />
                    </div>
                  </div>
                  {payments.length > 0 ? (
                    <ul className="divide-y rounded-lg border">
                      {payments.map((p) => (
                        <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                          <div>
                            <div className="font-medium">{p.receiptNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(p.date)} · {p.method}
                            </div>
                          </div>
                          <div className="font-semibold text-emerald-600 tabular dark:text-emerald-400">
                            {formatCurrency(p.amount)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No payments recorded yet.</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong, className }: { label: string; value: string; strong?: boolean; className?: string }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "font-semibold" : "text-muted-foreground"} ${className ?? ""}`}>
      <span>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}

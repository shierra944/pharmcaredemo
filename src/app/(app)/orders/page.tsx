import type { Metadata } from "next";
import { CircleDollarSign, Clock4, ShoppingCart, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { OrdersTable, type OrderRow } from "@/components/orders/orders-table";
import { getOrders, TODAY } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Orders" };

export default function OrdersPage() {
  const orders = [...getOrders()].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  const month = TODAY.slice(0, 7);
  const monthOrders = orders.filter((o) => o.date.startsWith(month));
  const active = monthOrders.filter((o) => o.status !== "Cancelled");

  // Lightweight rows for the table – line items are loaded on the order detail page.
  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    date: o.date,
    time: o.time,
    itemCount: o.items.length,
    total: o.total,
    amountPaid: o.amountPaid,
    status: o.status,
  }));

  return (
    <>
      <PageHeader title="Orders" description="All sales orders, their payment status and line items." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders this month" value={formatNumber(monthOrders.length)} icon={ShoppingCart} tone="blue" hint={`${formatNumber(orders.length)} all time`} />
        <StatCard
          label="Order value this month"
          value={formatCurrency(active.reduce((a, o) => a + o.total, 0), { whole: true })}
          icon={CircleDollarSign}
          tone="emerald"
          hint={`Avg ${formatCurrency(active.reduce((a, o) => a + o.total, 0) / Math.max(1, active.length), { whole: true })} per order`}
        />
        <StatCard
          label="Awaiting payment"
          value={formatNumber(orders.filter((o) => o.status === "Unpaid" || o.status === "Partial").length)}
          icon={Clock4}
          tone="amber"
          hint={`${formatCurrency(orders.filter((o) => o.status !== "Cancelled").reduce((a, o) => a + (o.total - o.amountPaid), 0), { compact: true })} unpaid balance`}
        />
        <StatCard
          label="Cancelled"
          value={formatNumber(orders.filter((o) => o.status === "Cancelled").length)}
          icon={XCircle}
          tone="red"
          hint="Last 12 months"
        />
      </div>

      <div className="mt-6">
        <OrdersTable rows={rows} />
      </div>
    </>
  );
}

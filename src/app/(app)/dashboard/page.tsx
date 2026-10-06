import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CalendarRange,
  Download,
  HandCoins,
  PackageSearch,
  Plus,
  ReceiptText,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { SalesTrendChart } from "@/components/charts/sales-trend-chart";
import { TopProductsChart } from "@/components/charts/top-products-chart";
import { CategoryChart } from "@/components/charts/category-chart";
import {
  getDashboardStats,
  getMonthlySales,
  getProducts,
  getRecentOrders,
  getRecentPayments,
  getSalesByCategory,
  getStockStatus,
  getTopProducts,
  meta,
} from "@/lib/data";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const stats = getDashboardStats();
  const monthly = getMonthlySales();
  const topProducts = getTopProducts(10);
  const byCategory = getSalesByCategory();
  const recentOrders = getRecentOrders(6);
  const recentPayments = getRecentPayments(6);
  const lowStock = getProducts()
    .filter((p) => getStockStatus(p) !== "In Stock")
    .sort((a, b) => a.stock / a.reorderLevel - b.stock / b.reorderLevel)
    .slice(0, 6);

  const yearSales = monthly.reduce((a, m) => a + m.sales, 0);
  const firstName = meta.user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Good day, ${firstName}`}
        description={`Here's how ${meta.branch} is doing as of ${formatDate(meta.asOfDate, "long")}.`}
        actions={
          <>
            <Button variant="outline">
              <Download /> Export
            </Button>
            <Button asChild>
              <Link href="/orders">
                <Plus /> New order
              </Link>
            </Button>
          </>
        }
      />

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Sales Today"
          value={formatCurrency(stats.salesToday, { whole: true })}
          icon={Banknote}
          tone="blue"
          delta={stats.salesTodayChange}
          deltaLabel={`vs yesterday · ${stats.ordersToday} orders`}
        />
        <StatCard
          label="Sales This Month"
          value={formatCurrency(stats.salesMonth, { whole: true })}
          icon={CalendarRange}
          tone="violet"
          delta={stats.salesMonthChange}
          deltaLabel="vs same period last month"
        />
        <StatCard
          label="Collections Today"
          value={formatCurrency(stats.collectionsToday, { whole: true })}
          icon={HandCoins}
          tone="emerald"
          hint={`${stats.collectionsCountToday} payments received`}
        />
        <StatCard
          label="Outstanding Receivables"
          value={formatCurrency(stats.receivables, { whole: true })}
          icon={ReceiptText}
          tone="amber"
          hint={
            <>
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(stats.overdue, { compact: true })} overdue
              </span>{" "}
              · {stats.openInvoiceCount} open invoices
            </>
          }
        />
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(stats.inventoryValue, { whole: true })}
          icon={Warehouse}
          tone="sky"
          hint={`At cost · ${formatCurrency(stats.retailValue, { compact: true })} at retail`}
        />
        <StatCard
          label="Low Stock Items"
          value={formatNumber(stats.lowStockCount)}
          icon={AlertTriangle}
          tone="red"
          hint={`${stats.outOfStockCount} out of stock · needs reorder`}
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Monthly Sales Trend</CardTitle>
              <CardDescription>Last 12 months · {formatCurrency(yearSales, { compact: true })} total sales</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-chart-1" /> Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-chart-2" /> Gross profit
              </span>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesTrendChart data={monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Share of revenue, last 90 days</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryChart data={byCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Top 10 Best Selling Products</CardTitle>
              <CardDescription>By revenue, last 90 days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/reports">
                Full report <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pl-2">
            <TopProductsChart data={topProducts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Reorder Alerts</CardTitle>
              <CardDescription>Products at or below reorder level</CardDescription>
            </div>
            <PackageSearch className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.map((p) => {
              const pct = Math.min(100, Math.round((p.stock / p.reorderLevel) * 100));
              return (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate font-medium">{p.name.replace(/\s*\(.*\)/, "")}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular">
                      {p.stock} / {p.reorderLevel}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={p.stock === 0 ? "h-full bg-red-500" : "h-full bg-amber-500"}
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
              <Link href="/products?status=low">View all low stock</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="gap-0 pb-0">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest sales orders across all channels</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-medium text-primary">{o.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(o.date)} · {o.time}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">{o.customerName}</TableCell>
                  <TableCell className="text-right font-medium tabular">{formatCurrency(o.total)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="gap-0 pb-0">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Collections posted to invoices</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/payments">
                View all <ArrowRight />
              </Link>
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.receiptNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(p.date)} · {p.invoiceNumber}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">{p.customerName}</TableCell>
                  <TableCell className="text-muted-foreground">{p.method}</TableCell>
                  <TableCell className="text-right font-semibold text-emerald-600 tabular dark:text-emerald-400">
                    +{formatCurrency(p.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </>
  );
}

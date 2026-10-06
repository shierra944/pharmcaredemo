import type { Metadata } from "next";
import { CalendarClock, Download, Percent, ShoppingBag, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { SalesTrendChart } from "@/components/charts/sales-trend-chart";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { PrintButton } from "@/components/shared/print-button";
import {
  getExpiringProducts,
  getMonthlySales,
  getPaymentMethodBreakdown,
  getReceivablesAging,
  getSalesByCategory,
  getTopProducts,
  TODAY,
} from "@/lib/data";
import { daysBetween, formatCurrency, formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  const monthly = getMonthlySales();
  const totalSales = monthly.reduce((a, m) => a + m.sales, 0);
  const totalProfit = monthly.reduce((a, m) => a + m.profit, 0);
  const totalOrders = monthly.reduce((a, m) => a + m.orders, 0);
  const aging = getReceivablesAging();
  const methods = getPaymentMethodBreakdown();
  const top = getTopProducts(10);
  const categories = getSalesByCategory();
  const catTotal = categories.reduce((a, c) => a + c.value, 0);
  const expiring = getExpiringProducts(120);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Sales performance, profitability, receivables and stock risk."
        actions={
          <>
            <PrintButton />
            <Button>
              <Download /> Export PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sales (12 months)" value={formatCurrency(totalSales, { whole: true })} icon={TrendingUp} tone="blue" />
        <StatCard label="Gross profit" value={formatCurrency(totalProfit, { whole: true })} icon={Wallet} tone="emerald" />
        <StatCard
          label="Gross margin"
          value={`${((totalProfit / Math.max(1, totalSales)) * 100).toFixed(1)}%`}
          icon={Percent}
          tone="violet"
        />
        <StatCard
          label="Average order value"
          value={formatCurrency(totalSales / Math.max(1, totalOrders), { whole: true })}
          icon={ShoppingBag}
          tone="sky"
          hint={`${formatNumber(totalOrders)} orders`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Sales vs gross profit</CardTitle>
              <CardDescription>Monthly, last 12 months</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesTrendChart data={monthly} height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Orders per month</CardTitle>
              <CardDescription>Excludes cancelled orders</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pl-0">
            <SimpleBarChart
              data={monthly.map((m) => ({ label: m.label.replace(" (MTD)", "*"), orders: m.orders }))}
              xKey="label"
              yKey="orders"
              name="Orders"
              valueType="number"
              height={280}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Receivables aging</CardTitle>
              <CardDescription>Open balances by days past due</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pl-0">
            <SimpleBarChart
              data={aging}
              xKey="label"
              yKey="value"
              name="Balance"
              colors={["var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-6)", "var(--destructive)"]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Collections by payment method</CardTitle>
              <CardDescription>Last 90 days</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pl-0">
            <SimpleBarChart data={methods} xKey="method" yKey="value" name="Collected" />
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="gap-0 pb-0">
          <CardHeader className="pb-4">
            <div>
              <CardTitle>Best sellers</CardTitle>
              <CardDescription>Top 10 by revenue, last 90 days</CardDescription>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((p, i) => (
                <TableRow key={p.name}>
                  <TableCell className="text-muted-foreground tabular">{i + 1}</TableCell>
                  <TableCell className="max-w-[300px] truncate font-medium">{p.name}</TableCell>
                  <TableCell className="text-right tabular">{formatNumber(p.quantity)}</TableCell>
                  <TableCell className="text-right font-semibold tabular">{formatCurrency(p.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="space-y-6">
          <Card className="gap-0 pb-0">
            <CardHeader className="pb-4">
              <div>
                <CardTitle>Category performance</CardTitle>
                <CardDescription>Revenue share, last 90 days</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              {categories.map((c) => {
                const pct = (c.value / catTotal) * 100;
                return (
                  <div key={c.category}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{c.category}</span>
                      <span className="tabular text-muted-foreground">
                        {formatCurrency(c.value, { compact: true })} · {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6 gap-0 pb-0">
        <CardHeader className="pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-red-500" /> Expiry watchlist
            </CardTitle>
            <CardDescription>Products expiring within 120 days — prioritize for sale or return to supplier</CardDescription>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Value at cost</TableHead>
              <TableHead>Expiry date</TableHead>
              <TableHead className="text-right">Days left</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiring.map((p) => {
              const days = daysBetween(TODAY, p.expiryDate!);
              return (
                <TableRow key={p.id}>
                  <TableCell className="max-w-[300px] truncate font-medium">{p.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className="text-muted-foreground">{p.supplier}</TableCell>
                  <TableCell className="text-right tabular">{p.stock}</TableCell>
                  <TableCell className="text-right tabular">{formatCurrency(p.stock * p.costPrice)}</TableCell>
                  <TableCell>{formatDate(p.expiryDate)}</TableCell>
                  <TableCell
                    className={`text-right font-semibold tabular ${days <= 60 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"}`}
                  >
                    {days}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

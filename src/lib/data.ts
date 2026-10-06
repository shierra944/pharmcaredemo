/**
 * Mock data layer.
 *
 * Everything is read from the JSON files in /src/data. When a real database is
 * introduced, replace the functions in this file (keep their signatures) and
 * the pages will keep working.
 *
 * "Today" is pinned to `meta.asOfDate` so the demo numbers stay meaningful no
 * matter when the app is run.
 */
import productsJson from "@/data/products.json";
import customersJson from "@/data/customers.json";
import ordersJson from "@/data/orders.json";
import invoicesJson from "@/data/invoices.json";
import paymentsJson from "@/data/payments.json";
import movementsJson from "@/data/inventory-movements.json";
import notificationsJson from "@/data/notifications.json";
import metaJson from "@/data/meta.json";
import type {
  AppNotification,
  Customer,
  InventoryMovement,
  Invoice,
  Meta,
  Order,
  Payment,
  Product,
} from "@/lib/types";

export const meta = metaJson as unknown as Meta;
export const TODAY = meta.asOfDate;

export const getProducts = () => productsJson as unknown as Product[];
export const getCustomers = () => customersJson as unknown as Customer[];
export const getOrders = () => ordersJson as unknown as Order[];
export const getInvoices = () => invoicesJson as unknown as Invoice[];
export const getPayments = () => paymentsJson as unknown as Payment[];
export const getInventoryMovements = () => movementsJson as unknown as InventoryMovement[];
export const getNotifications = () => notificationsJson as unknown as AppNotification[];

export { CATEGORIES, getStockStatus } from "@/lib/constants";
import { getStockStatus } from "@/lib/constants";

const activeOrders = () => getOrders().filter((o) => o.status !== "Cancelled");
const monthKey = (date: string) => date.slice(0, 7);

function sum<T>(rows: T[], pick: (row: T) => number) {
  return rows.reduce((acc, r) => acc + pick(r), 0);
}

function pctChange(current: number, previous: number) {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

function shiftDays(date: string, days: number) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

function shiftMonth(key: string, months: number) {
  const [y, m] = key.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + months, 1));
  return dt.toISOString().slice(0, 7);
}

export function getDashboardStats() {
  const orders = activeOrders();
  const products = getProducts();
  const payments = getPayments();
  const invoices = getInvoices();

  const yesterday = shiftDays(TODAY, -1);
  const thisMonth = monthKey(TODAY);
  const lastMonth = shiftMonth(thisMonth, -1);
  const dayOfMonth = Number(TODAY.slice(8, 10));
  const lastMonthSameDay = `${lastMonth}-${String(dayOfMonth).padStart(2, "0")}`;

  const salesToday = sum(orders.filter((o) => o.date === TODAY), (o) => o.total);
  const salesYesterday = sum(orders.filter((o) => o.date === yesterday), (o) => o.total);
  const salesMonth = sum(orders.filter((o) => monthKey(o.date) === thisMonth), (o) => o.total);
  // month-to-date vs the same period last month
  const salesLastMonthToDate = sum(
    orders.filter((o) => monthKey(o.date) === lastMonth && o.date <= lastMonthSameDay),
    (o) => o.total,
  );

  const collectionsToday = sum(payments.filter((p) => p.date === TODAY), (p) => p.amount);
  const collectionsCountToday = payments.filter((p) => p.date === TODAY).length;

  const openInvoices = invoices.filter((i) => i.balance > 0);
  const receivables = sum(openInvoices, (i) => i.balance);
  const overdue = sum(invoices.filter((i) => i.status === "Overdue"), (i) => i.balance);

  const inventoryValue = sum(products, (p) => p.stock * p.costPrice);
  const retailValue = sum(products, (p) => p.stock * p.sellingPrice);
  const lowStock = products.filter((p) => getStockStatus(p) !== "In Stock");

  return {
    salesToday,
    salesTodayChange: pctChange(salesToday, salesYesterday),
    ordersToday: orders.filter((o) => o.date === TODAY).length,
    salesMonth,
    salesMonthChange: pctChange(salesMonth, salesLastMonthToDate),
    collectionsToday,
    collectionsCountToday,
    receivables,
    overdue,
    openInvoiceCount: openInvoices.length,
    inventoryValue,
    retailValue,
    lowStockCount: lowStock.length,
    outOfStockCount: lowStock.filter((p) => p.stock <= 0).length,
  };
}

/** Last 12 months of sales and gross profit. */
export function getMonthlySales() {
  const orders = activeOrders();
  const costById = new Map(getProducts().map((p) => [p.id, p.costPrice]));
  const current = monthKey(TODAY);
  const months = Array.from({ length: 12 }, (_, i) => shiftMonth(current, i - 11));

  return months.map((key) => {
    const rows = orders.filter((o) => monthKey(o.date) === key);
    const sales = sum(rows, (o) => o.total);
    const cost = sum(rows, (o) =>
      sum(o.items, (it) => it.quantity * (costById.get(it.productId) ?? it.unitPrice * 0.6)),
    );
    const [y, m] = key.split("-").map(Number);
    const label = new Date(y, m - 1, 1).toLocaleDateString("en-PH", { month: "short" });
    return {
      month: key,
      label: key === current ? `${label} (MTD)` : label,
      sales,
      profit: sales - cost,
      orders: rows.length,
    };
  });
}

export function getTopProducts(limit = 10, sinceDays = 90) {
  const since = shiftDays(TODAY, -sinceDays);
  const totals = new Map<string, { name: string; quantity: number; revenue: number }>();
  for (const o of activeOrders()) {
    if (o.date < since) continue;
    for (const it of o.items) {
      const t = totals.get(it.productId) ?? { name: it.name, quantity: 0, revenue: 0 };
      t.quantity += it.quantity;
      t.revenue += it.total;
      totals.set(it.productId, t);
    }
  }
  return [...totals.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((t) => ({ ...t, shortName: t.name.replace(/\s*\(.*\)\s*/, "") }));
}

export function getSalesByCategory(sinceDays = 90) {
  const since = shiftDays(TODAY, -sinceDays);
  const totals = new Map<string, number>();
  for (const o of activeOrders()) {
    if (o.date < since) continue;
    for (const it of o.items) totals.set(it.category, (totals.get(it.category) ?? 0) + it.total);
  }
  return [...totals.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

export function getRecentOrders(limit = 6) {
  return [...getOrders()]
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, limit);
}

export function getRecentPayments(limit = 6) {
  return [...getPayments()].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, limit);
}

export function getReceivablesAging() {
  const buckets = [
    { label: "Current", min: -Infinity, max: 0, value: 0 },
    { label: "1–30 days", min: 1, max: 30, value: 0 },
    { label: "31–60 days", min: 31, max: 60, value: 0 },
    { label: "61–90 days", min: 61, max: 90, value: 0 },
    { label: "90+ days", min: 91, max: Infinity, value: 0 },
  ];
  const todayMs = Date.parse(TODAY);
  for (const inv of getInvoices()) {
    if (inv.balance <= 0) continue;
    const daysPastDue = Math.round((todayMs - Date.parse(inv.dueDate)) / 86_400_000);
    const b = buckets.find((x) => daysPastDue >= x.min && daysPastDue <= x.max);
    if (b) b.value += inv.balance;
  }
  return buckets.map(({ label, value }) => ({ label, value }));
}

export function getPaymentMethodBreakdown(sinceDays = 90) {
  const since = shiftDays(TODAY, -sinceDays);
  const totals = new Map<string, number>();
  for (const p of getPayments()) {
    if (p.date < since) continue;
    totals.set(p.method, (totals.get(p.method) ?? 0) + p.amount);
  }
  return [...totals.entries()].map(([method, value]) => ({ method, value })).sort((a, b) => b.value - a.value);
}

export function getExpiringProducts(withinDays = 90) {
  const limit = shiftDays(TODAY, withinDays);
  return getProducts()
    .filter((p) => p.expiryDate && p.expiryDate <= limit)
    .sort((a, b) => (a.expiryDate ?? "").localeCompare(b.expiryDate ?? ""));
}

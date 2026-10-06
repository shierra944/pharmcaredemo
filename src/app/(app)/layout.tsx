import { AppShell } from "@/components/layout/app-shell";
import { getInvoices, getNotifications, getProducts, getStockStatus, meta } from "@/lib/data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const lowStock = getProducts().filter((p) => getStockStatus(p) !== "In Stock").length;
  const overdue = getInvoices().filter((i) => i.status === "Overdue").length;

  return (
    <AppShell
      badges={{ lowStock, overdue }}
      branch={meta.branch}
      asOfDate={meta.asOfDate}
      user={meta.user}
      notifications={getNotifications()}
    >
      {children}
    </AppShell>
  );
}

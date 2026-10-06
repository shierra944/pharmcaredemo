import type { Metadata } from "next";
import { Crown, ReceiptText, UserCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { CustomersTable } from "@/components/customers/customers-table";
import { getCustomers, TODAY } from "@/lib/data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };

export default function CustomersPage() {
  const customers = getCustomers();
  const month = TODAY.slice(0, 7);
  const activeThisMonth = customers.filter((c) => c.lastPurchaseDate?.startsWith(month)).length;
  const receivables = customers.reduce((a, c) => a + c.outstandingBalance, 0);
  const withBalance = customers.filter((c) => c.outstandingBalance > 0).length;
  const top = [...customers].filter((c) => c.type !== "walkin").sort((a, b) => b.totalPurchases - a.totalPurchases)[0];

  return (
    <>
      <PageHeader title="Customers" description="Clinics, partner pharmacies, businesses and individual buyers." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" value={formatNumber(customers.length)} icon={Users} tone="blue" hint="Including walk-in sales" />
        <StatCard label="Active this month" value={formatNumber(activeThisMonth)} icon={UserCheck} tone="emerald" hint="Purchased in the current month" />
        <StatCard
          label="Outstanding balance"
          value={formatCurrency(receivables, { whole: true })}
          icon={ReceiptText}
          tone="amber"
          hint={`${withBalance} customers with balance`}
        />
        <StatCard
          label="Top customer"
          value={formatCurrency(top?.totalPurchases ?? 0, { compact: true })}
          icon={Crown}
          tone="violet"
          hint={top?.name}
        />
      </div>

      <div className="mt-6">
        <CustomersTable customers={customers} />
      </div>
    </>
  );
}

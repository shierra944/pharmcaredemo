import type { Metadata } from "next";
import { AlarmClock, HandCoins, Percent, ReceiptText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { PaymentsView } from "@/components/payments/payments-view";
import { getInvoices, getPayments, TODAY } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Payments" };

export default function PaymentsPage() {
  const invoices = [...getInvoices()].sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.id.localeCompare(a.id));
  const payments = [...getPayments()].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  const month = TODAY.slice(0, 7);
  const receivables = invoices.reduce((a, i) => a + i.balance, 0);
  const overdueInv = invoices.filter((i) => i.status === "Overdue");
  const overdue = overdueInv.reduce((a, i) => a + i.balance, 0);
  const collectedMonth = payments.filter((p) => p.date.startsWith(month)).reduce((a, p) => a + p.amount, 0);
  const billed = invoices.reduce((a, i) => a + i.amountDue, 0);
  const collected = invoices.reduce((a, i) => a + i.amountPaid, 0);

  return (
    <>
      <PageHeader title="Payments" description="Invoices, collections and accounts receivable." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding receivables"
          value={formatCurrency(receivables, { whole: true })}
          icon={ReceiptText}
          tone="amber"
          hint={`${invoices.filter((i) => i.balance > 0).length} open invoices`}
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(overdue, { whole: true })}
          icon={AlarmClock}
          tone="red"
          hint={`${overdueInv.length} invoices past due`}
        />
        <StatCard
          label="Collected this month"
          value={formatCurrency(collectedMonth, { whole: true })}
          icon={HandCoins}
          tone="emerald"
          hint="Month to date"
        />
        <StatCard
          label="Collection rate"
          value={`${((collected / Math.max(1, billed)) * 100).toFixed(1)}%`}
          icon={Percent}
          tone="blue"
          hint="Of all billed invoices, last 12 months"
        />
      </div>

      <div className="mt-6">
        <PaymentsView initialInvoices={invoices} initialPayments={payments} today={TODAY} />
      </div>
    </>
  );
}

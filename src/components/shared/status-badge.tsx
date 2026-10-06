import { Badge } from "@/components/ui/badge";

type Variant = "success" | "info" | "warning" | "danger" | "neutral";

const MAP: Record<string, Variant> = {
  // stock
  "In Stock": "success",
  "Low Stock": "warning",
  "Out of Stock": "danger",
  // orders / invoices
  Paid: "success",
  Partial: "info",
  Unpaid: "warning",
  Overdue: "danger",
  Cancelled: "neutral",
  // inventory
  "Stock In": "success",
  "Stock Out": "info",
};

export function StatusBadge({ status }: { status: string }) {
  const variant = MAP[status] ?? "neutral";
  return (
    <Badge variant={variant}>
      <span
        className={
          {
            success: "size-1.5 rounded-full bg-emerald-500",
            info: "size-1.5 rounded-full bg-blue-500",
            warning: "size-1.5 rounded-full bg-amber-500",
            danger: "size-1.5 rounded-full bg-red-500",
            neutral: "size-1.5 rounded-full bg-slate-400",
          }[variant]
        }
      />
      {status}
    </Badge>
  );
}

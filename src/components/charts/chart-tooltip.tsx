"use client";

import { formatCurrency, formatNumber } from "@/lib/utils";

interface TooltipEntry {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  payload?: Record<string, unknown>;
  dataKey?: string | number;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueType = "currency",
  labelKey,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  valueType?: "currency" | "number";
  labelKey?: string;
}) {
  if (!active || !payload?.length) return null;
  const heading = labelKey ? String(payload[0]?.payload?.[labelKey] ?? label ?? "") : label;

  return (
    <div className="min-w-40 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      {heading !== undefined && heading !== "" && <div className="mb-1.5 font-medium text-foreground">{heading}</div>}
      <div className="space-y-1">
        {payload.map((p, i) => {
          const v = Number(Array.isArray(p.value) ? p.value[0] : p.value ?? 0);
          return (
            <div key={`${p.dataKey ?? i}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full" style={{ background: p.color ?? (p.payload?.fill as string) }} />
                {p.name}
              </span>
              <span className="font-semibold text-foreground tabular">
                {valueType === "currency" ? formatCurrency(v) : formatNumber(v)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

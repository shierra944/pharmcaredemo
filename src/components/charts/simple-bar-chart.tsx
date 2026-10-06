"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { formatCurrency, formatNumber } from "@/lib/utils";

/** Vertical bar chart for a single numeric series (e.g. receivables aging, orders per month). */
export function SimpleBarChart<T extends Record<string, string | number>>({
  data,
  xKey,
  yKey,
  name,
  height = 260,
  valueType = "currency",
  colors,
}: {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  name: string;
  height?: number;
  valueType?: "currency" | "number";
  colors?: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={valueType === "currency" ? 64 : 40}
          tickFormatter={(v: number) => (valueType === "currency" ? formatCurrency(v, { compact: true }) : formatNumber(v))}
        />
        <Tooltip content={<ChartTooltip valueType={valueType} />} />
        <Bar dataKey={yKey} name={name} radius={[6, 6, 0, 0]} maxBarSize={44} fill="var(--chart-1)">
          {colors && data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

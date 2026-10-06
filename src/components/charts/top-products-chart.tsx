"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "./chart-tooltip";
import { formatCurrency } from "@/lib/utils";

export interface TopProduct {
  name: string;
  shortName: string;
  quantity: number;
  revenue: number;
}

const truncate = (s: string, n = 24) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function TopProductsChart({ data, height = 360 }: { data: TopProduct[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }} barCategoryGap={6}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatCurrency(v, { compact: true })}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          tickLine={false}
          axisLine={false}
          width={170}
          tickFormatter={(v: string) => truncate(v)}
        />
        <Tooltip content={<ChartTooltip labelKey="name" />} />
        <Bar dataKey="revenue" name="Revenue" fill="var(--chart-1)" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}

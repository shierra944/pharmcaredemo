import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const peso = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pesoCompact = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  notation: "compact",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const pesoWhole = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number, opts?: { compact?: boolean; whole?: boolean }) {
  if (opts?.compact) return pesoCompact.format(value);
  if (opts?.whole) return pesoWhole.format(value);
  return peso.format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-PH").format(value);
}

/** Dates in the mock data are plain YYYY-MM-DD strings; parse them as local dates. */
export function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(value: string | null | undefined, style: "short" | "long" = "short") {
  if (!value) return "—";
  const date = value.length === 10 ? parseDate(value) : new Date(value);
  return date.toLocaleDateString("en-PH", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysBetween(from: string, to: string) {
  return Math.round((parseDate(to).getTime() - parseDate(from).getTime()) / 86_400_000);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

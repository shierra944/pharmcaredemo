import type { Metadata } from "next";
import { ProductsView } from "@/components/products/products-view";
import { getProducts, TODAY } from "@/lib/data";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  return (
    <ProductsView
      key={`${q ?? ""}|${status ?? ""}`}
      initialProducts={getProducts()}
      initialQuery={q ?? ""}
      initialStatus={status === "low" ? "attention" : "all"}
      asOfDate={TODAY}
    />
  );
}

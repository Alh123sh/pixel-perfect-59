import { createFileRoute } from "@tanstack/react-router";
import { ProductGrid } from "@/components/site/ProductGrid";
import { useCatalog } from "@/lib/storefront";

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): { need?: string } => (typeof s["need"] === "string" ? { need: s["need"] } : {}),
  head: () => ({
    meta: [
      { title: "Shop All — 63rd Street Apothecary" },
      { name: "description", content: "Shop skincare, makeup, haircare, bodycare, sun care, and gift sets from 63rd Street Apothecary." },
      { property: "og:title", content: "Shop All — 63rd Street Apothecary" },
      { property: "og:description", content: "Browse the full collection of small-batch bath, body, and home products." },
    ],
  }),
  pendingComponent: () => <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-16 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-secondary" />)}</div>,
  component: Shop,
});

function Shop() {
  const { need } = Route.useSearch();
  const { products } = useCatalog();
  return <ProductGrid title="Shop All" intro="Every bar, balm, and candle — made by hand in small batches." items={products} initialNeed={need} />;
}

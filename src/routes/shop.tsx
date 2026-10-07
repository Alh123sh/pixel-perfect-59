import { createFileRoute } from "@tanstack/react-router";
import { ProductGrid } from "@/components/site/ProductGrid";
import { products } from "@/lib/products";

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>) => ({ need: typeof s.need === "string" ? s.need : undefined }),
  head: () => ({
    meta: [
      { title: "Shop All — 63rd Street Apothecary" },
      { name: "description", content: "Browse handmade soaps, candles, skincare and bath goods." },
      { property: "og:title", content: "Shop All — 63rd Street Apothecary" },
      { property: "og:description", content: "Browse handmade soaps, candles, skincare and bath goods." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { need } = Route.useSearch();
  return <ProductGrid title="Shop All" intro="Every bar, balm and candle — made by hand in small batches." items={products} initialNeed={need} />;
}

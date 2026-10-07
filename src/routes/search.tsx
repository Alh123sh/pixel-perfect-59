import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/lib/products";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s["q"] === "string" ? { q: s["q"] } : {}),
  head: () => ({ meta: [{ title: "Search — 63rd Street Apothecary" }, { name: "description", content: "Search our handmade products." }, { property: "og:title", content: "Search" }, { property: "og:description", content: "Search our handmade products." }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const t = q.toLowerCase();
  const res = products.filter((p) => [p.name, p.scent, p.category, p.description].join(" ").toLowerCase().includes(t));
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <p className="eyebrow">Search results</p>
      <h1 className="mt-2 text-5xl">“{q}”</h1>
      {res.length === 0 ? <p className="py-20 font-serif text-2xl">No matches — try “lavender” or “candle”.</p> :
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">{res.map((p) => <ProductCard key={p.slug} product={p} />)}</div>}
    </div>
  );
}

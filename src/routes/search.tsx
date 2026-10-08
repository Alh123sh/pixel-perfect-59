import { createFileRoute, Link } from "@tanstack/react-router";
import { popularSearches } from "@/lib/products";
import { useCatalog } from "@/lib/storefront";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s["q"] === "string" ? { q: s["q"] } : {}),
  head: () => ({ meta: [{ title: "Search — 63rd Street Apothecary" }, { name: "description", content: "Search bath, body, skincare, soaps, and candles." }, { property: "og:title", content: "Search" }, { property: "og:description", content: "Search our handmade products." }] }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const { products } = useCatalog();
  const query = q.trim().toLowerCase();
  const res = query ? products.filter((product) => `${product.name} ${product.scent} ${product.description} ${product.productType}`.toLowerCase().includes(query)) : [];
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <p className="eyebrow">Search</p>
      <h1 className="mt-2 text-5xl">{q ? `“${q}”` : "Search the shop"}</h1>
      {!q.trim() && (
        <div className="mt-8">
          <p className="eyebrow">Popular searches</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {popularSearches.map((term) => <Link key={term} to="/search" search={{ q: term }} className="border px-4 py-2 text-sm">{term}</Link>)}
          </div>
        </div>
      )}
      {q.trim() && res.length === 0 && <p className="py-20 font-serif text-2xl">No matches. Try “lavender” or “candle”.</p>}
      {res.length > 0 && <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">{res.map((p) => <ProductCard key={p.slug} product={p} />)}</div>}
    </div>
  );
}

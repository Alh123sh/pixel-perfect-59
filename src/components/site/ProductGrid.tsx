import { useMemo, useState } from "react";
import { needs, type Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ title, intro, items, initialNeed }: { title: string; intro: string; items: Product[]; initialNeed?: string | undefined }) {
  const [need, setNeed] = useState<string | undefined>(initialNeed);
  const [sort, setSort] = useState("featured");
  const list = useMemo(() => {
    let l = need ? items.filter((p) => p.needs.includes(need)) : items;
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    if (sort === "rating") l = [...l].sort((a, b) => b.rating - a.rating);
    return l;
  }, [items, need, sort]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="max-w-2xl"><h1 className="text-5xl md:text-6xl">{title}</h1><p className="mt-4 text-muted-foreground">{intro}</p></div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y py-4">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setNeed(undefined)} className={`px-4 py-2 text-xs uppercase tracking-[0.14em] ${!need ? "bg-foreground text-background" : "border"}`}>All</button>
          {needs.map((n) => (
            <button key={n.slug} onClick={() => setNeed(n.slug)} className={`px-4 py-2 text-xs uppercase tracking-[0.14em] ${need === n.slug ? "bg-foreground text-background" : "border"}`}>{n.name}</button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">{list.length} products</span>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} className="border bg-background px-3 py-2">
            <option value="featured">Featured</option><option value="rating">Top rated</option>
            <option value="low">Price: low to high</option><option value="high">Price: high to low</option>
          </select>
        </div>
      </div>
      {list.length === 0 ? <p className="py-24 text-center font-serif text-2xl">Nothing here yet — try another filter.</p> : (
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </div>
  );
}

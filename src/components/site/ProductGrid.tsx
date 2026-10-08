import { Link } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Product } from "@/lib/types";
import { FilterFields, applyFilters, emptyFilters, sortOptions, type Filters } from "./FilterSidebar";
import { ProductCard } from "./ProductCard";

const PAGE = 8;

export function ProductGrid({
  title,
  intro,
  items,
  initialNeed,
  hideCategory = false,
  crumbs,
}: {
  title: string;
  intro: string;
  items: Product[];
  initialNeed?: string | undefined;
  hideCategory?: boolean;
  crumbs?: { label: string; to?: "/" | "/shop" }[];
}) {
  const [filters, setFilters] = useState<Filters>(emptyFilters());
  const [visible, setVisible] = useState(PAGE);
  const [open, setOpen] = useState(false);

  const scoped = useMemo(() => {
    if (!initialNeed) return items;
    return items.filter((p) => p.rituals.includes(initialNeed) || p.needs.includes(initialNeed));
  }, [items, initialNeed]);

  const list = useMemo(() => applyFilters(scoped, filters), [scoped, filters]);

  useEffect(() => { setVisible(PAGE); }, [filters, initialNeed]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <nav className="text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        {crumbs?.map((c) => (
          <span key={c.label}> / {c.to ? <Link to={c.to}>{c.label}</Link> : <span className="text-foreground">{c.label}</span>}</span>
        ))}
        {!crumbs && <> / <span className="text-foreground">{title}</span></>}
      </nav>
      <div className="mt-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">{intro}</p>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-3 border-y py-4">
        <button type="button" className="btn btn-outline lg:hidden" onClick={() => setOpen(true)}><SlidersHorizontal className="h-4 w-4" /> Filters</button>
        <label className="sr-only" htmlFor="catalog-search">Search products</label>
        <input id="catalog-search" value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} placeholder="Search this collection" className="min-w-48 flex-1 border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
        <label className="sr-only" htmlFor="sort">Sort</label>
        <select id="sort" aria-label="Sort" value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="border bg-background px-3 py-3 text-sm">
          {sortOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <span className="text-sm text-muted-foreground">{list.length} products</span>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <FilterFields items={scoped} filters={filters} setFilters={setFilters} hideCategory={hideCategory} />
          <button type="button" className="mt-4 text-xs uppercase tracking-[0.16em] underline" onClick={() => setFilters(emptyFilters())}>Clear filters</button>
        </aside>
        <div>
          {list.length === 0 ? (
            <p className="py-24 text-center font-serif text-2xl">Nothing matches those filters yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {list.slice(0, visible).map((p) => <ProductCard key={p.slug} product={p} />)}
              </div>
              {visible < list.length && (
                <div className="mt-12 text-center">
                  <button type="button" className="btn btn-outline" onClick={() => setVisible((n) => n + PAGE)}>Load more</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader><SheetTitle className="font-serif text-3xl">Filters</SheetTitle></SheetHeader>
          <FilterFields items={scoped} filters={filters} setFilters={setFilters} hideCategory={hideCategory} />
          <button type="button" className="btn btn-primary mt-6 w-full" onClick={() => setOpen(false)}>Show {list.length} products</button>
        </SheetContent>
      </Sheet>
    </div>
  );
}

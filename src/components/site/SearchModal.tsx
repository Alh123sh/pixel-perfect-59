import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { money, popularSearches } from "@/lib/products";
import { useCatalog } from "@/lib/storefront";

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const catalog = useCatalog();
  const products = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return catalog.products.filter((product) => `${product.name} ${product.scent} ${product.description} ${product.productType}`.toLowerCase().includes(query));
  }, [q, catalog.products]);
  const cats = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return catalog.categories.filter((category) => `${category.name} ${category.blurb}`.toLowerCase().includes(query));
  }, [q, catalog.categories]);
  const trending = catalog.products.filter((product) => product.badge === "Best Seller").slice(0, 4);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => input.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { window.clearTimeout(t); document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  function go(query: string) {
    onClose();
    navigate({ to: "/search", search: { q: query } });
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label="Search">
          <button className="absolute inset-0 bg-ink/50" aria-label="Close search" onClick={onClose} />
          <motion.div initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.28 }}
            className="relative mx-auto mt-0 max-h-[100dvh] overflow-y-auto bg-background px-5 py-8 md:mt-10 md:max-h-[80vh] md:max-w-3xl md:px-10">
            <form className="flex items-center gap-3 border-b pb-4" onSubmit={(e) => { e.preventDefault(); go(q); }}>
              <Search className="h-5 w-5" strokeWidth={1.5} />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search soaps, candles, rituals…" aria-label="Search"
                className="w-full bg-transparent font-serif text-3xl outline-none" />
              <button type="button" aria-label="Close" onClick={onClose}><X className="h-5 w-5" /></button>
            </form>
            {!q.trim() ? (
              <div className="mt-8 grid gap-10 md:grid-cols-2">
                <div>
                  <p className="eyebrow">Popular searches</p>
                  <ul className="mt-4 space-y-2">
                    {popularSearches.map((term) => (
                      <li key={term}><button type="button" className="font-serif text-2xl" onClick={() => setQ(term)}>{term}</button></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="eyebrow">Trending products</p>
                  <ul className="mt-4 space-y-4">
                    {trending.map((p) => (
                      <li key={p.slug}>
                        <Link to="/product/$slug" params={{ slug: p.slug }} onClick={onClose} className="flex items-center gap-3">
                          <img src={p.image} alt="" className="h-16 w-14 object-cover" />
                          <span><span className="block font-serif text-lg">{p.name}</span><span className="text-sm text-muted-foreground">{money(p.price)}</span></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                <div>
                  <p className="eyebrow">Categories</p>
                  {cats.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No matching categories.</p> : (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {cats.map((c) => <li key={c.slug}><Link to="/category/$slug" params={{ slug: c.slug }} onClick={onClose} className="border px-3 py-2 text-sm">{c.name}</Link></li>)}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="eyebrow">Products</p>
                  {products.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No products for “{q}”.</p> : (
                    <ul className="mt-4 divide-y">
                      {products.map((p) => (
                        <li key={p.slug}>
                          <Link to="/product/$slug" params={{ slug: p.slug }} onClick={onClose} className="flex items-center gap-4 py-3">
                            <img src={p.image} alt="" className="h-16 w-14 object-cover" />
                            <span className="flex-1 font-serif text-xl">{p.name}</span>
                            <span className="text-sm">{money(p.price)}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="button" className="btn btn-outline" onClick={() => go(q)}>View all results</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

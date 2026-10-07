import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./products";

type Line = { slug: string; qty: number };
type Ctx = {
  lines: (Line & { product: Product })[];
  count: number; subtotal: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  wishlist: string[]; toggleWish: (slug: string) => void;
  cartOpen: boolean; setCartOpen: (o: boolean) => void;
};
const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Line[]>([]);
  const [wishlist, setWish] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("63rd-cart") || "[]"));
      setWish(JSON.parse(localStorage.getItem("63rd-wish") || "[]"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("63rd-cart", JSON.stringify(cart)); }, [cart, ready]);
  useEffect(() => { if (ready) localStorage.setItem("63rd-wish", JSON.stringify(wishlist)); }, [wishlist, ready]);

  const lines = cart.flatMap((l) => { const p = getProduct(l.slug); return p ? [{ ...l, product: p }] : []; });
  const value: Ctx = {
    lines,
    count: lines.reduce((a, l) => a + l.qty, 0),
    subtotal: lines.reduce((a, l) => a + l.qty * l.product.price, 0),
    add: (slug, qty = 1) => {
      setCart((c) => c.some((l) => l.slug === slug) ? c.map((l) => l.slug === slug ? { ...l, qty: l.qty + qty } : l) : [...c, { slug, qty }]);
      setCartOpen(true);
    },
    setQty: (slug, qty) => setCart((c) => qty <= 0 ? c.filter((l) => l.slug !== slug) : c.map((l) => l.slug === slug ? { ...l, qty } : l)),
    remove: (slug) => setCart((c) => c.filter((l) => l.slug !== slug)),
    clear: () => setCart([]),
    wishlist,
    toggleWish: (slug) => setWish((w) => w.includes(slug) ? w.filter((s) => s !== slug) : [...w, slug]),
    cartOpen, setCartOpen,
  };
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside provider");
  return c;
}

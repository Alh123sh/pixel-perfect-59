import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { getRelatedProducts } from "@/lib/api";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";
import { useIsMobile } from "@/hooks/use-mobile";

export const FREE_SHIPPING = 75;

export function QtyControl({ slug, qty, variantId }: { slug: string; qty: number; variantId?: string | undefined }) {
  const { setQty } = useStore();
  return (
    <div className="inline-flex items-center border">
      <button aria-label="Decrease quantity" className="p-2" onClick={() => setQty(slug, qty - 1, variantId)}>−</button>
      <span className="w-8 text-center text-sm">{qty}</span>
      <button aria-label="Increase quantity" className="p-2" onClick={() => setQty(slug, qty + 1, variantId)}>+</button>
    </div>
  );
}

export function ShippingProgress({ subtotal }: { subtotal: number }) {
  const left = FREE_SHIPPING - subtotal;
  return (
    <div>
      <p className="text-xs">{left > 0 ? <>You are <strong>{money(left)}</strong> away from free shipping.</> : "You have unlocked free shipping."}</p>
      <div className="mt-2 h-1 bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} /></div>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, remove } = useStore();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const mobile = useIsMobile();
  const suggest = getRelatedProducts(lines[0]?.slug ?? "lavender-oat-soap").filter((p) => !lines.some((l) => l.slug === p.slug)).slice(0, 2);

  useEffect(() => {
    if (!cartOpen) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCartOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [cartOpen, setCartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button aria-label="Close cart" className="absolute inset-0 bg-ink/40" onClick={() => setCartOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute flex flex-col bg-background max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[92dvh] md:inset-y-0 md:right-0 md:w-full md:max-w-md"
            initial={mobile ? { y: "100%" } : { x: "100%" }}
            animate={mobile ? { y: 0 } : { x: 0 }}
            exit={mobile ? { y: "100%" } : { x: "100%" }}
            transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="flex items-center justify-between border-b px-6 py-5">
              <h2 id="cart-title" className="text-2xl">Your Bag</h2>
              <button ref={closeBtn} aria-label="Close cart" onClick={() => setCartOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="border-b px-6 py-4"><ShippingProgress subtotal={subtotal} /></div>
            <div className="flex-1 overflow-y-auto px-6">
              {lines.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-serif text-2xl">Your bag is empty</p>
                  <Link to="/shop" onClick={() => setCartOpen(false)} className="btn btn-outline mt-6">Continue shopping</Link>
                </div>
              ) : lines.map((l) => (
                <div key={l.key} className="flex gap-4 border-b py-5">
                  <img src={l.product.image} alt="" className="h-24 w-20 object-cover" />
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-serif text-lg leading-tight">{l.product.name}</p>
                      <p className="text-sm">{money(l.unit * l.qty)}</p>
                    </div>
                    {l.variantName && <p className="text-xs text-muted-foreground">{l.variantName}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyControl slug={l.slug} qty={l.qty} variantId={l.variantId} />
                      <button className="text-xs underline" onClick={() => remove(l.slug, l.variantId)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              {suggest.length > 0 && (
                <div className="py-6">
                  <p className="eyebrow">You may also like</p>
                  <div className="mt-4 space-y-3">
                    {suggest.map((p) => (
                      <Link key={p.slug} to="/product/$slug" params={{ slug: p.slug }} onClick={() => setCartOpen(false)} className="flex items-center gap-3">
                        <img src={p.image} alt="" className="h-16 w-14 object-cover" />
                        <span className="font-serif">{p.name}</span>
                        <span className="ml-auto text-sm">{money(p.price)}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {lines.length > 0 && (
              <div className="space-y-3 border-t px-6 py-6">
                <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
                <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                <Link to="/cart" onClick={() => setCartOpen(false)} className="btn btn-outline w-full">View cart</Link>
                <Link to="/checkout" onClick={() => setCartOpen(false)} className="btn btn-primary w-full">Checkout</Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

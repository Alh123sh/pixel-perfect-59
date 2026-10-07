import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";

export const FREE_SHIPPING = 75;

export function QtyControl({ slug, qty }: { slug: string; qty: number }) {
  const { setQty } = useStore();
  return (
    <div className="inline-flex items-center border">
      <button aria-label="Decrease" className="p-2" onClick={() => setQty(slug, qty - 1)}><Minus className="h-3 w-3" /></button>
      <span className="w-8 text-center text-sm">{qty}</span>
      <button aria-label="Increase" className="p-2" onClick={() => setQty(slug, qty + 1)}><Plus className="h-3 w-3" /></button>
    </div>
  );
}

export function ShippingProgress({ subtotal }: { subtotal: number }) {
  const left = FREE_SHIPPING - subtotal;
  return (
    <div>
      <p className="text-xs">{left > 0 ? <>You're <strong>{money(left)}</strong> away from free shipping</> : "You've unlocked free shipping"}</p>
      <div className="mt-2 h-1 bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} /></div>
    </div>
  );
}

export function CartDrawer() {
  const { cartOpen, setCartOpen, lines, subtotal, remove } = useStore();
  if (!cartOpen) return null;
  const close = () => setCartOpen(false);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={close} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background">
        <div className="flex items-center justify-between border-b px-6 py-5">
          <h2 className="text-2xl">Your Bag</h2>
          <button aria-label="Close cart" onClick={close}><X className="h-5 w-5" /></button>
        </div>
        <div className="border-b px-6 py-4"><ShippingProgress subtotal={subtotal} /></div>
        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl">Your bag is empty</p>
              <Link to="/shop" onClick={close} className="btn btn-outline mt-6">Start Shopping</Link>
            </div>
          ) : lines.map((l) => (
            <div key={l.slug} className="flex gap-4 border-b py-5">
              <img src={l.product.image} alt="" className="h-24 w-20 object-cover" />
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-2">
                  <p className="font-serif text-lg leading-tight">{l.product.name}</p>
                  <p className="text-sm">{money(l.product.price * l.qty)}</p>
                </div>
                <p className="text-xs text-muted-foreground">{l.product.size}</p>
                <div className="mt-auto flex items-center justify-between">
                  <QtyControl slug={l.slug} qty={l.qty} />
                  <button className="text-xs underline" onClick={() => remove(l.slug)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="space-y-3 border-t px-6 py-6">
            <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
            <Link to="/checkout" onClick={close} className="btn btn-primary w-full">Checkout</Link>
            <Link to="/cart" onClick={close} className="btn btn-outline w-full">View Bag</Link>
          </div>
        )}
      </aside>
    </div>
  );
}

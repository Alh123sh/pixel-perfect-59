import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { QtyControl, ShippingProgress } from "@/components/site/CartDrawer";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Shopping Cart — 63rd Street Apothecary" }, { name: "description", content: "Review your bag, apply a code, and continue to checkout." }, { property: "og:title", content: "Shopping Cart" }, { property: "og:description", content: "Review your bag before checkout." }] }),
  component: Cart,
});

function Cart() {
  const { lines, saved, subtotal, shipping, discount, total, coupon, couponError, remove, saveForLater, moveToCart, removeSaved, applyCoupon, clearCoupon } = useStore();
  const [code, setCode] = useState(coupon);
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl">Shopping Cart</h1>
      {lines.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-2xl">Your cart is empty</p>
          <Link to="/shop" className="btn btn-outline mt-6">Continue shopping</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {lines.map((l) => (
              <div key={l.key} className="flex gap-5 border-b py-6">
                <img src={l.product.image} alt="" className="h-32 w-24 object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl">{l.product.name}</p>
                      {l.variantName && <p className="text-sm text-muted-foreground">{l.variantName}</p>}
                    </div>
                    <p>{money(l.unit * l.qty)}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
                    <QtyControl slug={l.slug} qty={l.qty} variantId={l.variantId} />
                    <button className="text-xs underline" onClick={() => saveForLater(l.slug, l.variantId)}>Save for later</button>
                    <button className="text-xs underline" onClick={() => remove(l.slug, l.variantId)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
            {saved.length > 0 && (
              <div className="mt-10">
                <h2 className="text-3xl">Saved for later</h2>
                {saved.map((l) => (
                  <div key={l.key} className="flex items-center gap-4 border-b py-4">
                    <img src={l.product.image} alt="" className="h-20 w-16 object-cover" />
                    <div className="flex-1">
                      <p className="font-serif text-lg">{l.product.name}</p>
                      <p className="text-sm text-muted-foreground">{money(l.unit)}</p>
                    </div>
                    <button className="text-xs underline" onClick={() => moveToCart(l.slug, l.variantId)}>Move to cart</button>
                    <button className="text-xs underline" onClick={() => removeSaved(l.slug, l.variantId)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            <Link to="/shop" className="link-underline mt-8 inline-block text-xs uppercase tracking-[0.18em]">Continue shopping</Link>
          </div>
          <aside className="h-fit space-y-4 bg-secondary p-6">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <ShippingProgress subtotal={subtotal} />
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); applyCoupon(code); }}>
              <label className="sr-only" htmlFor="code">Discount code</label>
              <input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Discount code" className="w-full border bg-background px-3 py-2 text-sm outline-none" />
              <button className="btn btn-outline px-4">Apply</button>
            </form>
            {coupon && !couponError && <p className="text-xs">{coupon} applied. <button className="underline" onClick={clearCoupon}>Remove</button></p>}
            {couponError && <p className="text-xs" role="alert">{couponError}</p>}
            <div className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></div>
              {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{money(discount)}</span></div>}
              <div className="flex justify-between pt-2 text-lg"><span>Estimated total</span><span>{money(total)}</span></div>
            </div>
            <Link to="/checkout" className="btn btn-primary w-full">Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}

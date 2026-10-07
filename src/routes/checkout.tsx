import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — 63rd Street Apothecary" }, { name: "description", content: "Complete your order." }, { property: "og:title", content: "Checkout" }, { property: "og:description", content: "Complete your order." }] }),
  component: Checkout,
});

const field = "w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

function Checkout() {
  const { lines, subtotal, clear } = useStore();
  const [done, setDone] = useState(false);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  if (done) return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-5xl">Thank you</h1>
      <p className="mt-4 text-muted-foreground">Your order is confirmed. This is a demo — no payment was taken.</p>
      <Link to="/" className="btn btn-outline mt-8">Back to Home</Link>
    </div>
  );
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-5">
      <form className="space-y-4 md:col-span-3" onSubmit={(e) => { e.preventDefault(); clear(); setDone(true); }}>
        <h1 className="text-5xl">Checkout</h1>
        <p className="eyebrow pt-4">Contact</p>
        <input required type="email" placeholder="Email" className={field} />
        <p className="eyebrow pt-4">Shipping address</p>
        <div className="grid grid-cols-2 gap-3"><input required placeholder="First name" className={field} /><input required placeholder="Last name" className={field} /></div>
        <input required placeholder="Address" className={field} />
        <div className="grid grid-cols-3 gap-3"><input required placeholder="City" className={field} /><input required placeholder="State" className={field} /><input required placeholder="ZIP" className={field} /></div>
        <button disabled={lines.length === 0} className="btn btn-primary w-full disabled:opacity-50">Place Order — {money(subtotal + shipping)}</button>
      </form>
      <aside className="h-fit space-y-4 bg-secondary p-6 md:col-span-2">
        {lines.map((l) => <div key={l.slug} className="flex justify-between text-sm"><span>{l.product.name} × {l.qty}</span><span>{money(l.qty * l.product.price)}</span></div>)}
        <div className="space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping ? money(shipping) : "Free"}</span></div>
          <div className="flex justify-between pt-2 text-lg"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
        </div>
      </aside>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — 63rd Street Apothecary" }, { name: "description", content: "A simple, secure checkout for your 63rd Street Apothecary order." }, { property: "og:title", content: "Checkout" }, { property: "og:description", content: "Complete your order." }] }),
  component: Checkout,
});

const field = "w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";
const steps = ["Information", "Shipping", "Payment", "Review"] as const;

function Checkout() {
  const { lines, subtotal, shipping, discount, customer, addresses, placeOrder, ready } = useStore();
  const saved = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderError, setOrderError] = useState("");
  const [placing, setPlacing] = useState(false);
  const idempotencyKey = useRef(crypto.randomUUID());
  const [form, setForm] = useState({
    email: customer.email,
    firstName: saved?.firstName || customer.firstName,
    lastName: saved?.lastName || customer.lastName,
    line1: saved?.line1 || "",
    city: saved?.city || "",
    state: saved?.state || "",
    zip: saved?.zip || "",
    delivery: "Standard · 3–5 business days",
    payment: "Card",
  });
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });
  useEffect(() => {
    if (!ready) return;
    const address = addresses.find((a) => a.isDefault) ?? addresses[0];
    setForm((current) => ({
      ...current,
      email: current.email || customer.email,
      firstName: current.firstName || address?.firstName || customer.firstName,
      lastName: current.lastName || address?.lastName || customer.lastName,
      line1: current.line1 || address?.line1 || "",
      city: current.city || address?.city || "",
      state: current.state || address?.state || "",
      zip: current.zip || address?.zip || "",
    }));
  }, [ready]);
  const express = form.delivery.startsWith("Express");
  const ship = express ? 12 : shipping;
  const pay = Math.max(0, subtotal - discount) + ship;

  if (order) return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="eyebrow">Order {order.id}</p>
      <h1 className="mt-3 text-5xl">Thank you</h1>
      <p className="mt-4 text-muted-foreground">Order {order.id} is saved with payment still pending. No card was charged. Payment is marked paid only after a provider confirms it.</p>
      <Link to="/account/orders" className="btn btn-outline mt-8">View orders</Link>
    </div>
  );

  if (lines.length === 0) return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="text-5xl">Your bag is empty</h1>
      <Link to="/shop" className="btn btn-outline mt-8">Continue shopping</Link>
    </div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 md:grid-cols-5">
      <div className="md:col-span-3">
        <ol className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em]" aria-label="Checkout steps">
          {steps.map((label, i) => (
            <li key={label} className={i === step ? "text-foreground" : "text-muted-foreground"}>
              <button type="button" disabled={i > step} onClick={() => i < step && setStep(i)}>{i + 1}. {label}</button>
            </li>
          ))}
        </ol>
        <form className="mt-8 space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (step < 3) { setStep(step + 1); return; }
          setPlacing(true);
          setOrderError("");
          try {
            const placed = await placeOrder({
              email: form.email,
              delivery: form.delivery,
              idempotencyKey: idempotencyKey.current,
              address: { id: "checkout", label: "Shipping", firstName: form.firstName, lastName: form.lastName, line1: form.line1, city: form.city, state: form.state, zip: form.zip, isDefault: false },
            });
            setOrder(placed);
          } catch (err) {
            setOrderError(err instanceof Error ? err.message : "Checkout could not be completed.");
          } finally {
            setPlacing(false);
          }
        }}>
          {step === 0 && (
            <>
              <h1 className="text-4xl">Information</h1>
              <label className="eyebrow" htmlFor="email">Contact</label>
              <input id="email" required type="email" placeholder="Email" value={form.email} onChange={set("email")} className={field} />
              <p className="eyebrow pt-2">Shipping address</p>
              <div className="grid grid-cols-2 gap-3">
                <input required aria-label="First name" placeholder="First name" value={form.firstName} onChange={set("firstName")} className={field} />
                <input required aria-label="Last name" placeholder="Last name" value={form.lastName} onChange={set("lastName")} className={field} />
              </div>
              <input required aria-label="Address" placeholder="Address" value={form.line1} onChange={set("line1")} className={field} />
              <div className="grid grid-cols-3 gap-3">
                <input required aria-label="City" placeholder="City" value={form.city} onChange={set("city")} className={field} />
                <input required aria-label="State" placeholder="State" value={form.state} onChange={set("state")} className={field} />
                <input required aria-label="ZIP" placeholder="ZIP" value={form.zip} onChange={set("zip")} className={field} />
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <h1 className="text-4xl">Shipping</h1>
              {["Standard · 3–5 business days", "Express · 1–2 business days"].map((option) => (
                <label key={option} className="flex cursor-pointer items-center gap-3 border p-4">
                  <input type="radio" name="delivery" checked={form.delivery === option} onChange={() => setForm({ ...form, delivery: option })} />
                  <span>{option}</span>
                  <span className="ml-auto text-sm">{option.startsWith("Express") ? money(12) : shipping ? money(shipping) : "Free"}</span>
                </label>
              ))}
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-4xl">Payment</h1>
              <p className="text-sm text-muted-foreground">Card numbers are not collected on this page. Placing the order creates an unpaid order. A payment provider has to confirm it before it is marked paid.</p>
            </>
          )}
          {step === 3 && (
            <>
              <h1 className="text-4xl">Review</h1>
              <div className="space-y-2 border p-5 text-sm">
                <p><span className="text-muted-foreground">Contact · </span>{form.email}</p>
                <p><span className="text-muted-foreground">Ship to · </span>{form.firstName} {form.lastName}, {form.line1}, {form.city}, {form.state} {form.zip}</p>
                <p><span className="text-muted-foreground">Delivery · </span>{form.delivery}</p>
                <p><span className="text-muted-foreground">Payment · </span>Pending until a provider confirms it</p>
              </div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            {step > 0 && <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>Back</button>}
            <button className="btn btn-primary flex-1" disabled={placing}>{placing ? "Placing order…" : step === 3 ? "Place unpaid order" : "Continue"}</button>
          </div>
          {orderError && <p className="text-sm" role="alert">{orderError}</p>}
        </form>
      </div>
      <aside className="h-fit space-y-4 bg-secondary p-6 md:col-span-2">
        <h2 className="font-serif text-2xl">Order summary</h2>
        {lines.map((l) => (
          <div key={l.key} className="flex justify-between gap-3 text-sm">
            <span>{l.product.name}{l.variantName ? ` · ${l.variantName}` : ""} × {l.qty}</span>
            <span>{money(l.qty * l.unit)}</span>
          </div>
        ))}
        <div className="space-y-1 border-t pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{ship ? money(ship) : "Free"}</span></div>
          {discount > 0 && <div className="flex justify-between"><span>Discount</span><span>−{money(discount)}</span></div>}
          <div className="flex justify-between pt-2 text-lg"><span>Total</span><span>{money(pay)}</span></div>
        </div>
      </aside>
    </div>
  );
}

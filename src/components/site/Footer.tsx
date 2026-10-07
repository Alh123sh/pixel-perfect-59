import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="bg-sage py-20 text-sage-foreground">
      <div className="mx-auto max-w-2xl px-5 text-center">
        <p className="eyebrow text-sage-foreground/70">The Apothecary Letter</p>
        <h2 className="mt-3 text-4xl md:text-5xl">Slow notes, new batches & 10% off</h2>
        {done ? <p className="mt-8">Thank you — check your inbox for your welcome note.</p> : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input required type="email" placeholder="Your email address" aria-label="Email"
              className="flex-1 border border-sage-foreground/30 bg-background/60 px-4 py-3.5 text-sm outline-none focus:border-sage-foreground" />
            <button className="btn bg-ink text-ink-foreground hover:bg-primary">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}

const cols = [
  { title: "Shop", links: [["All Products", "/shop"], ["Bath & Body", "/category/bath-body"], ["Skincare", "/category/skincare"], ["Candles", "/category/candles"], ["Gifts", "/category/gifts"]] },
  { title: "About", links: [["Our Story", "/about"], ["Journal", "/journal"], ["Contact", "/contact"]] },
  { title: "Help", links: [["FAQ", "/faq"], ["Shipping", "/shipping"], ["Returns", "/returns"], ["Privacy", "/privacy"], ["Terms", "/terms"]] },
] as const;

export function Footer() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-5 lg:px-8">
        <div className="md:col-span-2">
          <p className="font-serif text-3xl">63rd Street Apothecary</p>
          <p className="mt-4 max-w-sm text-sm text-ink-foreground/70">Small-batch bath, body, skincare and home goods, handcrafted with care.</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="eyebrow text-ink-foreground/60">{c.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {c.links.map(([l, to]) => <li key={to}><Link to={to} className="link-underline text-ink-foreground/85">{l}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ink-foreground/15 py-6 text-center text-xs text-ink-foreground/60">© 2026 63rd Street Apothecary. All rights reserved.</div>
    </footer>
  );
}

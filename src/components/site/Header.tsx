import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

const nav = [
  { label: "Shop", to: "/shop" },
  { label: "Bath & Body", to: "/category/bath-body" },
  { label: "Skincare", to: "/category/skincare" },
  { label: "Soaps", to: "/category/soaps" },
  { label: "Candles", to: "/category/candles" },
  { label: "Gifts", to: "/category/gifts" },
  { label: "About", to: "/about" },
  { label: "Journal", to: "/journal" },
] as const;

export function Logo() {
  return (
    <Link to="/" className="text-center leading-none">
      <span className="block font-serif text-2xl tracking-wide">63rd Street</span>
      <span className="block text-[0.55rem] uppercase tracking-[0.45em] text-muted-foreground">Apothecary</span>
    </Link>
  );
}

export function Header() {
  const { count, setCartOpen } = useStore();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  return (
    <>
      <div className="bg-ink py-2 text-center text-[0.68rem] uppercase tracking-[0.2em] text-ink-foreground">
        Handcrafted with care • Shop our newest collections
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" strokeWidth={1.5} /></button>
          <Logo />
          <nav className="hidden gap-7 lg:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="link-underline text-[0.72rem] uppercase tracking-[0.16em]"
                activeProps={{ className: "text-primary" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <button aria-label="Search" onClick={() => setSearching((s) => !s)}><Search className="h-5 w-5" strokeWidth={1.5} /></button>
            <Link to="/account" aria-label="Account" className="hidden sm:block"><User className="h-5 w-5" strokeWidth={1.5} /></Link>
            <Link to="/wishlist" aria-label="Wishlist" className="hidden sm:block"><Heart className="h-5 w-5" strokeWidth={1.5} /></Link>
            <button aria-label="Cart" className="relative" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {count > 0 && <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-primary text-[0.6rem] text-primary-foreground">{count}</span>}
            </button>
          </div>
        </div>
        {searching && (
          <form className="border-t" onSubmit={(e) => { e.preventDefault(); setSearching(false); navigate({ to: "/search", search: { q } }); }}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search soaps, candles, body butter…"
              className="mx-auto block w-full max-w-7xl bg-transparent px-5 py-5 font-serif text-2xl outline-none lg:px-8" />
          </form>
        )}
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="fade-up absolute inset-y-0 left-0 flex w-80 flex-col bg-background p-8">
            <button className="self-end" aria-label="Close" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            <nav className="mt-6 flex flex-col gap-5">
              {nav.map((n) => <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="font-serif text-2xl">{n.label}</Link>)}
            </nav>
            <div className="mt-auto flex gap-6 text-sm">
              <Link to="/account" onClick={() => setOpen(false)}>Account</Link>
              <Link to="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
              <Link to="/contact" onClick={() => setOpen(false)}>Contact</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

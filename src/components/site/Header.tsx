import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Facebook, Heart, Instagram, Menu, Search, ShoppingBag, User, X, Youtube } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { SearchModal } from "./SearchModal";

const shopLinks = [
  { label: "Skincare", slug: "skincare" },
  { label: "Bodycare", slug: "bath-body" },
  { label: "Gift Sets", slug: "gifts" },
] as const;

const shopAll = [
  { label: "Makeup" },
  { label: "Haircare" },
  { label: "Sun Care" },
] as const;

const collectionLinks = [
  { label: "Best Sellers", slug: "best-sellers" },
  { label: "New Arrivals", slug: "new-arrivals" },
  { label: "The Ritual Edit", slug: "ritual-edit" },
  { label: "Gifting", slug: "gifting" },
] as const;

const social = [
  { label: "Facebook", href: "https://www.facebook.com/", Icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/", Icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: Youtube },
] as const;

export function Logo() {
  return (
    <Link to="/" className="inline-flex items-center" aria-label="63rd Street Apothecary">
      <img src="/logo.png" alt="63rd Street Apothecary" className="h-11 w-11 shrink-0 object-contain lg:h-16 lg:w-16" />
    </Link>
  );
}

function ShopMenu() {
  return (
    <div className="group relative">
      <Link to="/shop" className="inline-flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-foreground hover:text-primary">
        Shop
        <ChevronDown className="h-3 w-3" />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-30 w-48 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-xl border bg-white py-2 shadow-lg">
          {shopLinks.map((item) => (
            <Link key={item.label} to="/category/$slug" params={{ slug: item.slug }} className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-primary">
              {item.label}
            </Link>
          ))}
          {shopAll.map((item) => (
            <Link key={item.label} to="/shop" className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollectionMenu() {
  return (
    <div className="group relative">
      <Link to="/collections/$slug" params={{ slug: "best-sellers" }} className="inline-flex items-center gap-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-foreground hover:text-primary">
        Collections
        <ChevronDown className="h-3 w-3" />
      </Link>
      <div className="invisible absolute left-1/2 top-full z-30 w-48 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-xl border bg-white py-2 shadow-lg">
          {collectionLinks.map((item) => (
            <Link key={item.label} to="/collections/$slug" params={{ slug: item.slug }} className="block px-4 py-2 text-sm text-foreground hover:bg-secondary hover:text-primary">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const { count, setCartOpen, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  return (
    <div className="sticky top-0 z-40">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-4 px-4 text-[0.7rem] sm:justify-between">
          <span className="hidden w-24 sm:block" />
          <p className="text-center tracking-wide">
            Free Shipping on orders over ₹999 <span className="mx-1.5 opacity-70">|</span> Use code: <span className="font-semibold">GLOW15</span> for 15% OFF
          </p>
          <div className="hidden items-center gap-3 sm:flex">
            {social.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} className="opacity-90 hover:opacity-100">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <header className="border-b border-border/80 bg-white/95 backdrop-blur">
        <div className="mx-auto grid h-16 grid-cols-3 items-center px-4 lg:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="justify-self-start p-2"><Menu className="h-5 w-5" strokeWidth={1.5} /></button>
          <div className="justify-self-center"><Logo /></div>
          <div className="flex items-center justify-self-end gap-1">
            <button aria-label="Search" className="p-2" onClick={() => setSearching(true)}><Search className="h-5 w-5" strokeWidth={1.5} /></button>
            <button aria-label="Cart" className="relative p-2" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {count > 0 && <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-primary text-[0.6rem] text-primary-foreground">{count}</span>}
            </button>
          </div>
        </div>
        <div className="relative mx-auto hidden h-[88px] max-w-7xl items-center justify-between px-8 lg:flex">
          <Logo />
          <nav className="absolute left-1/2 flex -translate-x-1/2 items-center gap-7" aria-label="Primary">
            <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="text-[0.68rem] font-medium uppercase tracking-[0.16em] hover:text-primary">Home</Link>
            <ShopMenu />
            <CollectionMenu />
            <Link to="/about" activeProps={{ className: "text-primary" }} className="text-[0.68rem] font-medium uppercase tracking-[0.16em] hover:text-primary">About Us</Link>
            <Link to="/journal" activeProps={{ className: "text-primary" }} className="text-[0.68rem] font-medium uppercase tracking-[0.16em] hover:text-primary">Blog</Link>
            <Link to="/contact" activeProps={{ className: "text-primary" }} className="text-[0.68rem] font-medium uppercase tracking-[0.16em] hover:text-primary">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <button aria-label="Search" onClick={() => setSearching(true)}><Search className="h-5 w-5" strokeWidth={1.5} /></button>
            <Link to="/account" aria-label="Account"><User className="h-5 w-5" strokeWidth={1.5} /></Link>
            <Link to="/wishlist" aria-label="Wishlist" className="relative">
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {wishlist.length > 0 && <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-primary text-[0.6rem] text-primary-foreground">{wishlist.length}</span>}
            </Link>
            <button aria-label="Cart" className="relative" onClick={() => setCartOpen(true)}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {count > 0 && <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-primary text-[0.6rem] text-primary-foreground">{count}</span>}
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={() => setOpen(false)} />
            <motion.div role="dialog" aria-modal="true" aria-label="Menu" initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -24, opacity: 0 }}
              className="absolute inset-y-0 left-0 flex w-[min(100%,22rem)] flex-col overflow-y-auto bg-background p-8">
              <button className="self-end" aria-label="Close" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
              <nav className="mt-8 flex flex-col gap-4">
                <Link to="/" onClick={() => setOpen(false)} className="font-serif text-3xl">Home</Link>
                <Link to="/shop" onClick={() => setOpen(false)} className="font-serif text-3xl">Shop</Link>
                {shopLinks.map((n) => <Link key={n.label} to="/category/$slug" params={{ slug: n.slug }} onClick={() => setOpen(false)} className="font-serif text-2xl text-muted-foreground">{n.label}</Link>)}
                <Link to="/about" onClick={() => setOpen(false)} className="font-serif text-3xl">About Us</Link>
                <Link to="/journal" onClick={() => setOpen(false)} className="font-serif text-3xl">Blog</Link>
                <Link to="/contact" onClick={() => setOpen(false)} className="font-serif text-3xl">Contact</Link>
              </nav>
              <div className="mt-auto flex gap-6 pt-10 text-sm">
                <Link to="/account" onClick={() => setOpen(false)}>Account</Link>
                <Link to="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchModal open={searching} onClose={() => setSearching(false)} />
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Send, Youtube } from "lucide-react";
import { useState } from "react";

const social = [
  { label: "Facebook", href: "https://www.facebook.com/", Icon: Facebook },
  { label: "Instagram", href: "https://www.instagram.com/", Icon: Instagram },
  { label: "YouTube", href: "https://www.youtube.com/", Icon: Youtube },
] as const;

const quick = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["About Us", "/about"],
  ["Blog", "/journal"],
  ["Contact Us", "/contact"],
] as const;

const care = [
  ["Track Your Order", "/account/orders"],
  ["Shipping Policy", "/shipping"],
  ["Return & Refunds", "/returns"],
  ["Terms & Conditions", "/terms"],
  ["Privacy Policy", "/privacy"],
  ["FAQs", "/faq"],
] as const;

export function Footer() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" aria-label="63rd Street Apothecary" className="inline-flex">
            <img src="/logo-light.png" alt="63rd Street Apothecary" className="h-20 w-20 object-contain" />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-foreground/75">
            Clean beauty that nourishes, enhances and empowers you.
          </p>
          <div className="mt-5 flex gap-4">
            {social.map(({ label, href, Icon }) => (
              <a key={label} href={href} aria-label={label} className="text-ink-foreground/80 hover:text-white">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-foreground/90">Quick Links</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/75">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/shop" className="hover:text-white">Shop</Link></li>
            <li><Link to="/collections/$slug" params={{ slug: "best-sellers" }} className="hover:text-white">Collections</Link></li>
            {quick.slice(2).map(([label, to]) => (
              <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-foreground/90">Customer Care</p>
          <ul className="mt-4 space-y-2.5 text-sm text-ink-foreground/75">
            {care.map(([label, to]) => (
              <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-foreground/90">Newsletter</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-foreground/75">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>
          {done ? <p className="mt-4 text-sm">Thank you — you are on the list.</p> : (
            <form
              className="mt-4 flex overflow-hidden rounded-md border border-white/25"
              onSubmit={(e) => {
                e.preventDefault();
                const email = new FormData(e.currentTarget).get("email");
                if (typeof email !== "string" || !email.includes("@")) { setError("Enter a valid email address."); return; }
                setError("");
                setDone(true);
              }}
            >
              <label className="sr-only" htmlFor="footer-email">Email</label>
              <input id="footer-email" name="email" required type="email" placeholder="Enter your email address" aria-invalid={!!error}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/45" />
              <button type="submit" aria-label="Subscribe" className="grid w-11 place-items-center bg-primary text-white hover:bg-[var(--rose-deep)]">
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
          {error && <p className="mt-2 text-sm text-white" role="alert">{error}</p>}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-5 text-xs text-ink-foreground/60 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} 63rd Street Apothecary. All Rights Reserved.</p>
          <ul className="flex gap-2" aria-label="Payment methods">
            {["Visa", "Mastercard", "RuPay", "UPI"].map((name) => (
              <li key={name} className="rounded border border-white/25 bg-white px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-wide text-[#1a1f71]">{name}</li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

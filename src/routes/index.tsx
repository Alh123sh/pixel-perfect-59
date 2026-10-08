import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, FlaskConical, Headset, Leaf, Rabbit, Recycle, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useCatalog } from "@/lib/storefront";
import { ProductCard } from "@/components/site/ProductCard";
import body from "@/assets/vt/body.jpg";
import cream from "@/assets/vt/cream.jpg";
import gift from "@/assets/vt/gift.jpg";
import hair from "@/assets/vt/lotion.jpg";
import heroMakeup from "@/assets/vt/hero-2.jpg";
import makeup from "@/assets/vt/makeup.jpg";
import promo from "@/assets/vt/gift.jpg";
import skin from "@/assets/vt/skin.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "63rd Street Apothecary — Radiant Skin. Real Confidence." },
      { name: "description", content: "Clean beauty that nourishes, enhances and empowers you. Shop skincare, makeup, haircare, bodycare, and gift sets." },
      { property: "og:title", content: "63rd Street Apothecary — Radiant Skin. Real Confidence." },
      { property: "og:description", content: "Clean beauty that nourishes, enhances and empowers you." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

const slides = [
  {
    eyebrow: "New in",
    title: "Radiant Skin. Real Confidence.",
    text: "Clean beauty that nourishes, enhances and empowers you.",
    image: body,
    alt: "A glass dropper bottle of facial oil in warm light",
    cta: "Shop now",
  },
  {
    eyebrow: "The edit",
    title: "Color, softly done.",
    text: "Makeup and care made to feel effortless from the first swipe.",
    image: heroMakeup,
    alt: "Makeup brushes, lipstick, and a compact arranged on a warm background",
    cta: "Shop now",
  },
] as const;

const circles = [
  { name: "Skincare", image: skin, slug: "skincare" },
  { name: "Makeup", image: makeup, slug: "" },
  { name: "Haircare", image: hair, slug: "" },
  { name: "Bodycare", image: body, slug: "bath-body" },
  { name: "Sun Care", image: cream, slug: "" },
  { name: "Gift Sets", image: gift, slug: "gifts" },
] as const;

const promises = [
  { Icon: Leaf, title: "Clean Ingredients", text: "Skin & Scalp-Safe" },
  { Icon: FlaskConical, title: "Clinically Proven", text: "Dermatologically tested" },
  { Icon: Rabbit, title: "Cruelty Free", text: "We never test on animals" },
  { Icon: Recycle, title: "Sustainable Beauty", text: "Good for you & the planet" },
] as const;

const services = [
  { Icon: Truck, title: "Free Shipping", text: "On orders over ₹999" },
  { Icon: RotateCcw, title: "Easy Returns", text: "15 days return policy" },
  { Icon: ShieldCheck, title: "Secure Payment", text: "100% secure checkout" },
  { Icon: Headset, title: "24/7 Support", text: "We're here to help" },
] as const;

function Home() {
  const { products } = useCatalog();
  const best = products.filter((product) => product.badge === "Best Seller").slice(0, 4);
  const [index, setIndex] = useState(0);
  const slide = slides[index] ?? slides[0]!;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <section className="relative bg-[#f6ece9]" aria-roledescription="carousel" aria-label="Featured">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-5 py-12 md:px-10 lg:grid-cols-2 lg:py-16">
          <div key={slide.eyebrow}>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-foreground">{slide.eyebrow}</p>
            <h1 className="mt-4 max-w-xl text-5xl leading-[1.05] text-foreground md:text-6xl lg:text-[4.25rem]">
              {slide.title.includes(".") ? (
                <>
                  {slide.title.split(". ")[0]}.
                  <br />
                  {slide.title.split(". ").slice(1).join(". ")}
                </>
              ) : slide.title}
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">{slide.text}</p>
            <Link to="/shop" className="btn btn-primary mt-8">{slide.cta}</Link>
          </div>
          <img src={slide.image} alt={slide.alt} className="mx-auto aspect-[5/4] w-full max-w-xl rounded-2xl object-cover shadow-sm" />
        </div>
        <button type="button" aria-label="Previous slide" onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-sm md:left-6">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button type="button" aria-label="Next slide" onClick={() => setIndex((i) => (i + 1) % slides.length)}
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-sm md:right-6">
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-6 rounded-2xl border bg-white px-6 py-6 shadow-[0_10px_40px_rgba(78,36,60,0.06)] md:grid-cols-4 md:divide-x md:divide-border md:px-2">
          {promises.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 md:justify-center md:px-4">
              <Icon className="h-7 w-7 shrink-0 text-primary" strokeWidth={1.4} />
              <div>
                <p className="text-sm font-medium text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 className="text-center text-sm font-medium uppercase tracking-[0.28em] text-foreground">Shop by Category</h2>
        <div className="mt-10 grid grid-cols-3 gap-6 sm:grid-cols-6">
          {circles.map((c) => {
            const inner = (
              <>
                <span className="mx-auto block aspect-square overflow-hidden rounded-full bg-secondary ring-4 ring-white">
                  <img src={c.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </span>
                <span className="mt-3 block text-[0.68rem] font-medium uppercase tracking-[0.16em]">{c.name}</span>
              </>
            );
            return c.slug
              ? <Link key={c.name} to="/category/$slug" params={{ slug: c.slug }} className="group text-center">{inner}</Link>
              : <Link key={c.name} to="/shop" className="group text-center">{inner}</Link>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-4 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl bg-primary text-primary-foreground md:grid-cols-2">
          <div className="px-8 py-12 md:px-14 md:py-16">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/80">Limited time offer</p>
            <h2 className="mt-4 text-4xl leading-tight text-white md:text-5xl">Up to 30% Off on Best Sellers</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90 md:text-base">
              Glow more, spend less. Treat your skin today!
            </p>
            <Link to="/collections/$slug" params={{ slug: "best-sellers" }} className="btn mt-8 bg-white text-primary hover:bg-ink hover:text-white">Shop the sale</Link>
          </div>
          <img src={promo} alt="A gift box wrapped in pink with a gold ribbon" className="h-full min-h-64 w-full object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-sm font-medium uppercase tracking-[0.28em]">Best Sellers</h2>
          <Link to="/collections/$slug" params={{ slug: "best-sellers" }} className="text-xs font-medium uppercase tracking-[0.18em] text-primary">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {best.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 md:grid-cols-4 lg:px-8">
          {services.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.08em]">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

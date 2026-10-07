import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Package, Sparkles, Star } from "lucide-react";
import { categories, heroImage, needs, posts, products } from "@/lib/products";
import { ProductCard } from "@/components/site/ProductCard";
import gift from "@/assets/gift.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "63rd Street Apothecary — Small-Batch Rituals for Everyday Wellbeing" },
      { name: "description", content: "Handcrafted bath, body, skincare, soaps and candles, made in small batches with care." },
      { property: "og:title", content: "63rd Street Apothecary" },
      { property: "og:description", content: "Handcrafted bath, body, skincare, soaps and candles." },
    ],
  }),
  component: Home,
});

function SectionHead({ eyebrow, title, link }: { eyebrow: string; title: string; link?: { to: "/shop"; label: string } }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6">
      <div><p className="eyebrow">{eyebrow}</p><h2 className="mt-2 text-4xl md:text-5xl">{title}</h2></div>
      {link && <Link to={link.to} className="link-underline hidden text-xs uppercase tracking-[0.18em] sm:block">{link.label}</Link>}
    </div>
  );
}

function Home() {
  const best = products.filter((p) => p.badge === "Best Seller");
  const fresh = products.filter((p) => p.badge === "New");
  return (
    <>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-20">
        <div className="fade-up order-2 lg:order-1">
          <p className="eyebrow">Handcrafted Self-Care</p>
          <h1 className="mt-5 text-5xl leading-[1.02] md:text-7xl">Small-Batch Rituals for <em>Everyday</em> Wellbeing</h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Discover thoughtfully crafted bath, body, skincare, and home products made to bring a little more comfort and care into your everyday routine.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/shop" className="btn btn-primary">Shop Best Sellers</Link>
            <Link to="/category/$slug" params={{ slug: "gifts" }} className="btn btn-outline">Explore the Collection</Link>
          </div>
        </div>
        <div className="fade-up order-1 lg:order-2">
          <img src={heroImage} alt="Candle, body oils and handmade soaps on linen" width={1280} height={1536} className="aspect-[4/5] w-full object-cover" />
        </div>
      </section>

      <section className="border-y bg-cream">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 text-center text-xs uppercase tracking-[0.16em] md:grid-cols-4 lg:px-8">
          {[[Leaf, "Natural ingredients"], [Sparkles, "Made in small batches"], [Package, "Free shipping over $75"], [Star, "4.9 average rating"]].map(([I, t]) => {
            const Icon = I as typeof Leaf;
            return <div key={t as string} className="flex items-center justify-center gap-2"><Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />{t as string}</div>;
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHead eyebrow="Explore" title="Shop by Category" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="group">
              <div className="aspect-[3/4] overflow-hidden bg-secondary">
                <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <p className="mt-3 font-serif text-xl">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <SectionHead eyebrow="Most loved" title="Best Sellers" link={{ to: "/shop", label: "Shop all" }} />
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {[...best, products[6]].map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 lg:px-8">
          <img src={gift} alt="Self-care gift box" loading="lazy" className="aspect-square w-full object-cover" />
          <div className="md:pl-10">
            <p className="eyebrow">Featured Collection</p>
            <h2 className="mt-3 text-5xl">The Gifting Edit</h2>
            <p className="mt-5 max-w-md text-muted-foreground">Curated boxes of our favourite soaps, candles and balms — wrapped by hand in kraft and twine, ready to give.</p>
            <Link to="/category/$slug" params={{ slug: "gifts" }} className="btn btn-primary mt-8">Shop Gifts</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHead eyebrow="Just poured" title="New Arrivals" link={{ to: "/shop", label: "View all" }} />
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {[...fresh, products[4]].map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <SectionHead eyebrow="Find your ritual" title="Shop by Need" />
        <div className="flex flex-wrap gap-3">
          {needs.map((n) => (
            <Link key={n.slug} to="/shop" search={{ need: n.slug }} className="border px-6 py-3 font-serif text-xl transition hover:bg-foreground hover:text-background">{n.name}</Link>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-5 py-20 text-center">
          <p className="eyebrow text-primary-foreground/70">Kind words</p>
          <blockquote className="mt-6 font-serif text-3xl leading-snug md:text-4xl">“The lavender oat soap is the only thing my sensitive skin tolerates. Every bar feels like a little gift.”</blockquote>
          <p className="mt-6 text-xs uppercase tracking-[0.2em]">— Maya R., verified buyer</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHead eyebrow="The Journal" title="Notes on Slow Living" />
        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} to="/journal/$slug" params={{ slug: p.slug }} className="group">
              <div className="aspect-[4/3] overflow-hidden"><img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
              <p className="eyebrow mt-4">{p.date}</p>
              <p className="mt-2 font-serif text-2xl">{p.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

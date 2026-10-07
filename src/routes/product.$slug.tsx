import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Minus, Plus, Star, Truck } from "lucide-react";
import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductCard } from "@/components/site/ProductCard";
import { byCategory, getCategory, getProduct, money, products } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const t = `${loaderData?.product.name ?? "Product"} — 63rd Street Apothecary`;
    const d = loaderData?.product.description ?? "";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }, { property: "og:type", content: "product" }] };
  },
  component: ProductPage,
});

function ProductPage() {
  const { product: p } = Route.useLoaderData();
  const { add, wishlist, toggleWish } = useStore();
  const [qty, setQty] = useState(1);
  const cat = getCategory(p.category);
  const related = [...byCategory(p.category), ...products].filter((x, i, a) => x.slug !== p.slug && a.indexOf(x) === i).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <nav className="mb-8 text-xs text-muted-foreground">
        <Link to="/">Home</Link> / <Link to="/category/$slug" params={{ slug: p.category }}>{cat?.name}</Link> / <span className="text-foreground">{p.name}</span>
      </nav>
      <div className="grid gap-12 lg:grid-cols-2">
        <img src={p.image} alt={p.name} width={1024} height={1280} className="aspect-[4/5] w-full bg-secondary object-cover" />
        <div className="lg:py-6">
          <p className="eyebrow">{p.scent} · {p.size}</p>
          <h1 className="mt-3 text-5xl leading-tight">{p.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-clay text-clay" />)}</span>
            {p.rating} · {p.reviews} reviews
          </div>
          <p className="mt-6 text-2xl">{money(p.price)}{p.compareAt && <span className="ml-3 text-lg text-muted-foreground line-through">{money(p.compareAt)}</span>}</p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          <div className="mt-8 flex gap-3">
            <div className="inline-flex items-center border">
              <button aria-label="Decrease" className="p-4" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-3 w-3" /></button>
              <span className="w-8 text-center">{qty}</span>
              <button aria-label="Increase" className="p-4" onClick={() => setQty(qty + 1)}><Plus className="h-3 w-3" /></button>
            </div>
            <button onClick={() => add(p.slug, qty)} className="btn btn-primary flex-1">Add to Bag — {money(p.price * qty)}</button>
            <button aria-label="Wishlist" onClick={() => toggleWish(p.slug)} className="border px-4">
              <Heart className={`h-4 w-4 ${wishlist.includes(p.slug) ? "fill-primary text-primary" : ""}`} strokeWidth={1.5} />
            </button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Truck className="h-4 w-4" /> Free shipping on orders over $75 · Ships in 1–3 business days</p>
          <Accordion type="single" collapsible defaultValue="ing" className="mt-10 border-t">
            <AccordionItem value="ing"><AccordionTrigger className="font-serif text-xl">Ingredients</AccordionTrigger><AccordionContent className="text-muted-foreground">{p.ingredients}</AccordionContent></AccordionItem>
            <AccordionItem value="use"><AccordionTrigger className="font-serif text-xl">How to Use</AccordionTrigger><AccordionContent className="text-muted-foreground">{p.howToUse}</AccordionContent></AccordionItem>
            <AccordionItem value="ship"><AccordionTrigger className="font-serif text-xl">Shipping & Returns</AccordionTrigger><AccordionContent className="text-muted-foreground">Orders ship within 1–3 business days. Unopened items may be returned within 30 days.</AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </div>
      <section className="mt-24">
        <h2 className="mb-10 text-4xl">You may also love</h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} product={r} />)}</div>
      </section>
    </div>
  );
}

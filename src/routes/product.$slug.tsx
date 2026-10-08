import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { JsonLd, breadcrumbJsonLd } from "@/components/site/JsonLd";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductGallery } from "@/components/site/ProductGallery";
import { ReviewSection } from "@/components/site/ReviewSection";
import { Stars } from "@/components/site/Stars";
import { categoryName, isSoldOut, money } from "@/lib/products";
import { getProductBySlug, getProductReviews, relatedFrom, useCatalog } from "@/lib/storefront";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug(params.slug);
    if (!product) throw notFound();
    const reviews = await getProductReviews(params.slug);
    return { product, reviews };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const title = `${product?.name ?? "Product"} — 63rd Street Apothecary`;
    const description = product?.description ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:image", content: product?.image ?? "" },
      ],
    };
  },
  pendingComponent: () => <div className="mx-auto max-w-7xl px-5 py-16"><div className="grid gap-10 lg:grid-cols-2"><div className="aspect-[4/5] animate-pulse bg-secondary" /><div className="space-y-4"><div className="h-10 w-2/3 animate-pulse bg-secondary" /><div className="h-6 w-1/3 animate-pulse bg-secondary" /></div></div></div>,
  errorComponent: () => <p className="px-5 py-24 text-center font-serif text-3xl">We could not load this product. Please try again.</p>,
  component: ProductPage,
});

function ProductPage() {
  const { product: p, reviews } = Route.useLoaderData();
  const { products } = useCatalog();
  const { add, wishlist, toggleWish, viewProduct, recent } = useStore();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState(p.variants.find((v) => v.inStock)?.id ?? p.variants[0]?.id ?? "");
  const selected = p.variants.find((v) => v.id === variantId);
  const price = selected?.price ?? p.price;
  const soldOut = isSoldOut(p) || (selected ? !selected.inStock : false);
  const related = relatedFrom(products, p.slug);
  const viewed = recent.map((slug) => products.find((item) => item.slug === slug)).filter((item) => item && item.slug !== p.slug).slice(0, 4);

  useEffect(() => { viewProduct(p.slug); }, [p.slug]);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: categoryName(p.category), path: `/category/${p.category}` },
    { name: p.name, path: `/product/${p.slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        image: p.images,
        description: p.description,
        brand: { "@type": "Brand", name: "63rd Street Apothecary" },
        aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews },
        offers: { "@type": "Offer", priceCurrency: "USD", price: price.toFixed(2), availability: soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" },
      }} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav className="mb-8 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/category/$slug" params={{ slug: p.category }}>{categoryName(p.category)}</Link> / <span className="text-foreground">{p.name}</span>
      </nav>
      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery product={p} />
        <div className="lg:py-4">
          <h1 className="text-5xl leading-tight">{p.name}</h1>
          <div className="mt-3"><Stars value={p.rating} count={p.reviews} /></div>
          <p className="mt-6 text-2xl">
            {money(price)}
            {p.compareAt && <span className="ml-3 text-lg text-muted-foreground line-through">{money(p.compareAt)}</span>}
          </p>
          <p className="mt-6 leading-relaxed text-muted-foreground">{p.description}</p>
          <p className="mt-4 text-sm">{soldOut ? "Sold out" : "In stock · Ships in 1–3 business days"}</p>
          {p.variants.length > 0 && (
            <div className="mt-6">
              <p className="eyebrow">Options</p>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Product options">
                {p.variants.map((variant) => (
                  <button key={variant.id} type="button" role="radio" aria-checked={variant.id === variantId} disabled={!variant.inStock}
                    onClick={() => setVariantId(variant.id)}
                    className={`border px-4 py-3 text-sm disabled:opacity-40 ${variant.id === variantId ? "bg-foreground text-background" : ""}`}>
                    {variant.name}{!variant.inStock ? " · Sold out" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="inline-flex items-center border">
              <button aria-label="Decrease quantity" className="p-4" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-3 w-3" /></button>
              <span className="w-8 text-center">{qty}</span>
              <button aria-label="Increase quantity" className="p-4" onClick={() => setQty(qty + 1)}><Plus className="h-3 w-3" /></button>
            </div>
            <button disabled={soldOut} onClick={() => add(p.slug, qty, selected?.id)} className="btn btn-primary flex-1 disabled:opacity-50">
              {soldOut ? "Sold out" : `Add to cart — ${money(price * qty)}`}
            </button>
            <button aria-label={wishlist.includes(p.slug) ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wishlist.includes(p.slug)} onClick={() => toggleWish(p.slug)} className="border px-4">
              <Heart className={`h-4 w-4 ${wishlist.includes(p.slug) ? "fill-primary text-primary" : ""}`} strokeWidth={1.5} />
            </button>
          </div>
          <button disabled={soldOut} onClick={() => { add(p.slug, qty, selected?.id, false); navigate({ to: "/checkout" }); }} className="btn btn-outline mt-3 w-full disabled:opacity-50">Buy now</button>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Truck className="h-4 w-4" /> Free shipping on orders over $75</p>
          <Accordion type="multiple" className="mt-10 border-t">
            {([
              ["description", "Description", p.description],
              ["ingredients", "Ingredients", p.ingredients],
              ["use", "How to use", p.howToUse],
              ["details", "Details", p.details],
              ["shipping", "Shipping information", p.shipping],
              ["returns", "Returns", p.returns],
            ] as [string, string, string][]).map(([value, label, body]) => (
              <AccordionItem key={value} value={value}>
                <AccordionTrigger className="font-serif text-xl">{label}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <ReviewSection product={p} published={reviews} />
      <section className="mt-20">
        <h2 className="mb-10 text-4xl">Customers Also Loved</h2>
        <div className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-4 md:overflow-visible">
          {related.map((r) => <div key={r.slug} className="w-[70%] shrink-0 md:w-auto"><ProductCard product={r} /></div>)}
        </div>
      </section>
      {viewed.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-10 text-4xl">Recently Viewed</h2>
          <div className="flex gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-4">
            {viewed.map((r) => r && <div key={r.slug} className="w-[70%] shrink-0 md:w-auto"><ProductCard product={r} /></div>)}
          </div>
        </section>
      )}
    </div>
  );
}

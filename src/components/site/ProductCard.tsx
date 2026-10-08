import { Link } from "@tanstack/react-router";
import { Eye, Heart } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { categoryName, hasVariants, isSoldOut, money } from "@/lib/products";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Stars } from "./Stars";

export function ProductCard({ product }: { product: Product }) {
  const { add, wished, toggleWish } = useStore();
  const [quick, setQuick] = useState(false);
  const [options, setOptions] = useState(false);
  const soldOut = isSoldOut(product);
  const loved = wished(product.slug);

  function quickAdd() {
    if (soldOut) return;
    if (hasVariants(product)) setOptions(true);
    else add(product.slug);
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#f0e4e1] bg-white shadow-[0_8px_30px_rgba(78,36,60,0.05)]">
      <div className="relative aspect-square overflow-hidden bg-[#f7f1ef]">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full">
          <img src={product.image} alt={product.name} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
          <img src={product.hoverImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />
        </Link>
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {soldOut && <span className="bg-foreground px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-background">Sold out</span>}
          {!soldOut && product.compareAt && <span className="bg-primary px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em] text-primary-foreground">Sale</span>}
          {!soldOut && product.badge && <span className="bg-white/90 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.16em]">{product.badge}</span>}
        </div>
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button aria-label={loved ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={loved} onClick={() => toggleWish(product.slug)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm">
            <Heart className={`h-4 w-4 ${loved ? "fill-primary text-primary" : ""}`} strokeWidth={1.5} />
          </button>
          <button aria-label={`Quick view ${product.name}`} onClick={() => setQuick(true)} className="hidden h-9 w-9 place-items-center rounded-full bg-white opacity-0 shadow-sm transition group-hover:opacity-100 md:grid">
            <Eye className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 text-center">
        <Link to="/product/$slug" params={{ slug: product.slug }} className="font-serif text-lg font-medium leading-snug">{product.name}</Link>
        <p className="mt-2 text-sm">
          {money(product.price)}
          {product.compareAt && <span className="ml-2 text-muted-foreground line-through">{money(product.compareAt)}</span>}
        </p>
        <div className="mt-2 flex justify-center">
          <Stars value={product.rating} count={product.reviews} />
        </div>
        <button type="button" onClick={quickAdd} disabled={soldOut} className="btn btn-primary mt-4 w-full disabled:opacity-60">
          {soldOut ? "Sold out" : "Add to cart"}
        </button>
      </div>
      <OptionDialog product={product} open={options} onOpenChange={setOptions} />
      <QuickView product={product} open={quick} onOpenChange={setQuick} />
    </article>
  );
}

export function OptionDialog({ product, open, onOpenChange }: { product: Product; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { add } = useStore();
  const first = product.variants.find((v) => v.inStock) ?? product.variants[0];
  const [variantId, setVariantId] = useState(first?.id ?? "");
  const selected = product.variants.find((v) => v.id === variantId) ?? first;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="font-serif text-3xl">Choose an option</DialogTitle>
        <p className="text-sm text-muted-foreground">{product.name}</p>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Options">
          {product.variants.map((variant) => (
            <button key={variant.id} type="button" role="radio" aria-checked={variant.id === selected?.id} disabled={!variant.inStock}
              onClick={() => setVariantId(variant.id)}
              className={`border px-3 py-2 text-sm disabled:opacity-40 ${variant.id === selected?.id ? "bg-foreground text-background" : ""}`}>
              {variant.name} · {money(variant.price)}{!variant.inStock ? " · Sold out" : ""}
            </button>
          ))}
        </div>
        <button className="btn btn-primary mt-4 w-full" disabled={!selected?.inStock} onClick={() => { if (selected) { add(product.slug, 1, selected.id); onOpenChange(false); } }}>
          Add to bag
        </button>
      </DialogContent>
    </Dialog>
  );
}

export function QuickView({ product, open, onOpenChange }: { product: Product; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { add, wished, toggleWish } = useStore();
  const [variantId, setVariantId] = useState(product.variants.find((v) => v.inStock)?.id ?? product.variants[0]?.id ?? "");
  const selected = product.variants.find((v) => v.id === variantId);
  const soldOut = isSoldOut(product) || (selected ? !selected.inStock : false);
  const price = selected?.price ?? product.price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:max-w-3xl">
        <div className="grid md:grid-cols-2">
          <img src={product.image} alt={product.name} className="aspect-[4/5] h-full w-full object-cover" />
          <div className="p-6 md:p-8">
            <p className="eyebrow">{categoryName(product.category)}</p>
            <DialogTitle className="mt-2 font-serif text-4xl leading-tight">{product.name}</DialogTitle>
            <div className="mt-3"><Stars value={product.rating} count={product.reviews} /></div>
            <p className="mt-4 text-xl">{money(price)}{product.compareAt && <span className="ml-2 text-base text-muted-foreground line-through">{money(product.compareAt)}</span>}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            {product.variants.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2" role="radiogroup" aria-label="Options">
                {product.variants.map((variant) => (
                  <button key={variant.id} type="button" role="radio" aria-checked={variant.id === variantId} disabled={!variant.inStock}
                    onClick={() => setVariantId(variant.id)}
                    className={`border px-3 py-2 text-xs uppercase tracking-[0.12em] disabled:opacity-40 ${variant.id === variantId ? "bg-foreground text-background" : ""}`}>
                    {variant.name}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <button className="btn btn-primary flex-1" disabled={soldOut} onClick={() => { add(product.slug, 1, selected?.id); onOpenChange(false); }}>
                {soldOut ? "Sold out" : "Add to bag"}
              </button>
              <button aria-label="Wishlist" aria-pressed={wished(product.slug)} className="border px-4" onClick={() => toggleWish(product.slug)}>
                <Heart className={`h-4 w-4 ${wished(product.slug) ? "fill-primary text-primary" : ""}`} />
              </button>
            </div>
            <Link to="/product/$slug" params={{ slug: product.slug }} onClick={() => onOpenChange(false)} className="link-underline mt-5 inline-block text-xs uppercase tracking-[0.18em]">
              View full details
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

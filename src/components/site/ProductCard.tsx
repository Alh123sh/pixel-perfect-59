import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { money, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { add, wishlist, toggleWish } = useStore();
  const wished = wishlist.includes(product.slug);
  return (
    <div className="group">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <Link to="/product/$slug" params={{ slug: product.slug }}>
          <img src={product.image} alt={product.name} loading="lazy" width={1024} height={1280}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 bg-background/90 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em]">{product.badge}</span>
        )}
        <button aria-label="Toggle wishlist" onClick={() => toggleWish(product.slug)}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 transition hover:bg-background">
          <Heart className={`h-4 w-4 ${wished ? "fill-primary text-primary" : ""}`} strokeWidth={1.5} />
        </button>
        <button onClick={() => add(product.slug)}
          className="btn btn-primary absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Quick Add
        </button>
      </div>
      <div className="mt-4 space-y-1">
        <p className="eyebrow">{product.scent}</p>
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block font-serif text-xl leading-tight">{product.name}</Link>
        <div className="flex items-center justify-between text-sm">
          <span>
            {money(product.price)}
            {product.compareAt && <span className="ml-2 text-muted-foreground line-through">{money(product.compareAt)}</span>}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-clay text-clay" /> {product.rating} ({product.reviews})
          </span>
        </div>
      </div>
    </div>
  );
}

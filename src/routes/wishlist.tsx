import { createFileRoute, Link } from "@tanstack/react-router";
import { isSoldOut, money, type Product } from "@/lib/products";
import { useCatalog } from "@/lib/storefront";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — 63rd Street Apothecary" }, { name: "description", content: "Products you have saved for later." }, { property: "og:title", content: "Wishlist" }, { property: "og:description", content: "Your saved products." }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist, toggleWish, add } = useStore();
  const { products } = useCatalog();
  const items = wishlist.map((slug) => products.find((product) => product.slug === slug)).filter((p): p is Product => !!p);
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <h1 className="text-5xl">Wishlist</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-2xl">Nothing saved yet</p>
          <Link to="/shop" className="btn btn-outline mt-6">Continue shopping</Link>
        </div>
      ) : (
        <ul className="mt-10 divide-y">
          {items.map((p) => {
            const soldOut = isSoldOut(p);
            return (
              <li key={p.slug} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
                <Link to="/product/$slug" params={{ slug: p.slug }}><img src={p.image} alt="" className="h-28 w-24 object-cover" /></Link>
                <div className="flex-1">
                  <Link to="/product/$slug" params={{ slug: p.slug }} className="font-serif text-2xl">{p.name}</Link>
                  <p className="mt-1">{money(p.price)}</p>
                  <p className="text-sm text-muted-foreground">{soldOut ? "Sold out" : "In stock"}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {p.variants.length > 1 ? (
                    <Link to="/product/$slug" params={{ slug: p.slug }} className="btn btn-primary">Choose options</Link>
                  ) : (
                    <button className="btn btn-primary" disabled={soldOut} onClick={() => add(p.slug)}>{soldOut ? "Sold out" : "Add to cart"}</button>
                  )}
                  <button className="btn btn-outline" onClick={() => toggleWish(p.slug)}>Remove</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

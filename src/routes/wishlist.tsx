import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/site/ProductCard";
import { getProduct, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — 63rd Street Apothecary" }, { name: "description", content: "Your saved favourites." }, { property: "og:title", content: "Wishlist" }, { property: "og:description", content: "Your saved favourites." }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useStore();
  const items = wishlist.map(getProduct).filter((p): p is Product => !!p);
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <h1 className="text-5xl">Wishlist</h1>
      {items.length === 0 ? <div className="py-20 text-center"><p className="font-serif text-2xl">No favourites yet</p><Link to="/shop" className="btn btn-outline mt-6">Browse the Shop</Link></div> :
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">{items.map((p) => <ProductCard key={p.slug} product={p} />)}</div>}
    </div>
  );
}

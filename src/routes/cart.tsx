import { createFileRoute, Link } from "@tanstack/react-router";
import { QtyControl, ShippingProgress } from "@/components/site/CartDrawer";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Bag — 63rd Street Apothecary" }, { name: "description", content: "Review the items in your bag." }, { property: "og:title", content: "Your Bag" }, { property: "og:description", content: "Review the items in your bag." }] }),
  component: Cart,
});

function Cart() {
  const { lines, subtotal, remove } = useStore();
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <h1 className="text-5xl">Your Bag</h1>
      {lines.length === 0 ? (
        <div className="py-20 text-center"><p className="font-serif text-2xl">Your bag is empty</p><Link to="/shop" className="btn btn-outline mt-6">Start Shopping</Link></div>
      ) : (
        <div className="mt-10 grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            {lines.map((l) => (
              <div key={l.slug} className="flex gap-5 border-b py-6">
                <img src={l.product.image} alt="" className="h-32 w-24 object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between"><p className="font-serif text-xl">{l.product.name}</p><p>{money(l.product.price * l.qty)}</p></div>
                  <div className="mt-auto flex items-center justify-between"><QtyControl slug={l.slug} qty={l.qty} /><button className="text-xs underline" onClick={() => remove(l.slug)}>Remove</button></div>
                </div>
              </div>
            ))}
          </div>
          <div className="h-fit space-y-4 bg-secondary p-6">
            <ShippingProgress subtotal={subtotal} />
            <div className="flex justify-between text-lg"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <Link to="/checkout" className="btn btn-primary w-full">Checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/account/orders/$id")({
  head: () => ({ meta: [{ title: "Order details — 63rd Street Apothecary" }, { name: "description", content: "Order details." }, { property: "og:title", content: "Order details" }, { property: "og:description", content: "Order details." }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { orders, ready } = useStore();
  const order = orders.find((item) => item.id === id);
  if (!ready) return <p className="px-5 py-24 text-center">Loading your order…</p>;
  if (!order) throw notFound();
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Link to="/account/orders" className="text-xs uppercase tracking-[0.16em]">Orders</Link>
      <h1 className="mt-3 text-5xl">{order.id}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()} · {order.status}</p>
      <ul className="mt-8 divide-y">
        {order.items.map((item) => (
          <li key={item.slug + item.variant} className="flex gap-4 py-4">
            <img src={item.image} alt="" className="h-20 w-16 object-cover" />
            <div className="flex-1">
              <p className="font-serif text-xl">{item.name}</p>
              {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
              <p className="text-sm">Qty {item.qty}</p>
            </div>
            <p>{money(item.price * item.qty)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-1 text-sm">
        <p>Ship to {order.shippingAddress}</p>
        <p>{order.delivery} · {order.payment}</p>
        <p>Subtotal {money(order.subtotal)} · Shipping {order.shipping ? money(order.shipping) : "Free"} · Total {money(order.total)}</p>
      </div>
    </div>
  );
}

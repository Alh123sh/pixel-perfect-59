import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { money } from "@/lib/products";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/account/orders")({
  head: () => ({ meta: [{ title: "Orders — 63rd Street Apothecary" }, { name: "description", content: "Your 63rd Street Apothecary orders." }, { property: "og:title", content: "Orders" }, { property: "og:description", content: "Your orders." }] }),
  component: Orders,
});

function Orders() {
  const detail = useMatch({ from: "/account/orders/$id", shouldThrow: false });
  const { orders } = useStore();
  if (detail) return <Outlet />;
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Link to="/account" className="text-xs uppercase tracking-[0.16em]">Account</Link>
      <h1 className="mt-3 text-5xl">Orders</h1>
      {orders.length === 0 ? <p className="mt-8 text-muted-foreground">You have no orders yet. When you check out, they will appear here.</p> : (
        <ul className="mt-8 divide-y">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between gap-4 py-5">
              <div>
                <Link to="/account/orders/$id" params={{ id: order.id }} className="font-serif text-2xl">{order.id}</Link>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} · {order.status} · {order.payment}</p>
              </div>
              <p>{money(order.total)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

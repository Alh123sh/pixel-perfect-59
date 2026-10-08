import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFulfillmentFn, adminOrderFn, adminRecordPaymentFn } from "@/server/fns";

export const Route = createFileRoute("/admin/orders/$id")({ component: OrderAdminPage });

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const fulfillment = ["unfulfilled", "partial", "fulfilled", "cancelled"];

function OrderAdminPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Awaited<ReturnType<typeof adminOrderFn>>["order"] | null>(null);
  const [items, setItems] = useState<Awaited<ReturnType<typeof adminOrderFn>>["items"]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("pending");
  const [fulfill, setFulfill] = useState("unfulfilled");
  const [payment, setPayment] = useState("pending");
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    adminOrderFn({ data: { id } }).then((data) => {
      setOrder(data.order);
      setItems(data.items);
      setStatus(data.order.status);
      setFulfill(data.order.fulfillment_status);
      setPayment(data.order.payment_status);
    }).catch((err: unknown) => setError(err instanceof Error ? err.message : "Order not found."));
  }, [id]);

  if (!order && error) return <p role="alert">{error}</p>;
  if (!order) return <div className="h-40 animate-pulse bg-secondary" />;
  return (
    <div>
      <h1 className="text-4xl">{order.order_number}</h1>
      <p className="mt-2 text-sm">{order.customer_email} · Payment {payment}</p>
      {payment === "pending" && (
        <button type="button" className="btn btn-primary mt-4" disabled={recording} onClick={async () => {
          setRecording(true);
          try {
            const result = await adminRecordPaymentFn({ data: { id } });
            setPayment(result.payment_status);
            setStatus(result.status);
            setError("");
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not record the payment.");
          } finally {
            setRecording(false);
          }
        }}>{recording ? "Recording…" : "Record payment received"}</button>
      )}
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">Card checkout is not connected. Recording payment here is the only way an order becomes paid, and it is limited to an admin session.</p>
      <ul className="mt-6 divide-y text-sm">
        {items.map((item) => <li key={item.id} className="py-3">{item.product_name} · {item.variant_name || "—"} · qty {item.quantity} · ${Number(item.unit_price).toFixed(2)}</li>)}
      </ul>
      <form className="mt-6 flex flex-wrap gap-3" onSubmit={async (e) => {
        e.preventDefault();
        try {
          await adminFulfillmentFn({ data: { id, status, fulfillment: fulfill } });
          setError("");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not update the order.");
        }
      }}>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-3 py-2 text-sm">{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        <select value={fulfill} onChange={(e) => setFulfill(e.target.value)} className="border px-3 py-2 text-sm">{fulfillment.map((item) => <option key={item}>{item}</option>)}</select>
        <button className="btn btn-primary">Update fulfillment</button>
      </form>
      <p className="mt-4 text-sm">Subtotal ${Number(order.subtotal).toFixed(2)} · Discount ${Number(order.discount_total).toFixed(2)} · Shipping ${Number(order.shipping_total).toFixed(2)} · Total ${Number(order.total).toFixed(2)}</p>
      {error && <p className="mt-3 text-sm" role="alert">{error}</p>}
    </div>
  );
}

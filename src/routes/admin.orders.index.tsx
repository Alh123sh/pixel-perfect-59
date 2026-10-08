import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminOrdersFn } from "@/server/fns";

export const Route = createFileRoute("/admin/orders/")({ component: OrdersPage });

type Row = { id: string; order_number: string; customer_email: string; total: number; status: string; payment_status: string; fulfillment_status: string; created_at: string };

function OrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminOrdersFn().then((data) => {
      setRows(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load orders.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <h1 className="text-4xl">Orders</h1>
      <p className="mt-2 text-sm text-muted-foreground">Payment status cannot be marked paid from this screen.</p>
      <div className="mt-6"><AdminState loading={loading} error={error} empty={rows.length === 0} onRetry={load}>
        <ul className="divide-y text-sm">
          {rows.map((row) => (
            <li key={row.id} className="flex justify-between gap-4 py-3">
              <Link to="/admin/orders/$id" params={{ id: row.id }} className="underline">{row.order_number}</Link>
              <span>{row.customer_email} · {row.status} · {row.payment_status} · ${Number(row.total).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </AdminState></div>
    </div>
  );
}

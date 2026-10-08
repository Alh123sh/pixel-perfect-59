import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminCustomersFn } from "@/server/fns";

export const Route = createFileRoute("/admin/customers")({ component: CustomersPage });

function CustomersPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<{ id: string; full_name: string; email: string; phone: string }[]>([]);
  const [orders, setOrders] = useState<{ user_id: string | null; total: number; payment_status: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminCustomersFn().then((data) => {
      setRows(data.customers);
      setOrders(data.orders);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load customers.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  const q = query.trim().toLowerCase();
  const visible = rows.filter((row) => !q || `${row.full_name} ${row.email} ${row.phone}`.toLowerCase().includes(q));
  return (
    <div>
      <h1 className="text-4xl">Customers</h1>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="mt-6 w-full border px-3 py-2 text-sm" />
      <div className="mt-6"><AdminState loading={loading} error={error} empty={visible.length === 0} onRetry={load}>
        <ul className="divide-y text-sm">
          {visible.map((row) => {
            const theirs = orders.filter((order) => order.user_id === row.id);
            const spent = theirs.filter((order) => order.payment_status === "paid").reduce((sum, order) => sum + Number(order.total), 0);
            return <li key={row.id} className="py-3">{row.full_name || "—"} · {row.email} · {row.phone || "No phone"} · {theirs.length} orders · ${spent.toFixed(2)} paid</li>;
          })}
        </ul>
      </AdminState></div>
    </div>
  );
}

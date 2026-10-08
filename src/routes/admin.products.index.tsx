import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminProductsFn } from "@/server/fns";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsPage,
});

type Row = { id: string; name: string; slug: string; price: number; is_active: boolean; inventory_quantity: number };

function ProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminProductsFn().then((data) => {
      setRows(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load products.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="text-4xl">Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">New product</Link>
      </div>
      <div className="mt-6">
        <AdminState loading={loading} error={error} empty={!loading && rows.length === 0} onRetry={load}>
          <ul className="divide-y">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center justify-between py-3 text-sm">
                <Link to="/admin/products/$id" params={{ id: row.id }} className="font-serif text-2xl">{row.name}</Link>
                <span>{row.is_active ? "Active" : "Hidden"} · ${Number(row.price).toFixed(2)} · {row.inventory_quantity} in stock</span>
              </li>
            ))}
          </ul>
        </AdminState>
      </div>
    </div>
  );
}

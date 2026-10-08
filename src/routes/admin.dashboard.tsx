import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminDashboardFn } from "@/server/fns";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

type Stats = {
  total_sales: number;
  today_sales: number;
  sales_7_day: number;
  sales_30_day: number;
  total_orders: number;
  pending_orders: number;
  low_stock: number;
  out_of_stock: number;
  new_customers: number;
  recent_orders: { order_number: string; customer_email: string; total: number; payment_status: string; status: string }[];
  best_sellers: { name: string; slug: string; sold_count: number }[];
  sales_by_day: { day: string; total: number }[];
};

function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminDashboardFn().then((data) => {
      setStats(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load the dashboard.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  const money = (n: number) => `$${Number(n || 0).toFixed(2)}`;
  return (
    <AdminState loading={loading} error={error} onRetry={load}>
      {stats && (
        <div>
          <h1 className="text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sales count only orders whose payment status is paid.</p>
          <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {([
              ["Total sales", money(stats.total_sales)],
              ["Today", money(stats.today_sales)],
              ["7 days", money(stats.sales_7_day)],
              ["30 days", money(stats.sales_30_day)],
              ["Orders", String(stats.total_orders)],
              ["Pending", String(stats.pending_orders)],
              ["Low stock", String(stats.low_stock)],
              ["Out of stock", String(stats.out_of_stock)],
              ["New customers", String(stats.new_customers)],
            ] as const).map(([label, value]) => (
              <div key={label} className="border p-4">
                <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
                <dd className="mt-2 font-serif text-3xl">{value}</dd>
              </div>
            ))}
          </dl>
          <h2 className="mt-10 text-2xl">Paid sales, last 14 days</h2>
          <div className="mt-4 flex h-40 items-end gap-1" aria-label="Paid sales by day">
            {(stats.sales_by_day ?? []).map((point) => {
              const max = Math.max(...(stats.sales_by_day ?? []).map((item) => Number(item.total)), 1);
              const height = Math.max(4, Math.round((Number(point.total) / max) * 100));
              return (
                <div key={point.day} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div className="flex h-32 w-full items-end">
                    <div className="w-full rounded-t bg-primary" style={{ height: `${height}%` }} title={`${point.day}: ${money(point.total)}`} />
                  </div>
                  <span className="text-[0.6rem] text-muted-foreground">{point.day.slice(5)}</span>
                </div>
              );
            })}
          </div>
          <h2 className="mt-10 text-2xl">Best sellers</h2>
          <ul className="mt-4 divide-y text-sm">
            {(stats.best_sellers ?? []).map((product) => (
              <li key={product.slug} className="flex justify-between py-3">
                <span>{product.name}</span>
                <span>{product.sold_count} sold</span>
              </li>
            ))}
          </ul>
          <h2 className="mt-10 text-2xl">Recent orders</h2>
          <ul className="mt-4 divide-y text-sm">
            {(stats.recent_orders ?? []).map((order) => (
              <li key={order.order_number} className="flex justify-between py-3">
                <span>{order.order_number} · {order.customer_email}</span>
                <span>{order.status} · {order.payment_status} · {money(order.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminState>
  );
}

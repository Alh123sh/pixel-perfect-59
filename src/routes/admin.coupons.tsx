import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminCouponsFn, adminCreateCouponFn, adminToggleCouponFn } from "@/server/fns";

export const Route = createFileRoute("/admin/coupons")({ component: CouponsPage });

type Row = { id: string; code: string; discount_type: string; discount_value: number; minimum_order_amount: number; is_active: boolean; usage_count: number; usage_limit: number | null };

function CouponsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminCouponsFn().then((data) => {
      setRows(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load coupons.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <h1 className="text-4xl">Coupons</h1>
      <form className="mt-6 grid gap-2 sm:grid-cols-2" onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const limit = String(data.get("limit") ?? "");
        try {
          await adminCreateCouponFn({ data: {
            code: String(data.get("code")),
            description: String(data.get("description") ?? ""),
            discount_type: String(data.get("type")) === "fixed" ? "fixed" : "percent",
            discount_value: Number(data.get("value")),
            minimum_order_amount: Number(data.get("minimum") || 0),
            usage_limit: limit ? Number(limit) : null,
          } });
          e.currentTarget.reset();
          load();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save.");
        }
      }}>
        <input required name="code" placeholder="CODE" className="border px-3 py-2 text-sm" />
        <select name="type" className="border px-3 py-2 text-sm"><option value="percent">Percent</option><option value="fixed">Fixed amount</option></select>
        <input required name="value" type="number" min="0.01" step="0.01" placeholder="Value" className="border px-3 py-2 text-sm" />
        <input name="minimum" type="number" min="0" step="0.01" placeholder="Minimum order" className="border px-3 py-2 text-sm" />
        <input name="limit" type="number" min="1" placeholder="Usage limit" className="border px-3 py-2 text-sm" />
        <input name="description" placeholder="Description" className="border px-3 py-2 text-sm" />
        <button className="btn btn-primary w-fit">Create coupon</button>
      </form>
      <div className="mt-6"><AdminState loading={loading} error={error} empty={rows.length === 0} onRetry={load}>
        <ul className="divide-y text-sm">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between py-3">
              <span>{row.code} · {row.discount_type} {row.discount_value} · min ${Number(row.minimum_order_amount).toFixed(2)} · used {row.usage_count}{row.usage_limit ? ` / ${row.usage_limit}` : ""}</span>
              <button type="button" className="underline" onClick={async () => { await adminToggleCouponFn({ data: { id: row.id, isActive: !row.is_active } }); load(); }}>{row.is_active ? "Deactivate" : "Activate"}</button>
            </li>
          ))}
        </ul>
      </AdminState></div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminCollectionsFn, adminCreateCollectionFn } from "@/server/fns";

export const Route = createFileRoute("/admin/collections")({ component: CollectionsPage });

function CollectionsPage() {
  const [rows, setRows] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminCollectionsFn().then((data) => {
      setRows(data.collections);
      setProducts(data.products);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load collections.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <h1 className="text-4xl">Collections</h1>
      <form className="mt-6 grid gap-2" onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        try {
          await adminCreateCollectionFn({ data: { name: String(data.get("name")), slug: String(data.get("slug")), description: String(data.get("description") ?? ""), productId: String(data.get("product") ?? "") } });
          e.currentTarget.reset();
          load();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save.");
        }
      }}>
        <input required name="name" placeholder="Name" className="border px-3 py-2 text-sm" />
        <input required name="slug" placeholder="slug" className="border px-3 py-2 text-sm" />
        <input name="description" placeholder="Description" className="border px-3 py-2 text-sm" />
        <select name="product" className="border px-3 py-2 text-sm"><option value="">Add a product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select>
        <button className="btn btn-primary w-fit">Save collection</button>
      </form>
      <div className="mt-6"><AdminState loading={loading} error={error} empty={rows.length === 0} onRetry={load}><ul className="divide-y">{rows.map((row) => <li key={row.id} className="py-3 text-sm">{row.name} · {row.slug}</li>)}</ul></AdminState></div>
    </div>
  );
}

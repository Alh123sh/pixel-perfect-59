import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminCategoriesFn, adminCreateCategoryFn } from "@/server/fns";

export const Route = createFileRoute("/admin/categories")({ component: CategoriesPage });

function CategoriesPage() {
  const [rows, setRows] = useState<{ id: string; name: string; slug: string; is_active: boolean }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminCategoriesFn().then((data) => {
      setRows(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load categories.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <h1 className="text-4xl">Categories</h1>
      <form className="mt-6 flex flex-wrap gap-2" onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        try {
          await adminCreateCategoryFn({ data: { name: String(data.get("name")), slug: String(data.get("slug")), description: String(data.get("description") ?? "") } });
          setError("");
          e.currentTarget.reset();
          load();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save.");
        }
      }}>
        <input required name="name" placeholder="Name" className="border px-3 py-2 text-sm" />
        <input required name="slug" placeholder="slug" className="border px-3 py-2 text-sm" />
        <input name="description" placeholder="Description" className="border px-3 py-2 text-sm" />
        <button className="btn btn-primary">Add</button>
      </form>
      <div className="mt-6"><AdminState loading={loading} error={error} empty={rows.length === 0} onRetry={load}><ul className="divide-y text-sm">{rows.map((row) => <li key={row.id} className="py-3">{row.name} · {row.slug} · {row.is_active ? "Active" : "Hidden"}</li>)}</ul></AdminState></div>
    </div>
  );
}

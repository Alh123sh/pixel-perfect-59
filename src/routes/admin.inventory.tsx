import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminAdjustInventoryFn, adminInventoryFn } from "@/server/fns";

export const Route = createFileRoute("/admin/inventory")({ component: InventoryPage });

type Variant = { id: string; name: string; sku: string; inventory_quantity: number; product_id: string };
type Product = { id: string; name: string; sku: string | null; inventory_quantity: number; product_variants: Variant[] };

function InventoryPage() {
  const [rows, setRows] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminInventoryFn().then((data) => {
      setRows(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load inventory.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  async function adjust(productId: string, variantId: string | null, quantity: number) {
    try {
      await adminAdjustInventoryFn({ data: { productId, variantId, quantity } });
      setError("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update inventory.");
    }
  }
  return (
    <div>
      <h1 className="text-4xl">Inventory</h1>
      <div className="mt-6"><AdminState loading={loading} error={error} empty={rows.length === 0} onRetry={load}>
        <ul className="divide-y text-sm">
          {rows.flatMap((product) => {
            const lines = product.product_variants.length ? product.product_variants : [{ id: "", name: "Product", sku: product.sku ?? "", inventory_quantity: product.inventory_quantity, product_id: product.id }];
            return lines.map((line) => (
              <li key={`${product.id}-${line.id || "base"}`} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>{product.name} · {line.name} · {line.sku || "—"} · {line.inventory_quantity}{line.inventory_quantity === 0 ? " · Out of stock" : line.inventory_quantity <= 5 ? " · Low" : ""}</span>
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); adjust(product.id, line.id || null, Number(new FormData(e.currentTarget).get("qty"))); }}>
                  <input name="qty" type="number" min="0" defaultValue={line.inventory_quantity} className="w-24 border px-2 py-1" aria-label={`Stock for ${product.name}`} />
                  <button className="underline">Save</button>
                </form>
              </li>
            ));
          })}
        </ul>
      </AdminState></div>
    </div>
  );
}

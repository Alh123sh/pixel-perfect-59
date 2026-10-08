import { useEffect, useState } from "react";
import { z } from "zod";
import { adminCategoryOptionsFn, adminDeleteProductFn, adminProductFn, adminSaveProductFn, adminUploadImageFn } from "@/server/fns";

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase slug"),
  price: z.number().min(0),
  compare_at_price: z.number().min(0).nullable(),
  inventory_quantity: z.number().int().min(0),
  description: z.string().max(5000),
  short_description: z.string().max(300),
  ingredients: z.string().max(5000),
  how_to_use: z.string().max(5000),
  seo_title: z.string().max(160),
  seo_description: z.string().max(300),
  category_id: z.string().uuid().nullable(),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  is_best_seller: z.boolean(),
  is_new_arrival: z.boolean(),
  is_on_sale: z.boolean(),
});

type FormState = z.infer<typeof schema>;
const empty: FormState = {
  name: "", slug: "", price: 0, compare_at_price: null, inventory_quantity: 0,
  description: "", short_description: "", ingredients: "", how_to_use: "", seo_title: "", seo_description: "",
  category_id: null, is_active: true, is_featured: false, is_best_seller: false, is_new_arrival: false, is_on_sale: false,
};

const field = "w-full border bg-background px-3 py-2 text-sm";

export function ProductEditor({ productId, onSaved }: { productId?: string; onSaved?: (id: string) => void }) {
  const [form, setForm] = useState<FormState>(empty);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(Boolean(productId));

  useEffect(() => {
    adminCategoryOptionsFn().then(setCategories).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load categories."));
    if (!productId) return;
    adminProductFn({ data: { id: productId } }).then((data) => {
      setForm({ ...empty, ...data, compare_at_price: data.compare_at_price == null ? null : Number(data.compare_at_price), price: Number(data.price) });
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Product not found.");
      setLoading(false);
    });
  }, [productId]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const parsed = schema.safeParse({ ...form, price: Number(form.price), inventory_quantity: Number(form.inventory_quantity), compare_at_price: form.compare_at_price == null || form.compare_at_price === ("" as unknown) ? null : Number(form.compare_at_price) });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the form."); return; }
    try {
      const data = await adminSaveProductFn({ data: { id: productId ?? null, product: { ...parsed.data, seo_title: parsed.data.seo_title, seo_description: parsed.data.seo_description } } });
      setNotice("Saved.");
      onSaved?.(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  async function upload(file: File) {
    if (!productId) { setError("Save the product before uploading images."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5_000_000) {
      setError("Use a JPG, PNG, or WebP under 5 MB.");
      return;
    }
    const dataBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? "");
        const comma = result.indexOf(",");
        resolve(comma >= 0 ? result.slice(comma + 1) : result);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    try {
      await adminUploadImageFn({ data: { productId, mime: file.type as "image/jpeg" | "image/png" | "image/webp", dataBase64, alt: form.name } });
      setNotice("Image uploaded.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload the image.");
    }
  }

  async function remove() {
    if (!productId) return;
    try {
      await adminDeleteProductFn({ data: { id: productId } });
      setNotice("Deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
    }
  }

  if (loading) return <div className="h-40 animate-pulse bg-secondary" />;
  return (
    <form className="space-y-4" onSubmit={save}>
      <h1 className="text-4xl">{productId ? "Edit product" : "New product"}</h1>
      <label className="block text-sm">Name<input className={`${field} mt-1`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="block text-sm">Slug<input className={`${field} mt-1`} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Price<input type="number" min="0" step="0.01" className={`${field} mt-1`} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
        <label className="text-sm">Compare at<input type="number" min="0" step="0.01" className={`${field} mt-1`} value={form.compare_at_price ?? ""} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value === "" ? null : Number(e.target.value) })} /></label>
        <label className="text-sm">Inventory<input type="number" min="0" step="1" className={`${field} mt-1`} value={form.inventory_quantity} onChange={(e) => setForm({ ...form, inventory_quantity: Number(e.target.value) })} /></label>
      </div>
      <label className="block text-sm">Category
        <select className={`${field} mt-1`} value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}>
          <option value="">None</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className="block text-sm">Short description<textarea className={`${field} mt-1`} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></label>
      <label className="block text-sm">Description<textarea className={`${field} mt-1`} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
      <label className="block text-sm">Ingredients<textarea className={`${field} mt-1`} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /></label>
      <label className="block text-sm">How to use<textarea className={`${field} mt-1`} value={form.how_to_use} onChange={(e) => setForm({ ...form, how_to_use: e.target.value })} /></label>
      <label className="block text-sm">SEO title<input className={`${field} mt-1`} value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></label>
      <label className="block text-sm">SEO description<textarea className={`${field} mt-1`} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></label>
      <div className="flex flex-wrap gap-4 text-sm">
        {(["is_active", "is_featured", "is_best_seller", "is_new_arrival", "is_on_sale"] as const).map((key) => (
          <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />{key.replaceAll("_", " ")}</label>
        ))}
      </div>
      {productId && <label className="block text-sm">Product image<input type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block" onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); }} /></label>}
      {error && <p className="text-sm" role="alert">{error}</p>}
      {notice && <p className="text-sm">{notice}</p>}
      <div className="flex gap-3">
        <button className="btn btn-primary">Save</button>
        {productId && <button type="button" className="btn btn-outline" onClick={() => setForm({ ...form, is_active: false })}>Mark inactive</button>}
        {productId && <button type="button" className="text-sm underline" onClick={remove}>Delete if unused</button>}
      </div>
    </form>
  );
}

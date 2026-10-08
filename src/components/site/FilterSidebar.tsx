import type { ReactNode } from "react";
import { useCatalog } from "@/lib/storefront";
import type { Product } from "@/lib/types";

export type Filters = {
  query: string;
  categories: string[];
  collections: string[];
  types: string[];
  availability: string[];
  prices: string[];
  rating: number;
  sort: string;
};

export const emptyFilters = (sort = "featured"): Filters => ({
  query: "",
  categories: [],
  collections: [],
  types: [],
  availability: [],
  prices: [],
  rating: 0,
  sort,
});

const priceBands = [
  { id: "under-15", label: "Under $15", test: (price: number) => price < 15 },
  { id: "15-30", label: "$15 – $30", test: (price: number) => price >= 15 && price <= 30 },
  { id: "30-50", label: "$30 – $50", test: (price: number) => price > 30 && price <= 50 },
  { id: "over-50", label: "Over $50", test: (price: number) => price > 50 },
];

export const sortOptions = [
  ["featured", "Featured"],
  ["newest", "Newest"],
  ["low", "Price: Low to High"],
  ["high", "Price: High to Low"],
  ["selling", "Best Selling"],
  ["rating", "Top Rated"],
] as const;

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function applyFilters(items: Product[], filters: Filters) {
  let list = items.filter((product) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const hay = `${product.name} ${product.scent} ${product.description} ${product.productType}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.categories.length && !filters.categories.includes(product.category)) return false;
    if (filters.collections.length && !filters.collections.some((c) => product.collections.includes(c))) return false;
    if (filters.types.length && !filters.types.includes(product.productType)) return false;
    if (filters.availability.length) {
      const inStock = product.inStock ? "in" : "out";
      if (!filters.availability.includes(inStock)) return false;
    }
    if (filters.rating && product.rating < filters.rating) return false;
    if (filters.prices.length && !filters.prices.some((id) => priceBands.find((band) => band.id === id)?.test(product.price))) return false;
    return true;
  });
  if (filters.sort === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (filters.sort === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (filters.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
  if (filters.sort === "selling") list = [...list].sort((a, b) => b.sold - a.sold);
  if (filters.sort === "newest") list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list;
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="border-b py-5">
      <legend className="eyebrow">{title}</legend>
      <div className="mt-3 space-y-2">{children}</div>
    </fieldset>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}

export function FilterFields({ items, filters, setFilters, hideCategory = false }: {
  items: Product[];
  filters: Filters;
  setFilters: (next: Filters) => void;
  hideCategory?: boolean;
}) {
  const { categories, collections } = useCatalog();
  const types = [...new Set(items.map((p) => p.productType))];
  return (
    <div>
      {!hideCategory && (
        <Group title="Category">
          {categories.map((c) => (
            <Check key={c.slug} label={c.name} checked={filters.categories.includes(c.slug)} onChange={() => setFilters({ ...filters, categories: toggle(filters.categories, c.slug) })} />
          ))}
        </Group>
      )}
      <Group title="Price">
        {priceBands.map((band) => (
          <Check key={band.id} label={band.label} checked={filters.prices.includes(band.id)} onChange={() => setFilters({ ...filters, prices: toggle(filters.prices, band.id) })} />
        ))}
      </Group>
      <Group title="Availability">
        <Check label="In stock" checked={filters.availability.includes("in")} onChange={() => setFilters({ ...filters, availability: toggle(filters.availability, "in") })} />
        <Check label="Sold out" checked={filters.availability.includes("out")} onChange={() => setFilters({ ...filters, availability: toggle(filters.availability, "out") })} />
      </Group>
      <Group title="Rating">
        {[4, 3].map((n) => (
          <label key={n} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name="rating" checked={filters.rating === n} onChange={() => setFilters({ ...filters, rating: n })} className="h-4 w-4 accent-[var(--primary)]" />
            {n} stars & up
          </label>
        ))}
        <button type="button" className="text-xs underline" onClick={() => setFilters({ ...filters, rating: 0 })}>Any rating</button>
      </Group>
      <Group title="Collection">
        {collections.map((c) => (
          <Check key={c.slug} label={c.name} checked={filters.collections.includes(c.slug)} onChange={() => setFilters({ ...filters, collections: toggle(filters.collections, c.slug) })} />
        ))}
      </Group>
      <Group title="Product type">
        {types.map((type) => (
          <Check key={type} label={type} checked={filters.types.includes(type)} onChange={() => setFilters({ ...filters, types: toggle(filters.types, type) })} />
        ))}
      </Group>
    </div>
  );
}

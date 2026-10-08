import { categories, collections, coupons, posts, products, reviews } from "./products";
import type { Category, Collection, Coupon, Post, Product, Review } from "./types";

/** Resources a future admin dashboard should manage. No dashboard UI is shipped yet. */
export const adminResources = [
  "products",
  "categories",
  "inventory",
  "orders",
  "customers",
  "discounts",
  "reviews",
  "homepage",
  "posts",
  "coupons",
] as const;

export type AdminResource = (typeof adminResources)[number];

export type HomepageSection = {
  id: string;
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  body?: string;
};

export const homepageSections: HomepageSection[] = [
  { id: "hero", enabled: true, eyebrow: "Handcrafted Self-Care", title: "Small-Batch Rituals for Everyday Wellbeing" },
  { id: "categories", enabled: true, title: "Find Your Everyday Ritual" },
  { id: "bestsellers", enabled: true, title: "Customer Favorites" },
  { id: "featured", enabled: true, title: "Made for Your Ritual" },
  { id: "new", enabled: true, title: "New & Noteworthy" },
  { id: "rituals", enabled: true, title: "Shop by Ritual" },
  { id: "promo", enabled: true, title: "Treat Yourself" },
  { id: "journal", enabled: true, title: "Notes on Slow Living" },
  { id: "social", enabled: true, title: "Follow Along" },
  { id: "newsletter", enabled: true, title: "Stay in the Ritual" },
];

export interface AdminAdapter {
  list(resource: AdminResource): Promise<unknown[]>;
  get(resource: AdminResource, id: string): Promise<unknown | null>;
  save(resource: AdminResource, record: { id?: string; slug?: string }): Promise<unknown>;
  remove(resource: AdminResource, id: string): Promise<void>;
}

const catalog: Record<string, unknown[]> = {
  products,
  categories,
  inventory: products.map((p) => ({ slug: p.slug, inStock: p.inStock, variants: p.variants })),
  orders: [],
  customers: [],
  discounts: coupons,
  reviews,
  homepage: homepageSections,
  posts,
  coupons,
};

/** Swap this adapter for API calls when the admin backend exists. */
export const adminAdapter: AdminAdapter = {
  async list(resource) {
    return catalog[resource] ?? [];
  },
  async get(resource, id) {
    const rows = catalog[resource] ?? [];
    return (
      rows.find((row) => {
        const record = row as { id?: string; slug?: string };
        return record.id === id || record.slug === id;
      }) ?? null
    );
  },
  async save(resource, record) {
    const rows = catalog[resource] ?? [];
    const key = record.id ?? record.slug;
    const index = rows.findIndex((row) => {
      const current = row as { id?: string; slug?: string };
      return current.id === key || current.slug === key;
    });
    if (index >= 0) rows[index] = { ...(rows[index] as object), ...record };
    else rows.push(record);
    catalog[resource] = rows;
    return record;
  },
  async remove(resource, id) {
    catalog[resource] = (catalog[resource] ?? []).filter((row) => {
      const record = row as { id?: string; slug?: string };
      return record.id !== id && record.slug !== id;
    });
  },
};

export type AdminProduct = Product;
export type AdminCategory = Category;
export type AdminCollection = Collection;
export type AdminPost = Post;
export type AdminReview = Review;
export type AdminCoupon = Coupon;

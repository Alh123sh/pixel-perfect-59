import soap from "@/assets/soap.jpg";
import candle from "@/assets/candle.jpg";
import cream from "@/assets/cream.jpg";
import bath from "@/assets/bath.jpg";
import gift from "@/assets/gift.jpg";
import hero from "@/assets/hero.jpg";
import { useLoaderData } from "@tanstack/react-router";
import { fetchCatalogFn, getReviewsFn, previewCouponFn, submitReviewFn, subscribeNewsletterFn } from "@/server/fns";
import { categories as localCategories, collections as localCollections, products as localProducts, reviews as localReviews } from "./products";
import type { Category, Collection, Product, Review, Variant } from "./types";

const ship = "Ships in 1–3 business days. Free shipping on orders over $75.";
const returns = "Unopened items may be returned within 30 days of delivery.";

const localImage: Record<string, { image: string; hover: string }> = {
  "lavender-oat-soap": { image: soap, hover: cream },
  "sage-soy-candle": { image: candle, hover: hero },
  "shea-vanilla-body-butter": { image: cream, hover: bath },
  "rose-himalayan-bath-salts": { image: bath, hover: gift },
  "self-care-gift-set": { image: gift, hover: candle },
  "eucalyptus-body-oil": { image: hero, hover: bath },
  "calendula-honey-soap": { image: soap, hover: gift },
  "linen-amber-candle": { image: candle, hover: cream },
  "cedar-room-spray": { image: hero, hover: candle },
  "linen-mist": { image: bath, hover: hero },
};

export type StorefrontSnapshot = {
  source: "local" | "postgres";
  products: Product[];
  categories: Category[];
  collections: Collection[];
  error: string;
};

type DbImage = { image_url: string; alt_text: string | null; sort_order: number; is_primary: boolean };
type DbVariant = { sku: string; name: string; price: number | string | null; inventory_quantity: number; is_active: boolean };
type DbReview = { rating: number; status: string; title?: string; comment?: string; created_at?: string; id?: string; user_id?: string | null };
type DbCategory = { slug: string; name: string; description?: string | null; image_url?: string | null };
type DbCollection = { slug: string; name: string; description?: string | null; image_url?: string | null };
type DbProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  inventory_quantity: number;
  track_inventory: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  ingredients: string | null;
  how_to_use: string | null;
  details: string | null;
  product_type: string | null;
  scent: string | null;
  size_label: string | null;
  rituals: string[] | null;
  badge: Product["badge"] | null;
  sold_count: number;
  created_at: string;
  categories: DbCategory | DbCategory[] | null;
  product_images: DbImage[] | null;
  product_variants: DbVariant[] | null;
  collection_products: { collections: DbCollection | DbCollection[] | null }[] | null;
  reviews: DbReview[] | null;
};

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function moneyNumber(value: number | string | null | undefined) {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function mapProduct(row: DbProduct): Product {
  const category = one(row.categories);
  const images = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const primary = images.find((image) => image.is_primary) ?? images[0];
  const local = localImage[row.slug];
  const image = primary?.image_url || local?.image || hero;
  const hover = images.find((item) => item !== primary)?.image_url || local?.hover || image;
  const gallery = images.length ? images.map((item) => item.image_url) : [image, hover];
  const variants: Variant[] = (row.product_variants ?? [])
    .filter((variant) => variant.is_active)
    .map((variant) => ({
      id: variant.sku,
      name: variant.name,
      price: variant.price == null ? moneyNumber(row.price) : moneyNumber(variant.price),
      inStock: variant.inventory_quantity > 0,
    }));
  const approved = (row.reviews ?? []).filter((review) => review.status === "approved");
  const rating = approved.length ? approved.reduce((sum, review) => sum + review.rating, 0) / approved.length : 0;
  const variantStock = variants.length > 0 && variants.some((variant) => variant.inStock);
  const inStock = variants.length > 0 ? variantStock : !row.track_inventory || row.inventory_quantity > 0;
  const collections = (row.collection_products ?? [])
    .map((entry) => one(entry.collections)?.slug)
    .filter((slug): slug is string => Boolean(slug));
  const badge = row.badge ?? (row.is_best_seller ? "Best Seller" : row.is_new_arrival ? "New" : row.is_on_sale ? "Sale" : undefined);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category?.slug ?? "",
    productType: row.product_type ?? "",
    collections,
    price: moneyNumber(row.price),
    ...(row.compare_at_price != null ? { compareAt: moneyNumber(row.compare_at_price) } : {}),
    image,
    hoverImage: hover,
    images: gallery,
    scent: row.scent ?? "",
    size: row.size_label ?? "",
    rating: Math.round(rating * 10) / 10,
    reviews: approved.length,
    ...(badge ? { badge } : {}),
    needs: row.rituals ?? [],
    rituals: row.rituals ?? [],
    description: row.description ?? row.short_description ?? "",
    ingredients: row.ingredients ?? "",
    howToUse: row.how_to_use ?? "",
    details: row.details ?? "Made in small batches and packed in recyclable materials.",
    shipping: ship,
    returns,
    inStock,
    variants,
    createdAt: row.created_at.slice(0, 10),
    sold: row.sold_count,
  };
}

function localSnapshot(): StorefrontSnapshot {
  return { source: "local", products: localProducts, categories: localCategories, collections: localCollections, error: "" };
}

let cached: { at: number; data: StorefrontSnapshot } | null = null;
let inflight: Promise<StorefrontSnapshot> | null = null;

export function useCatalog() {
  return useLoaderData({ from: "__root__" }) as StorefrontSnapshot;
}

export function loadStorefront(): Promise<StorefrontSnapshot> {
  if (cached && Date.now() - cached.at < 15000 && !cached.data.error) return Promise.resolve(cached.data);
  if (!inflight) {
    inflight = fetchStorefront()
      .then((data) => {
        cached = { at: Date.now(), data };
        return data;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export function clearStorefrontCache() {
  cached = null;
}

async function fetchStorefront(): Promise<StorefrontSnapshot> {
  const data = await fetchCatalogFn();
  if (data.source === "local") return localSnapshot();
  if (data.error) return { source: "postgres", products: [], categories: [], collections: [], error: data.error };
  const products = data.products.map((row) => mapProduct(row as DbProduct));
  const categories: Category[] = data.categories.map((category) => ({
    slug: category.slug,
    name: category.name,
    blurb: category.description ?? "",
    image: category.image_url || localImageForCategory(category.slug),
  }));
  const collections: Collection[] = data.collections.map((collection) => ({
    slug: collection.slug,
    name: collection.name,
    description: collection.description ?? "",
    image: collection.image_url || hero,
  }));
  return { source: "postgres", products, categories, collections, error: "" };
}

function localImageForCategory(slug: string) {
  return localCategories.find((category) => category.slug === slug)?.image ?? hero;
}

export async function getProducts() {
  return (await loadStorefront()).products;
}

export async function getProductBySlug(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductById(id: string) {
  const products = await getProducts();
  return products.find((product) => product.id === id) ?? null;
}

export async function getCategories() {
  return (await loadStorefront()).categories;
}

export async function getCollections() {
  return (await loadStorefront()).collections;
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter((product) => product.collections.includes("ritual-edit")).slice(0, 4);
}

export async function getBestSellers() {
  const products = await getProducts();
  return products.filter((product) => product.badge === "Best Seller").slice(0, 4);
}

export async function getNewArrivals() {
  const products = await getProducts();
  return products.filter((product) => product.badge === "New").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const { products, categories } = await loadStorefront();
  return products.filter((product) => {
    const category = categories.find((item) => item.slug === product.category)?.name ?? product.category;
    return [product.name, product.scent, product.category, product.productType, product.description, category].join(" ").toLowerCase().includes(q);
  });
}

export async function getRelatedProducts(slug: string) {
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) return [];
  return products.filter((item) => item.slug !== slug && (item.category === product.category || item.collections.some((collection) => product.collections.includes(collection)))).slice(0, 4);
}

export function relatedFrom(products: Product[], slug: string) {
  const product = products.find((item) => item.slug === slug);
  if (!product) return products.filter((item) => item.slug !== slug).slice(0, 4);
  return products.filter((item) => item.slug !== slug && (item.category === product.category || item.collections.some((collection) => product.collections.includes(collection)))).slice(0, 4);
}

export async function getProductReviews(slug: string): Promise<Review[]> {
  const data = await getReviewsFn({ data: { slug } });
  if (data.source === "local") return localReviews.filter((review) => review.productSlug === slug);
  return data.reviews;
}

export async function submitProductReview(input: { productId: string; rating: number; title: string; comment: string }) {
  await submitReviewFn({ data: input });
}

export async function subscribeNewsletter(email: string) {
  await subscribeNewsletterFn({ data: { email } });
}

export async function previewCoupon(code: string, subtotal: number) {
  return previewCouponFn({ data: { code, subtotal } });
}

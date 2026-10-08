import {
  byCollection,
  categories,
  collections,
  coupons,
  getCategory,
  getCollection,
  getProduct,
  isSoldOut,
  lineKey,
  posts,
  products,
  reviews as seedReviews,
  unitPrice,
  variantOf,
} from "./products";
import type { Address, CartItem, Coupon, Customer, Order, OrderItem, Review, Wishlist } from "./types";

/**
 * Catalog and commerce services.
 * Each function is the seam for a future API call. UI should use these
 * instead of reading mock arrays directly.
 */

export function getProducts() {
  return products;
}

export function getProductBySlug(slug: string) {
  return getProduct(slug) ?? null;
}

export function getCategories() {
  return categories;
}

export function getCategoryBySlug(slug: string) {
  return getCategory(slug) ?? null;
}

export function getCollections() {
  return collections;
}

export function getCollectionBySlug(slug: string) {
  const collection = getCollection(slug);
  if (!collection) return null;
  return { ...collection, products: byCollection(slug) };
}

export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((p) =>
    [p.name, p.scent, p.category, p.productType, p.description, categoryLabel(p.category)].join(" ").toLowerCase().includes(q),
  );
}

export function searchCategories(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return categories.filter((c) => `${c.name} ${c.blurb}`.toLowerCase().includes(q));
}

export function getFeaturedProducts() {
  return products.filter((p) => p.collections.includes("ritual-edit")).slice(0, 4);
}

export function getBestSellers() {
  return products.filter((p) => p.badge === "Best Seller").slice(0, 4);
}

export function getNewArrivals() {
  return [...products].filter((p) => p.badge === "New").sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRelatedProducts(slug: string) {
  const product = getProduct(slug);
  if (!product) return [];
  return products.filter((p) => p.slug !== slug && (p.category === product.category || p.collections.some((c) => product.collections.includes(c)))).slice(0, 4);
}

export function getJournalPosts() {
  return posts;
}

export function getJournalPost(slug: string) {
  return posts.find((p) => p.slug === slug) ?? null;
}

function categoryLabel(slug: string) {
  return getCategory(slug)?.name ?? slug;
}

export function getReviews(productSlug: string, extra: Review[] = []) {
  return [...seedReviews, ...extra].filter((r) => r.productSlug === productSlug);
}

export function submitReview(input: Omit<Review, "id" | "date" | "verified">): Review {
  return {
    ...input,
    id: `local-${Date.now()}`,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    verified: false,
  };
}

export function findCoupon(code: string): Coupon | null {
  return coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) ?? null;
}

export function discountAmount(code: string | undefined, subtotal: number) {
  if (!code) return { amount: 0, error: "" };
  const coupon = findCoupon(code);
  if (!coupon) return { amount: 0, error: "That code is not recognized." };
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return { amount: 0, error: `Add $${(coupon.minSubtotal - subtotal).toFixed(2)} more to use ${coupon.code}.` };
  }
  const amount = coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value;
  return { amount: Math.min(subtotal, amount), error: "" };
}

export function addToCart(items: CartItem[], next: CartItem): CartItem[] {
  const key = lineKey(next.slug, next.variantId);
  const existing = items.find((item) => lineKey(item.slug, item.variantId) === key);
  if (!existing) return [...items, next];
  return items.map((item) => (lineKey(item.slug, item.variantId) === key ? { ...item, qty: item.qty + next.qty } : item));
}

export function updateCart(items: CartItem[], slug: string, qty: number, variantId?: string | undefined): CartItem[] {
  const key = lineKey(slug, variantId);
  if (qty <= 0) return items.filter((item) => lineKey(item.slug, item.variantId) !== key);
  return items.map((item) => (lineKey(item.slug, item.variantId) === key ? { ...item, qty } : item));
}

export function removeFromCart(items: CartItem[], slug: string, variantId?: string | undefined) {
  const key = lineKey(slug, variantId);
  return items.filter((item) => lineKey(item.slug, item.variantId) !== key);
}

export function addWishlist(list: Wishlist, slug: string): Wishlist {
  if (list.productSlugs.includes(slug)) return list;
  return { productSlugs: [...list.productSlugs, slug] };
}

export function removeWishlist(list: Wishlist, slug: string): Wishlist {
  return { productSlugs: list.productSlugs.filter((item) => item !== slug) };
}

export function shippingCost(subtotal: number) {
  if (subtotal === 0 || subtotal >= 75) return 0;
  return 8;
}

export function createOrder(input: {
  email: string;
  address: Address;
  delivery: string;
  payment: string;
  items: CartItem[];
  discount: number;
  shipping?: number | undefined;
}): Order {
  const lines: OrderItem[] = input.items.flatMap((item) => {
    const product = getProduct(item.slug);
    if (!product || isSoldOut(product)) return [];
    const variant = variantOf(product, item.variantId);
    return [{
      slug: product.slug,
      name: product.name,
      variant: variant?.name,
      qty: item.qty,
      price: unitPrice(product, item.variantId),
      image: product.image,
    }];
  });
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const shipping = input.shipping ?? shippingCost(subtotal);
  const discount = Math.min(input.discount, subtotal);
  return {
    id: `63-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: "Processing",
    email: input.email,
    shippingAddress: `${input.address.firstName} ${input.address.lastName}, ${input.address.line1}, ${input.address.city}, ${input.address.state} ${input.address.zip}`,
    delivery: input.delivery,
    payment: input.payment,
    items: lines,
    subtotal,
    shipping,
    discount,
    total: Math.max(0, subtotal - discount) + shipping,
  };
}

export function getCustomerOrders(orders: Order[]) {
  return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const emptyCustomer = (): Customer => ({
  id: "cust_local",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});

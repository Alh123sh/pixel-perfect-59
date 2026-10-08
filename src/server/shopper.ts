import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { databaseConfigured, getDb } from "@/db/client";
import type { Order, OrderItem } from "@/lib/types";
import { addresses, cartItems, carts, newsletterSubscribers, orderItems, orders, productVariants, products, reviews, users, wishlistItems } from "@/db/schema";
import { requireUser } from "./session";

export async function subscribeNewsletter(email: string) {
  if (!databaseConfigured()) throw new Error("Newsletter signup needs the store database.");
  try {
    await getDb().insert(newsletterSubscribers).values({ email: email.trim().toLowerCase() });
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
    if (code === "23505") return;
    throw new Error("Could not save that subscription.");
  }
}

export async function submitReview(token: string | undefined, input: { productId: string; rating: number; title: string; comment: string }) {
  const user = await requireUser(token);
  if (input.rating < 1 || input.rating > 5) throw new Error("Choose a rating from 1 to 5.");
  const db = getDb();
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, input.productId)).limit(1);
  if (!product) throw new Error("This product is not in the store database yet.");
  const paid = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orderItems.productId, product.id), eq(orders.userId, user.id), eq(orders.paymentStatus, "paid")))
    .limit(1);
  if (paid.length === 0) {
    await db.insert(reviews).values({
      productId: product.id,
      userId: user.id,
      rating: input.rating,
      title: input.title.trim(),
      comment: input.comment.trim(),
      status: "pending",
    });
    return;
  }
  await db.insert(reviews).values({
    productId: product.id,
    userId: user.id,
    rating: input.rating,
    title: input.title.trim(),
    comment: input.comment.trim(),
    status: "pending",
  });
}

export async function productReviews(slug: string) {
  if (!databaseConfigured()) return { source: "local" as const, reviews: [] };
  const db = getDb();
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  if (!product) return { source: "postgres" as const, reviews: [] };
  const rows = await db.select().from(reviews).where(and(eq(reviews.productId, product.id), eq(reviews.status, "approved")));
  const paid = await db
    .select({ userId: orders.userId })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orderItems.productId, product.id), eq(orders.paymentStatus, "paid")));
  const buyers = new Set(paid.map((row) => row.userId).filter((id): id is string => Boolean(id)));
  return {
    source: "postgres" as const,
    reviews: rows.map((review) => ({
      id: review.id,
      productSlug: slug,
      name: "Customer",
      rating: review.rating,
      title: review.title,
      body: review.comment,
      date: review.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      verified: review.userId ? buyers.has(review.userId) : false,
    })),
  };
}

export async function mergeGuestCart(token: string | undefined, items: { slug: string; quantity: number; variant_sku?: string | undefined }[]) {
  const user = await requireUser(token);
  const db = getDb();
  let [cart] = await db.select().from(carts).where(eq(carts.userId, user.id)).limit(1);
  if (!cart) {
    const [created] = await db.insert(carts).values({ userId: user.id }).returning();
    cart = created;
  }
  if (!cart) return [];
  for (const item of items) {
    const [product] = await db.select().from(products).where(and(eq(products.slug, item.slug), eq(products.isActive, true))).limit(1);
    if (!product) continue;
    const sku = item.variant_sku?.trim() ?? "";
    const [variant] = sku
      ? await db.select().from(productVariants).where(and(eq(productVariants.productId, product.id), eq(productVariants.sku, sku), eq(productVariants.isActive, true))).limit(1)
      : [];
    if (sku && !variant) continue;
    const existing = await db.select().from(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, product.id)));
    const match = existing.find((row) => (row.variantId ?? null) === (variant?.id ?? null));
    const quantity = Math.min(20, item.quantity + (match?.quantity ?? 0));
    if (match) await db.update(cartItems).set({ quantity, updatedAt: new Date() }).where(eq(cartItems.id, match.id));
    else await db.insert(cartItems).values({ cartId: cart.id, productId: product.id, variantId: variant?.id ?? null, quantity: Math.min(20, item.quantity) });
  }
  const lines = await db
    .select({ slug: products.slug, quantity: cartItems.quantity, variantSku: productVariants.sku })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .leftJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .where(eq(cartItems.cartId, cart.id));
  return lines.map((line) => ({ slug: line.slug, quantity: line.quantity, variant_sku: line.variantSku ?? "" }));
}

async function wishlistSlugs(userId: string) {
  const rows = await getDb()
    .select({ slug: products.slug })
    .from(wishlistItems)
    .innerJoin(products, eq(products.id, wishlistItems.productId))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));
  return rows.map((row) => row.slug);
}

export async function syncWishlist(token: string | undefined, slugs: string[]) {
  const user = await requireUser(token);
  const db = getDb();
  for (const slug of slugs) {
    const [product] = await db.select({ id: products.id }).from(products).where(and(eq(products.slug, slug), eq(products.isActive, true))).limit(1);
    if (!product) continue;
    await db.insert(wishlistItems).values({ userId: user.id, productId: product.id }).onConflictDoNothing();
  }
  return wishlistSlugs(user.id);
}

export async function toggleWishlist(token: string | undefined, slug: string) {
  const user = await requireUser(token);
  const db = getDb();
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.slug, slug)).limit(1);
  if (!product) throw new Error("That product is not in the store.");
  const [existing] = await db.select({ id: wishlistItems.id }).from(wishlistItems).where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, product.id))).limit(1);
  if (existing) await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
  else await db.insert(wishlistItems).values({ userId: user.id, productId: product.id });
  return wishlistSlugs(user.id);
}

const orderStatusLabel = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
} as const;

function addressText(value: unknown) {
  if (!value || typeof value !== "object") return "";
  const address = value as Record<string, string>;
  return [address["recipient_name"], address["address_line_1"], address["address_line_2"], address["city"], address["state_or_region"], address["postal_code"]].filter(Boolean).join(", ");
}

function paymentText(status: string) {
  if (status === "paid") return "Paid";
  if (status === "failed") return "Payment failed";
  if (status === "refunded") return "Refunded";
  if (status === "partially_refunded") return "Partially refunded";
  return "Payment pending";
}

export async function listMyOrders(token: string | undefined): Promise<Order[]> {
  const user = await requireUser(token);
  const db = getDb();
  await db.update(orders).set({ userId: user.id, updatedAt: new Date() }).where(and(eq(orders.customerEmail, user.email), isNull(orders.userId)));
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
  if (rows.length === 0) return [];
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((row) => row.id)));
  return rows.map((row) => {
    const lines: OrderItem[] = items.filter((item) => item.orderId === row.id).map((item) => ({
      slug: item.productSku || item.id,
      name: item.productName,
      ...(item.variantName ? { variant: item.variantName } : {}),
      qty: item.quantity,
      price: Number(item.unitPrice),
      image: item.productImageUrl,
    }));
    const status = orderStatusLabel[row.status as keyof typeof orderStatusLabel] ?? "Pending";
    const paymentStatus = (["pending", "paid", "failed", "partially_refunded", "refunded"] as const).find((item) => item === row.paymentStatus) ?? "pending";
    return {
      id: row.orderNumber,
      createdAt: row.createdAt.toISOString(),
      status,
      paymentStatus,
      email: row.customerEmail,
      shippingAddress: addressText(row.shippingAddress),
      delivery: row.shippingMethod === "express" ? "Express" : "Standard",
      payment: paymentText(row.paymentStatus),
      items: lines,
      subtotal: Number(row.subtotal),
      shipping: Number(row.shippingTotal),
      discount: Number(row.discountTotal),
      total: Number(row.total),
    };
  });
}

export async function updateProfile(token: string | undefined, input: { fullName: string; email: string; phone: string }) {
  const user = await requireUser(token);
  const email = input.email.trim().toLowerCase();
  await getDb().update(users).set({
    fullName: input.fullName.trim(),
    email,
    phone: input.phone.trim(),
    updatedAt: new Date(),
  }).where(eq(users.id, user.id));
}

export async function saveAddress(token: string | undefined, input: { label: string; line1: string; city: string; state: string; zip: string; isDefault: boolean }) {
  const user = await requireUser(token);
  const db = getDb();
  if (input.isDefault) await db.update(addresses).set({ isDefault: false }).where(eq(addresses.userId, user.id));
  await db.insert(addresses).values({
    userId: user.id,
    recipientName: input.label.trim(),
    addressLine1: input.line1.trim(),
    city: input.city.trim(),
    stateOrRegion: input.state.trim(),
    postalCode: input.zip.trim(),
    isDefault: input.isDefault,
  });
}

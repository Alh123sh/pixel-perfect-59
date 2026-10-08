import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { auditLogs, categories, collectionProducts, collections, coupons, orderItems, orders, payments, productImages, productVariants, products, reviews, storeSettings, users } from "@/db/schema";
import { requireAdmin } from "./session";

async function actor(token: string | undefined) {
  return requireAdmin(token);
}

async function audit(userId: string, action: string, entityType: string, entityId: string | null, metadata: Record<string, unknown>) {
  await getDb().insert(auditLogs).values({ actorUserId: userId, action, entityType, entityId, metadata });
}

export async function dashboard(token: string | undefined) {
  await actor(token);
  const db = getDb();
  const [totals] = await db.select({
    total: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid'), 0)`,
    today: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid' and ${orders.createdAt} >= date_trunc('day', now())), 0)`,
    week: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid' and ${orders.createdAt} >= now() - interval '7 days'), 0)`,
    month: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid' and ${orders.createdAt} >= now() - interval '30 days'), 0)`,
  }).from(orders);
  const [orderCount] = await db.select({ value: count() }).from(orders);
  const [pending] = await db.select({ value: count() }).from(orders).where(eq(orders.status, "pending"));
  const [low] = await db.select({ value: count() }).from(products).where(and(eq(products.trackInventory, true), gte(products.inventoryQuantity, 1), lte(products.inventoryQuantity, 5)));
  const [out] = await db.select({ value: count() }).from(products).where(and(eq(products.trackInventory, true), eq(products.inventoryQuantity, 0)));
  const [customers] = await db.select({ value: count() }).from(users).where(gte(users.createdAt, sql`now() - interval '30 days'`));
  const recent = await db.select({
    order_number: orders.orderNumber,
    customer_email: orders.customerEmail,
    total: orders.total,
    payment_status: orders.paymentStatus,
    status: orders.status,
  }).from(orders).orderBy(desc(orders.createdAt)).limit(8);
  const sellers = await db.select({ name: products.name, slug: products.slug, sold_count: products.soldCount }).from(products).where(eq(products.isActive, true)).orderBy(desc(products.soldCount), asc(products.name)).limit(5);
  const series = await db.select({
    day: sql<string>`to_char(${orders.createdAt} at time zone 'utc', 'YYYY-MM-DD')`,
    total: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.paymentStatus} = 'paid'), 0)`,
  }).from(orders).where(gte(orders.createdAt, sql`now() - interval '14 days'`)).groupBy(sql`to_char(${orders.createdAt} at time zone 'utc', 'YYYY-MM-DD')`);
  const byDay = new Map(series.map((row) => [row.day, Number(row.total)]));
  const salesByDay = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - (13 - index));
    const day = date.toISOString().slice(0, 10);
    return { day, total: byDay.get(day) ?? 0 };
  });
  return {
    total_sales: Number(totals?.total ?? 0),
    today_sales: Number(totals?.today ?? 0),
    sales_7_day: Number(totals?.week ?? 0),
    sales_30_day: Number(totals?.month ?? 0),
    total_orders: orderCount?.value ?? 0,
    pending_orders: pending?.value ?? 0,
    low_stock: low?.value ?? 0,
    out_of_stock: out?.value ?? 0,
    new_customers: customers?.value ?? 0,
    recent_orders: recent,
    best_sellers: sellers,
    sales_by_day: salesByDay,
  };
}

export async function listProducts(token: string | undefined) {
  await actor(token);
  const rows = await getDb().select({
    id: products.id,
    name: products.name,
    slug: products.slug,
    price: products.price,
    is_active: products.isActive,
    inventory_quantity: products.inventoryQuantity,
  }).from(products).orderBy(asc(products.name));
  return rows;
}

const productFields = {
  name: products.name,
  slug: products.slug,
  price: products.price,
  compare_at_price: products.compareAtPrice,
  inventory_quantity: products.inventoryQuantity,
  description: products.description,
  short_description: products.shortDescription,
  ingredients: products.ingredients,
  how_to_use: products.howToUse,
  seo_title: products.seoTitle,
  seo_description: products.seoDescription,
  category_id: products.categoryId,
  is_active: products.isActive,
  is_featured: products.isFeatured,
  is_best_seller: products.isBestSeller,
  is_new_arrival: products.isNewArrival,
  is_on_sale: products.isOnSale,
};

export async function getProduct(token: string | undefined, id: string) {
  await actor(token);
  const [row] = await getDb().select(productFields).from(products).where(eq(products.id, id)).limit(1);
  if (!row) throw new Error("Product not found.");
  return { ...row, seo_title: row.seo_title ?? "", seo_description: row.seo_description ?? "" };
}

type ProductInput = {
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  description: string;
  short_description: string;
  ingredients: string;
  how_to_use: string;
  seo_title: string;
  seo_description: string;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
};

function productValues(input: ProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    price: input.price,
    compareAtPrice: input.compare_at_price,
    inventoryQuantity: input.inventory_quantity,
    description: input.description,
    shortDescription: input.short_description,
    ingredients: input.ingredients,
    howToUse: input.how_to_use,
    seoTitle: input.seo_title || null,
    seoDescription: input.seo_description || null,
    categoryId: input.category_id,
    isActive: input.is_active,
    isFeatured: input.is_featured,
    isBestSeller: input.is_best_seller,
    isNewArrival: input.is_new_arrival,
    isOnSale: input.is_on_sale,
    updatedAt: new Date(),
  };
}

export async function saveProduct(token: string | undefined, id: string | null, input: ProductInput) {
  const user = await actor(token);
  const db = getDb();
  if (id) {
    const [row] = await db.update(products).set(productValues(input)).where(eq(products.id, id)).returning({ id: products.id });
    if (!row) throw new Error("Product not found.");
    await audit(user.id, "product.update", "product", row.id, { slug: input.slug });
    return row;
  }
  const [row] = await db.insert(products).values(productValues(input)).returning({ id: products.id });
  if (!row) throw new Error("Could not save.");
  await audit(user.id, "product.create", "product", row.id, { slug: input.slug });
  return row;
}

export async function deleteProduct(token: string | undefined, id: string) {
  const user = await actor(token);
  try {
    const [row] = await getDb().delete(products).where(eq(products.id, id)).returning({ id: products.id });
    if (!row) throw new Error("Product not found.");
    await audit(user.id, "product.delete", "product", id, {});
  } catch (error) {
    if (error instanceof Error && error.message === "Product not found.") throw error;
    throw new Error("Could not delete this product. Deactivate it instead if it has orders.");
  }
}

export async function uploadProductImage(token: string | undefined, input: { productId: string; mime: "image/jpeg" | "image/png" | "image/webp"; dataBase64: string; alt: string }) {
  await actor(token);
  const bytes = Buffer.from(input.dataBase64, "base64");
  if (bytes.length === 0 || bytes.length > 5_000_000) throw new Error("Use a JPG, PNG, or WebP under 5 MB.");
  const ext = input.mime === "image/png" ? "png" : input.mime === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "products");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), bytes);
  const imageUrl = `/uploads/products/${filename}`;
  await getDb().insert(productImages).values({ productId: input.productId, imageUrl, altText: input.alt, isPrimary: true, sortOrder: 0 });
  return { imageUrl };
}

export async function listCategories(token: string | undefined) {
  await actor(token);
  return getDb().select({ id: categories.id, name: categories.name, slug: categories.slug, is_active: categories.isActive }).from(categories).orderBy(asc(categories.sortOrder));
}

export async function createCategory(token: string | undefined, input: { name: string; slug: string; description: string }) {
  const user = await actor(token);
  const [row] = await getDb().insert(categories).values(input).returning({ id: categories.id });
  if (!row) throw new Error("Could not save.");
  await audit(user.id, "category.create", "category", row.id, { slug: input.slug });
  return row;
}

export async function categoryOptions(token: string | undefined) {
  await actor(token);
  return getDb().select({ id: categories.id, name: categories.name }).from(categories).orderBy(asc(categories.name));
}

export async function listCollections(token: string | undefined) {
  await actor(token);
  const db = getDb();
  const [rows, productRows] = await Promise.all([
    db.select({ id: collections.id, name: collections.name, slug: collections.slug }).from(collections).orderBy(asc(collections.name)),
    db.select({ id: products.id, name: products.name }).from(products).orderBy(asc(products.name)),
  ]);
  return { collections: rows, products: productRows };
}

export async function createCollection(token: string | undefined, input: { name: string; slug: string; description: string; productId: string }) {
  const user = await actor(token);
  const db = getDb();
  const [row] = await db.insert(collections).values({ name: input.name, slug: input.slug, description: input.description }).returning({ id: collections.id });
  if (!row) throw new Error("Could not save.");
  if (input.productId) await db.insert(collectionProducts).values({ collectionId: row.id, productId: input.productId, sortOrder: 0 });
  await audit(user.id, "collection.create", "collection", row.id, { slug: input.slug });
  return row;
}

export async function listOrders(token: string | undefined) {
  await actor(token);
  return getDb().select({
    id: orders.id,
    order_number: orders.orderNumber,
    customer_email: orders.customerEmail,
    total: orders.total,
    status: orders.status,
    payment_status: orders.paymentStatus,
    fulfillment_status: orders.fulfillmentStatus,
    created_at: orders.createdAt,
  }).from(orders).orderBy(desc(orders.createdAt));
}

export async function getOrder(token: string | undefined, id: string) {
  await actor(token);
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw new Error("Order not found.");
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return {
    order: {
      order_number: order.orderNumber,
      customer_email: order.customerEmail,
      payment_status: order.paymentStatus,
      status: order.status,
      fulfillment_status: order.fulfillmentStatus,
      subtotal: order.subtotal,
      discount_total: order.discountTotal,
      shipping_total: order.shippingTotal,
      total: order.total,
    },
    items: items.map((item) => ({ id: item.id, product_name: item.productName, variant_name: item.variantName, quantity: item.quantity, unit_price: item.unitPrice })),
  };
}

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
const fulfillmentStatuses = ["unfulfilled", "partial", "fulfilled", "cancelled"];

export async function updateFulfillment(token: string | undefined, id: string, status: string, fulfillment: string) {
  const user = await actor(token);
  if (!orderStatuses.includes(status) || !fulfillmentStatuses.includes(fulfillment)) throw new Error("Invalid order status");
  await getDb().update(orders).set({ status, fulfillmentStatus: fulfillment, updatedAt: new Date() }).where(eq(orders.id, id));
  await audit(user.id, "order.status", "order", id, { status, fulfillment });
}

export async function recordPayment(token: string | undefined, id: string) {
  const user = await actor(token);
  const db = getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw new Error("Order not found.");
  if (order.paymentStatus === "paid") return { payment_status: "paid" as const, status: order.status };
  if (order.paymentStatus !== "pending") throw new Error("This payment can no longer be recorded.");
  const status = order.status === "pending" ? "confirmed" : order.status;
  await db.update(orders).set({ paymentStatus: "paid", status, updatedAt: new Date() }).where(eq(orders.id, id));
  await db.update(payments).set({ status: "paid", provider: "manual", paidAt: new Date(), updatedAt: new Date() }).where(eq(payments.orderId, id));
  await audit(user.id, "order.payment", "order", id, { payment_status: "paid" });
  return { payment_status: "paid" as const, status };
}

export async function listInventory(token: string | undefined) {
  await actor(token);
  const rows = await getDb().query.products.findMany({
    columns: { id: true, name: true, sku: true, inventoryQuantity: true },
    with: { variants: { columns: { id: true, name: true, sku: true, inventoryQuantity: true, productId: true } } },
    orderBy: asc(products.name),
  });
  return rows.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    inventory_quantity: product.inventoryQuantity,
    product_variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      sku: variant.sku,
      inventory_quantity: variant.inventoryQuantity,
      product_id: variant.productId,
    })),
  }));
}

export async function adjustInventory(token: string | undefined, productId: string, variantId: string | null, quantity: number) {
  const user = await actor(token);
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Inventory cannot be negative");
  const db = getDb();
  if (variantId) {
    await db.update(productVariants).set({ inventoryQuantity: quantity, updatedAt: new Date() }).where(and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)));
  } else {
    await db.update(products).set({ inventoryQuantity: quantity, updatedAt: new Date() }).where(eq(products.id, productId));
  }
  await audit(user.id, "inventory.adjust", "product", productId, { variant_id: variantId, quantity, reason: "Admin inventory screen" });
}

export async function listCustomers(token: string | undefined) {
  await actor(token);
  const db = getDb();
  const people = await db.select({ id: users.id, full_name: users.fullName, email: users.email, phone: users.phone }).from(users).orderBy(desc(users.createdAt));
  const sales = await db.select({ user_id: orders.userId, total: orders.total, payment_status: orders.paymentStatus }).from(orders);
  return { customers: people, orders: sales };
}

export async function listReviews(token: string | undefined) {
  await actor(token);
  return getDb().select({ id: reviews.id, rating: reviews.rating, title: reviews.title, comment: reviews.comment, status: reviews.status }).from(reviews).orderBy(desc(reviews.createdAt));
}

export async function setReviewStatus(token: string | undefined, id: string, status: "approved" | "rejected") {
  const user = await actor(token);
  await getDb().update(reviews).set({ status, updatedAt: new Date() }).where(eq(reviews.id, id));
  await audit(user.id, "review.status", "review", id, { status });
}

export async function deleteReview(token: string | undefined, id: string) {
  const user = await actor(token);
  await getDb().delete(reviews).where(eq(reviews.id, id));
  await audit(user.id, "review.delete", "review", id, {});
}

export async function listCoupons(token: string | undefined) {
  await actor(token);
  return getDb().select({
    id: coupons.id,
    code: coupons.code,
    discount_type: coupons.discountType,
    discount_value: coupons.discountValue,
    minimum_order_amount: coupons.minimumOrderAmount,
    is_active: coupons.isActive,
    usage_count: coupons.usageCount,
    usage_limit: coupons.usageLimit,
  }).from(coupons).orderBy(asc(coupons.code));
}

export async function createCoupon(token: string | undefined, input: { code: string; description: string; discount_type: "percent" | "fixed"; discount_value: number; minimum_order_amount: number; usage_limit: number | null }) {
  const user = await actor(token);
  if (input.discount_value <= 0) throw new Error("Discount value must be greater than zero.");
  const [row] = await getDb().insert(coupons).values({
    code: input.code.trim().toUpperCase(),
    description: input.description,
    discountType: input.discount_type,
    discountValue: input.discount_value,
    minimumOrderAmount: input.minimum_order_amount,
    usageLimit: input.usage_limit,
  }).returning({ id: coupons.id });
  if (!row) throw new Error("Could not save.");
  await audit(user.id, "coupon.create", "coupon", row.id, { code: input.code });
  return row;
}

export async function toggleCoupon(token: string | undefined, id: string, isActive: boolean) {
  const user = await actor(token);
  await getDb().update(coupons).set({ isActive, updatedAt: new Date() }).where(eq(coupons.id, id));
  await audit(user.id, "coupon.toggle", "coupon", id, { isActive });
}

export async function getSettings(token: string | undefined) {
  await actor(token);
  const [row] = await getDb().select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
  if (!row) throw new Error("Settings unavailable.");
  return {
    store_name: row.storeName,
    support_email: row.supportEmail,
    support_phone: row.supportPhone,
    announcement_text: row.announcementText,
    free_over: String(row.shippingSettings.free_over ?? 75),
    standard: String(row.shippingSettings.standard ?? 8),
    express: String(row.shippingSettings.express ?? 12),
    tax_rate: String(row.taxSettings.rate ?? 0),
  };
}

export async function saveSettings(token: string | undefined, input: { store_name: string; support_email: string; support_phone: string; announcement_text: string; free_over: number; standard: number; express: number; tax_rate: number }) {
  const user = await actor(token);
  await getDb().update(storeSettings).set({
    storeName: input.store_name,
    supportEmail: input.support_email,
    supportPhone: input.support_phone,
    announcementText: input.announcement_text,
    shippingSettings: { free_over: input.free_over, standard: input.standard, express: input.express },
    taxSettings: { rate: input.tax_rate },
    updatedAt: new Date(),
  }).where(eq(storeSettings.id, 1));
  await audit(user.id, "settings.update", "settings", "1", {});
}

export async function listAudit(token: string | undefined) {
  await actor(token);
  const rows = await getDb().select({
    id: auditLogs.id,
    action: auditLogs.action,
    entity_type: auditLogs.entityType,
    entity_id: auditLogs.entityId,
    created_at: auditLogs.createdAt,
  }).from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
  return rows.map((row) => ({ ...row, created_at: row.created_at.toISOString() }));
}

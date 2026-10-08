import { and, eq, sql } from "drizzle-orm";
import { databaseConfigured, getDb } from "@/db/client";
import { couponRedemptions, coupons, orderItems, orders, payments, productImages, productVariants, products, storeSettings } from "@/db/schema";
import type { CheckoutPayload, PlacedOrder } from "@/lib/checkout";
import { readSession } from "./session";

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function pgCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if ("cause" in error) return pgCode(error.cause);
  return undefined;
}

type CouponRow = typeof coupons.$inferSelect;

function discountFor(coupon: CouponRow, subtotal: number) {
  let discount = coupon.discountType === "percent" ? round2((subtotal * coupon.discountValue) / 100) : coupon.discountValue;
  if (coupon.maximumDiscount != null) discount = Math.min(discount, coupon.maximumDiscount);
  return round2(Math.min(discount, subtotal));
}

async function activeCoupon(code: string) {
  const db = getDb();
  const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
  if (!coupon || !coupon.isActive) return null;
  const now = Date.now();
  if (coupon.startsAt && coupon.startsAt.getTime() > now) return null;
  if (coupon.expiresAt && coupon.expiresAt.getTime() <= now) return null;
  return coupon;
}

export async function previewCoupon(code: string, subtotal: number) {
  if (!databaseConfigured()) return { amount: 0, error: "Coupon validation needs the store database." };
  if (!Number.isFinite(subtotal) || subtotal < 0) return { amount: 0, error: "Invalid subtotal" };
  const coupon = await activeCoupon(code);
  if (!coupon) return { amount: 0, error: "That code is not recognized." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) return { amount: 0, error: "That code is no longer available." };
  if (subtotal < coupon.minimumOrderAmount) return { amount: 0, error: "Add more to use this code." };
  return { amount: discountFor(coupon, subtotal), error: "" };
}

function orderNumber() {
  const now = new Date();
  const stamp = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const suffix = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  return `63-${stamp}-${suffix}`;
}

function placedFrom(row: typeof orders.$inferSelect, duplicate: boolean): PlacedOrder {
  return {
    order_id: row.id,
    order_number: row.orderNumber,
    status: row.status,
    payment_status: row.paymentStatus,
    subtotal: row.subtotal,
    discount_total: row.discountTotal,
    shipping_total: row.shippingTotal,
    tax_total: row.taxTotal,
    total: row.total,
    duplicate,
    items: [],
  };
}

export async function placeOrder(payload: CheckoutPayload, token: string | undefined): Promise<PlacedOrder> {
  if (!databaseConfigured()) throw new Error("The store database is not connected. No order was created and no payment was taken.");
  const db = getDb();
  const session = await readSession(token).catch(() => null);
  try {
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(orders).where(eq(orders.idempotencyKey, payload.idempotency_key)).limit(1);
      if (existing) return placedFrom(existing, true);

      const [settings] = await tx.select().from(storeSettings).where(eq(storeSettings.id, 1)).limit(1);
      const shipping = settings?.shippingSettings ?? { free_over: 75, standard: 8, express: 12 };
      const taxRate = settings?.taxSettings.rate ?? 0;
      let subtotal = 0;
      const lines: {
        slug: string;
        productId: string;
        variantId: string | null;
        name: string;
        sku: string;
        image: string;
        variantName: string;
        unit: number;
        quantity: number;
      }[] = [];

      for (const item of payload.items) {
        const [product] = await tx.select().from(products).where(and(eq(products.slug, item.slug), eq(products.isActive, true))).for("update").limit(1);
        if (!product) throw new Error("A product in the cart is unavailable");
        const variants = await tx.select().from(productVariants).where(and(eq(productVariants.productId, product.id), eq(productVariants.isActive, true))).for("update");
        const sku = item.variant_sku?.trim() ?? "";
        let unit = product.price;
        let variantId: string | null = null;
        let variantName = "";
        let lineSku = product.sku ?? "";
        if (variants.length > 0 && !sku) throw new Error(`Choose an option for ${product.name}`);
        if (sku) {
          const variant = variants.find((entry) => entry.sku === sku);
          if (!variant) throw new Error("A selected option is unavailable");
          variantId = variant.id;
          variantName = variant.name;
          lineSku = variant.sku;
          if (variant.price != null) unit = variant.price;
          const updated = await tx
            .update(productVariants)
            .set({ inventoryQuantity: sql`${productVariants.inventoryQuantity} - ${item.quantity}`, updatedAt: new Date() })
            .where(and(eq(productVariants.id, variant.id), sql`${productVariants.inventoryQuantity} >= ${item.quantity}`))
            .returning({ id: productVariants.id });
          if (updated.length !== 1) throw new Error(`Not enough stock for ${product.name}`);
        } else if (product.trackInventory) {
          const updated = await tx
            .update(products)
            .set({ inventoryQuantity: sql`${products.inventoryQuantity} - ${item.quantity}`, updatedAt: new Date() })
            .where(and(eq(products.id, product.id), sql`${products.inventoryQuantity} >= ${item.quantity}`))
            .returning({ id: products.id });
          if (updated.length !== 1) throw new Error(`Not enough stock for ${product.name}`);
        }
        const [image] = await tx
          .select({ imageUrl: productImages.imageUrl })
          .from(productImages)
          .where(eq(productImages.productId, product.id))
          .orderBy(sql`${productImages.isPrimary} desc, ${productImages.sortOrder} asc`)
          .limit(1);
        subtotal = round2(subtotal + unit * item.quantity);
        lines.push({
          slug: product.slug,
          productId: product.id,
          variantId,
          name: product.name,
          sku: lineSku,
          image: image?.imageUrl ?? "",
          variantName,
          unit,
          quantity: item.quantity,
        });
      }

      let discount = 0;
      let coupon: CouponRow | null = null;
      const code = payload.coupon_code?.trim() ?? "";
      if (code) {
        const [locked] = await tx.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).for("update").limit(1);
        const now = Date.now();
        if (!locked || !locked.isActive || (locked.startsAt && locked.startsAt.getTime() > now) || (locked.expiresAt && locked.expiresAt.getTime() <= now)) {
          throw new Error("That code is not recognized");
        }
        if (locked.usageLimit != null && locked.usageCount >= locked.usageLimit) throw new Error("That code is no longer available");
        if (subtotal < locked.minimumOrderAmount) throw new Error("Order does not meet the minimum for this code");
        if (session) {
          const [used] = await tx
            .select({ id: couponRedemptions.id })
            .from(couponRedemptions)
            .where(and(eq(couponRedemptions.couponId, locked.id), eq(couponRedemptions.userId, session.id)))
            .limit(1);
          if (used) throw new Error("This code has already been used");
        }
        coupon = locked;
        discount = discountFor(locked, subtotal);
      }

      const method = payload.shipping_method === "express" ? "express" : "standard";
      const shippingTotal = method === "express" ? Number(shipping.express ?? 12) : subtotal >= Number(shipping.free_over ?? 75) ? 0 : Number(shipping.standard ?? 8);
      const tax = round2(Math.max(subtotal - discount, 0) * Number(taxRate ?? 0));
      const total = round2(Math.max(subtotal - discount, 0) + shippingTotal + tax);
      const [order] = await tx
        .insert(orders)
        .values({
          orderNumber: orderNumber(),
          idempotencyKey: payload.idempotency_key,
          userId: session?.id ?? null,
          customerEmail: payload.customer_email.toLowerCase(),
          customerName: payload.customer_name,
          customerPhone: payload.customer_phone ?? "",
          shippingAddress: payload.shipping_address,
          shippingMethod: method,
          status: "pending",
          paymentStatus: "pending",
          fulfillmentStatus: "unfulfilled",
          subtotal,
          discountTotal: discount,
          shippingTotal,
          taxTotal: tax,
          total,
          customerNote: payload.customer_note ?? "",
        })
        .returning();
      if (!order) throw new Error("The order could not be saved.");
      await tx.insert(orderItems).values(lines.map((line) => ({
        orderId: order.id,
        productId: line.productId,
        variantId: line.variantId,
        productName: line.name,
        productSku: line.sku,
        productImageUrl: line.image,
        variantName: line.variantName,
        unitPrice: line.unit,
        quantity: line.quantity,
        lineTotal: round2(line.unit * line.quantity),
      })));
      await tx.insert(payments).values({ orderId: order.id, provider: "unconfigured", amount: total, currency: "USD", status: "pending" });
      if (coupon) {
        await tx.insert(couponRedemptions).values({ couponId: coupon.id, orderId: order.id, userId: session?.id ?? null });
        await tx.update(coupons).set({ usageCount: sql`${coupons.usageCount} + 1`, updatedAt: new Date() }).where(eq(coupons.id, coupon.id));
      }
      return {
        ...placedFrom(order, false),
        items: lines.map((line) => ({ slug: line.slug, name: line.name, variant: line.variantName, qty: line.quantity, price: line.unit, image: line.image })),
      };
    });
  } catch (error) {
    if (pgCode(error) === "23505") {
      const [existing] = await db.select().from(orders).where(eq(orders.idempotencyKey, payload.idempotency_key)).limit(1);
      if (existing) return placedFrom(existing, true);
    }
    if (error instanceof Error && !pgCode(error)) throw error;
    console.error(error);
    throw new Error("The store database could not complete that request.");
  }
}

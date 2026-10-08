import { z } from "zod";
import type { Order, OrderItem } from "./types";

const checkoutItemSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  variant_sku: z.string().trim().max(80).optional(),
  quantity: z.number().int().min(1).max(20),
}).strict();

export const checkoutPayloadSchema = z.object({
  idempotency_key: z.string().trim().min(8).max(80),
  customer_email: z.string().trim().email().max(160),
  customer_name: z.string().trim().min(1).max(160),
  customer_phone: z.string().trim().max(40).optional(),
  shipping_method: z.enum(["standard", "express"]),
  coupon_code: z.string().trim().max(40).optional(),
  customer_note: z.string().trim().max(500).optional(),
  shipping_address: z.object({
    recipient_name: z.string().trim().min(1).max(160),
    address_line_1: z.string().trim().min(1).max(200),
    address_line_2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(80),
    state_or_region: z.string().trim().min(1).max(80),
    postal_code: z.string().trim().min(1).max(20),
    country: z.string().trim().min(2).max(2),
  }).strict(),
  items: z.array(checkoutItemSchema).min(1).max(30),
}).strict();

export type CheckoutPayload = z.infer<typeof checkoutPayloadSchema>;

export type PlacedOrder = {
  order_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  duplicate: boolean;
  items: { slug: string; name: string; variant: string; qty: number; price: number; image: string }[];
};

/**
 * Payment is intentionally unfinished.
 * Creating an order records a pending payment. Nothing in the browser can mark it paid.
 */
export const paymentService = {
  provider: "unconfigured" as const,
  createPayment() {
    return { provider: "unconfigured" as const, status: "pending" as const };
  },
  verifyBrowserRedirect(): never {
    throw new Error("A browser redirect is not proof of payment.");
  },
};

export async function placeSecureOrder(input: CheckoutPayload): Promise<PlacedOrder> {
  const payload = checkoutPayloadSchema.parse(input);
  const { placeOrderFn } = await import("@/server/fns");
  const row = await placeOrderFn({ data: payload });
  if (!row?.order_id || row.payment_status === "paid") {
    throw new Error("Checkout did not return an unpaid order.");
  }
  return row;
}

export function orderFromPlacement(placed: PlacedOrder, items: OrderItem[], email: string, address: string, delivery: string): Order {
  return {
    id: placed.order_number,
    createdAt: new Date().toISOString(),
    status: "Pending",
    email,
    shippingAddress: address,
    delivery,
    payment: "Payment pending",
    items,
    subtotal: Number(placed.subtotal),
    shipping: Number(placed.shipping_total),
    discount: Number(placed.discount_total),
    total: Number(placed.total),
    paymentStatus: "pending",
  };
}

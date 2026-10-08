import { describe, expect, it } from "vitest";
import { checkoutPayloadSchema, paymentService } from "./checkout";

const address = {
  recipient_name: "Ada Lovelace",
  address_line_1: "10 E. Wilson Street",
  city: "Batavia",
  state_or_region: "IL",
  postal_code: "60510",
  country: "US",
};

describe("checkout payload", () => {
  it("drops nothing and rejects a client-supplied price", () => {
    const parsed = checkoutPayloadSchema.safeParse({
      idempotency_key: "order-key-1",
      customer_email: "ada@example.com",
      customer_name: "Ada Lovelace",
      shipping_method: "standard",
      shipping_address: address,
      items: [{ slug: "lavender-oat-soap", variant_sku: "bar", quantity: 1, price: 1 }],
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a cart that only names products and quantities", () => {
    const parsed = checkoutPayloadSchema.parse({
      idempotency_key: "order-key-1",
      customer_email: "ada@example.com",
      customer_name: "Ada Lovelace",
      shipping_method: "express",
      shipping_address: address,
      items: [{ slug: "lavender-oat-soap", variant_sku: "bar", quantity: 2 }],
    });
    expect(parsed.items[0]?.quantity).toBe(2);
    expect(parsed).not.toHaveProperty("total");
  });
});

describe("payment service", () => {
  it("creates a pending payment and refuses a browser redirect", () => {
    expect(paymentService.createPayment()).toEqual({ provider: "unconfigured", status: "pending" });
    expect(() => paymentService.verifyBrowserRedirect()).toThrow(/not proof of payment/);
  });
});

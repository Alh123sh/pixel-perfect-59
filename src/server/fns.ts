import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkoutPayloadSchema } from "@/lib/checkout";

const COOKIE = "63rd_session";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function readToken() {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(COOKIE);
}

async function writeToken(token: string) {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, token, cookieOptions(60 * 60 * 24 * 30));
}

async function clearToken() {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(COOKIE, { path: "/" });
}

async function origin() {
  const { getRequestUrl } = await import("@tanstack/react-start/server");
  return getRequestUrl().origin;
}

function fail(error: unknown): never {
  if (error instanceof Error && !("code" in error)) throw new Error(error.message);
  console.error(error);
  throw new Error("The store database could not complete that request.");
}

const credentials = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(200),
});

const productInput = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
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

export const fetchCatalogFn = createServerFn({ method: "GET" }).handler(async () => {
  const { loadCatalog } = await import("./catalog");
  return loadCatalog();
});

export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  if (!process.env["DATABASE_URL"]) return { configured: false as const, user: null, isAdmin: false };
  try {
    const { currentSession } = await import("./auth");
    const user = await currentSession(await readToken());
    return { configured: true as const, user, isAdmin: Boolean(user?.isAdmin) };
  } catch (error) {
    console.error(error);
    return { configured: true as const, user: null, isAdmin: false };
  }
});

export const signInFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => credentials.parse(input))
  .handler(async ({ data }) => {
    try {
      const { signIn } = await import("./auth");
      const { session, token } = await signIn(data.email, data.password);
      await writeToken(token);
      return session;
    } catch (error) {
      fail(error);
    }
  });

export const signUpFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => credentials.extend({ fullName: z.string().trim().min(1).max(160) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { signUp } = await import("./auth");
      return await signUp(data, await origin());
    } catch (error) {
      fail(error);
    }
  });

export const signOutFn = createServerFn({ method: "POST" }).handler(async () => {
  const { signOut } = await import("./auth");
  await signOut(await readToken());
  await clearToken();
});

export const sendPasswordResetFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ email: z.string().trim().email().max(160) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { sendPasswordReset } = await import("./auth");
      return await sendPasswordReset(data.email, await origin());
    } catch (error) {
      fail(error);
    }
  });

export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ token: z.string().min(20).max(200), password: z.string().min(8).max(200) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { resetPassword } = await import("./auth");
      await resetPassword(data.token, data.password);
    } catch (error) {
      fail(error);
    }
  });

export const verifyEmailFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ token: z.string().min(20).max(200) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { verifyEmail } = await import("./auth");
      await verifyEmail(data.token);
    } catch (error) {
      fail(error);
    }
  });

export const placeOrderFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => checkoutPayloadSchema.parse(input))
  .handler(async ({ data }) => {
    const { placeOrder } = await import("./place-order");
    return placeOrder(data, await readToken());
  });

export const previewCouponFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ code: z.string().max(40), subtotal: z.number().min(0) }).parse(input))
  .handler(async ({ data }) => {
    const { previewCoupon } = await import("./place-order");
    return previewCoupon(data.code, data.subtotal);
  });

export const subscribeNewsletterFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ email: z.string().trim().email().max(160) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { subscribeNewsletter } = await import("./shopper");
      await subscribeNewsletter(data.email);
    } catch (error) {
      fail(error);
    }
  });

export const submitReviewFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    productId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().min(1).max(160),
    comment: z.string().trim().min(1).max(2000),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { submitReview } = await import("./shopper");
      await submitReview(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const getReviewsFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1).max(160) }).parse(input))
  .handler(async ({ data }) => {
    const { productReviews } = await import("./shopper");
    return productReviews(data.slug);
  });

export const syncWishlistFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ slugs: z.array(z.string().min(1).max(160)).max(100) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { syncWishlist } = await import("./shopper");
      return await syncWishlist(await readToken(), data.slugs);
    } catch (error) {
      fail(error);
    }
  });

export const toggleWishlistFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ slug: z.string().min(1).max(160) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { toggleWishlist } = await import("./shopper");
      return await toggleWishlist(await readToken(), data.slug);
    } catch (error) {
      fail(error);
    }
  });

export const listMyOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listMyOrders } = await import("./shopper");
    return await listMyOrders(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const mergeCartFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    items: z.array(z.object({
      slug: z.string().min(1).max(160),
      quantity: z.number().int().min(1).max(20),
      variant_sku: z.string().max(80).optional(),
    })).max(30),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { mergeGuestCart } = await import("./shopper");
      return await mergeGuestCart(await readToken(), data.items);
    } catch (error) {
      fail(error);
    }
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    fullName: z.string().trim().max(160),
    email: z.string().trim().email().max(160),
    phone: z.string().trim().max(40),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { updateProfile } = await import("./shopper");
      await updateProfile(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const saveAddressFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    label: z.string().trim().min(1).max(80),
    line1: z.string().trim().min(1).max(200),
    city: z.string().trim().min(1).max(80),
    state: z.string().trim().min(1).max(80),
    zip: z.string().trim().min(1).max(20),
    isDefault: z.boolean(),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { saveAddress } = await import("./shopper");
      await saveAddress(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const adminDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { dashboard } = await import("./admin");
    return await dashboard(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listProducts } = await import("./admin");
    return await listProducts(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminProductFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { getProduct } = await import("./admin");
      return await getProduct(await readToken(), data.id);
    } catch (error) {
      fail(error);
    }
  });

export const adminSaveProductFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().uuid().nullable(), product: productInput }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { saveProduct } = await import("./admin");
      return await saveProduct(await readToken(), data.id, data.product);
    } catch (error) {
      fail(error);
    }
  });

export const adminDeleteProductFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { deleteProduct } = await import("./admin");
      await deleteProduct(await readToken(), data.id);
    } catch (error) {
      fail(error);
    }
  });

export const adminUploadImageFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    productId: z.string().uuid(),
    mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
    dataBase64: z.string().min(1).max(7_000_000),
    alt: z.string().max(160),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { uploadProductImage } = await import("./admin");
      return await uploadProductImage(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const adminCategoriesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listCategories } = await import("./admin");
    return await listCategories(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminCategoryOptionsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { categoryOptions } = await import("./admin");
    return await categoryOptions(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminCreateCategoryFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ name: z.string().trim().min(1).max(80), slug: z.string().trim().min(1).max(80), description: z.string().max(300) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { createCategory } = await import("./admin");
      await createCategory(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const adminCollectionsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listCollections } = await import("./admin");
    return await listCollections(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminCreateCollectionFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    name: z.string().trim().min(1).max(80),
    slug: z.string().trim().min(1).max(80),
    description: z.string().max(300),
    productId: z.string(),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { createCollection } = await import("./admin");
      await createCollection(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const adminOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listOrders } = await import("./admin");
    const rows = await listOrders(await readToken());
    return rows.map((row) => ({ ...row, created_at: row.created_at.toISOString() }));
  } catch (error) {
    fail(error);
  }
});

export const adminOrderFn = createServerFn({ method: "GET" })
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { getOrder } = await import("./admin");
      return await getOrder(await readToken(), data.id);
    } catch (error) {
      fail(error);
    }
  });

export const adminRecordPaymentFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { recordPayment } = await import("./admin");
      return await recordPayment(await readToken(), data.id);
    } catch (error) {
      fail(error);
    }
  });

export const adminFulfillmentFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().uuid(), status: z.string(), fulfillment: z.string() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { updateFulfillment } = await import("./admin");
      await updateFulfillment(await readToken(), data.id, data.status, data.fulfillment);
    } catch (error) {
      fail(error);
    }
  });

export const adminInventoryFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listInventory } = await import("./admin");
    return await listInventory(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminAdjustInventoryFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ productId: z.string().uuid(), variantId: z.string().uuid().nullable(), quantity: z.number().int().min(0) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { adjustInventory } = await import("./admin");
      await adjustInventory(await readToken(), data.productId, data.variantId, data.quantity);
    } catch (error) {
      fail(error);
    }
  });

export const adminCustomersFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listCustomers } = await import("./admin");
    return await listCustomers(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminReviewsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listReviews } = await import("./admin");
    return await listReviews(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminReviewStatusFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().uuid(), status: z.enum(["approved", "rejected"]) }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { setReviewStatus } = await import("./admin");
      await setReviewStatus(await readToken(), data.id, data.status);
    } catch (error) {
      fail(error);
    }
  });

export const adminDeleteReviewFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { deleteReview } = await import("./admin");
      await deleteReview(await readToken(), data.id);
    } catch (error) {
      fail(error);
    }
  });

export const adminCouponsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listCoupons } = await import("./admin");
    return await listCoupons(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminCreateCouponFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    code: z.string().trim().min(2).max(40),
    description: z.string().max(200),
    discount_type: z.enum(["percent", "fixed"]),
    discount_value: z.number().positive(),
    minimum_order_amount: z.number().min(0),
    usage_limit: z.number().int().positive().nullable(),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { createCoupon } = await import("./admin");
      await createCoupon(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const adminToggleCouponFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().uuid(), isActive: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { toggleCoupon } = await import("./admin");
      await toggleCoupon(await readToken(), data.id, data.isActive);
    } catch (error) {
      fail(error);
    }
  });

export const adminSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { getSettings } = await import("./admin");
    return await getSettings(await readToken());
  } catch (error) {
    fail(error);
  }
});

export const adminSaveSettingsFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({
    store_name: z.string().min(1).max(120),
    support_email: z.string().email().max(160),
    support_phone: z.string().max(40),
    announcement_text: z.string().max(200),
    free_over: z.number().min(0),
    standard: z.number().min(0),
    express: z.number().min(0),
    tax_rate: z.number().min(0).max(1),
  }).parse(input))
  .handler(async ({ data }) => {
    try {
      const { saveSettings } = await import("./admin");
      await saveSettings(await readToken(), data);
    } catch (error) {
      fail(error);
    }
  });

export const adminAuditFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { listAudit } = await import("./admin");
    return await listAudit(await readToken());
  } catch (error) {
    fail(error);
  }
});

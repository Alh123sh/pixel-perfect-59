import { relations, sql } from "drizzle-orm";
import { boolean, check, integer, jsonb, numeric, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

const money = (name: string) => numeric(name, { precision: 12, scale: 2, mode: "number" });
const ts = (name: string) => timestamp(name, { withTimezone: true }).notNull().defaultNow();

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  fullName: text("full_name").notNull().default(""),
  phone: text("phone").notNull().default(""),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: ts("created_at"),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  purpose: text("purpose").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: ts("created_at"),
});

export const userRoles = pgTable("user_roles", {
  userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  createdAt: ts("created_at"),
}, (table) => [check("user_roles_role", sql`${table.role} in ('customer', 'admin')`)]);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  brand: text("brand").notNull().default("63rd Street Apothecary"),
  price: money("price").notNull(),
  compareAtPrice: money("compare_at_price"),
  sku: text("sku"),
  inventoryQuantity: integer("inventory_quantity").notNull().default(0),
  trackInventory: boolean("track_inventory").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  isBestSeller: boolean("is_best_seller").notNull().default(false),
  isNewArrival: boolean("is_new_arrival").notNull().default(false),
  isOnSale: boolean("is_on_sale").notNull().default(false),
  ingredients: text("ingredients").notNull().default(""),
  howToUse: text("how_to_use").notNull().default(""),
  details: text("details").notNull().default(""),
  productType: text("product_type").notNull().default(""),
  scent: text("scent").notNull().default(""),
  sizeLabel: text("size_label").notNull().default(""),
  rituals: text("rituals").array().notNull().default(sql`ARRAY[]::text[]`),
  badge: text("badge"),
  soldCount: integer("sold_count").notNull().default(0),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [
  check("products_price_nonneg", sql`${table.price} >= 0`),
  check("products_inventory_nonneg", sql`${table.inventoryQuantity} >= 0`),
  check("products_badge", sql`${table.badge} is null or ${table.badge} in ('Best Seller', 'New', 'Limited', 'Sale')`),
]);

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  altText: text("alt_text").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: ts("created_at"),
});

export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  price: money("price"),
  compareAtPrice: money("compare_at_price"),
  inventoryQuantity: integer("inventory_quantity").notNull().default(0),
  options: jsonb("options").$type<Record<string, string>>().notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [uniqueIndex("product_variants_sku").on(table.productId, table.sku)]);

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: ts("created_at"),
});

export const collectionProducts = pgTable("collection_products", {
  collectionId: uuid("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
}, (table) => [primaryKey({ columns: [table.collectionId, table.productId] })]);

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipientName: text("recipient_name").notNull(),
  phone: text("phone").notNull().default(""),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2").notNull().default(""),
  city: text("city").notNull(),
  stateOrRegion: text("state_or_region").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("US"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [uniqueIndex("addresses_one_default").on(table.userId).where(sql`${table.isDefault} = true`)]);

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [uniqueIndex("carts_user_unique").on(table.userId)]);

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: ts("created_at"),
}, (table) => [uniqueIndex("wishlist_user_product").on(table.userId, table.productId)]);

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull().default(""),
  customerPhone: text("customer_phone").notNull().default(""),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address"),
  shippingMethod: text("shipping_method").notNull().default("standard"),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  fulfillmentStatus: text("fulfillment_status").notNull().default("unfulfilled"),
  subtotal: money("subtotal").notNull(),
  discountTotal: money("discount_total").notNull().default(0),
  shippingTotal: money("shipping_total").notNull().default(0),
  taxTotal: money("tax_total").notNull().default(0),
  total: money("total").notNull(),
  currency: text("currency").notNull().default("USD"),
  customerNote: text("customer_note").notNull().default(""),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [
  check("orders_status", sql`${table.status} in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')`),
  check("orders_payment_status", sql`${table.paymentStatus} in ('pending', 'paid', 'failed', 'partially_refunded', 'refunded')`),
  check("orders_fulfillment", sql`${table.fulfillmentStatus} in ('unfulfilled', 'partial', 'fulfilled', 'cancelled')`),
]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  productSku: text("product_sku").notNull().default(""),
  productImageUrl: text("product_image_url").notNull().default(""),
  variantName: text("variant_name").notNull().default(""),
  unitPrice: money("unit_price").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: money("line_total").notNull(),
  createdAt: ts("created_at"),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerReference: text("provider_reference"),
  amount: money("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [check("payments_status", sql`${table.status} in ('pending', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded')`)]);

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  description: text("description").notNull().default(""),
  discountType: text("discount_type").notNull(),
  discountValue: money("discount_value").notNull(),
  minimumOrderAmount: money("minimum_order_amount").notNull().default(0),
  maximumDiscount: money("maximum_discount"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [check("coupons_type", sql`${table.discountType} in ('percent', 'fixed')`)]);

export const couponRedemptions = pgTable("coupon_redemptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  couponId: uuid("coupon_id").notNull().references(() => coupons.id, { onDelete: "cascade" }),
  orderId: uuid("order_id").notNull().unique().references(() => orders.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  redeemedAt: ts("redeemed_at"),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  title: text("title").notNull().default(""),
  comment: text("comment").notNull().default(""),
  status: text("status").notNull().default("pending"),
  createdAt: ts("created_at"),
  updatedAt: ts("updated_at"),
}, (table) => [
  check("reviews_rating", sql`${table.rating} between 1 and 5`),
  check("reviews_status", sql`${table.status} in ('pending', 'approved', 'rejected')`),
]);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  status: text("status").notNull().default("subscribed"),
  subscribedAt: ts("subscribed_at"),
});

export const storeSettings = pgTable("store_settings", {
  id: integer("id").primaryKey(),
  storeName: text("store_name").notNull().default("63rd Street Apothecary"),
  supportEmail: text("support_email").notNull().default("hello@63rdstreetapothecary.com"),
  supportPhone: text("support_phone").notNull().default(""),
  defaultCurrency: text("default_currency").notNull().default("USD"),
  shippingSettings: jsonb("shipping_settings").$type<{ free_over: number; standard: number; express: number }>().notNull().default({ free_over: 75, standard: 8, express: 12 }),
  taxSettings: jsonb("tax_settings").$type<{ rate: number }>().notNull().default({ rate: 0 }),
  announcementText: text("announcement_text").notNull().default("Handcrafted with care"),
  updatedAt: ts("updated_at"),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: ts("created_at"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, { fields: [users.id], references: [userRoles.userId] }),
  addresses: many(addresses),
  reviews: many(reviews),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  variants: many(productVariants),
  collectionLinks: many(collectionProducts),
  reviews: many(reviews),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  links: many(collectionProducts),
}));

export const collectionProductsRelations = relations(collectionProducts, ({ one }) => ({
  collection: one(collections, { fields: [collectionProducts.collectionId], references: [collections.id] }),
  product: one(products, { fields: [collectionProducts.productId], references: [products.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, { fields: [payments.orderId], references: [orders.id] }),
}));

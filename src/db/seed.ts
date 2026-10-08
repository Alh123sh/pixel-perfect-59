import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { categories, collectionProducts, collections, coupons, productVariants, products, reviews, storeSettings, userRoles, users } from "./schema";
import { hashPassword } from "../server/passwords";

const categoryRows = [
  ["Bath & Body", "bath-body", "Soaks, oils, and scrubs for slow evenings.", 1],
  ["Skincare", "skincare", "Whipped butters, balms, and botanical oils.", 2],
  ["Soaps", "soaps", "Cold-process bars, cut and cured by hand.", 3],
  ["Candles", "candles", "Hand-poured soy with wooden wicks.", 4],
  ["Home & Wellness", "home-wellness", "Room mists and quiet scents for the house.", 5],
  ["Gifts", "gifts", "Thoughtful sets, wrapped and ready to give.", 6],
] as const;

const collectionRows = [
  ["Customer Favorites", "best-sellers", "The products our community keeps coming back for."],
  ["New & Noteworthy", "new-arrivals", "The latest small batches, just poured and cured."],
  ["The Ritual Edit", "ritual-edit", "A considered edit of bath, body, and home."],
  ["The Gifting Edit", "gifting", "Sets and favorites, ready to wrap."],
] as const;

const details = "Made in small batches and packed in recyclable materials. Because each batch is handmade, color and texture may vary slightly.";

const productRows = [
  { name: "Lavender Oat Bar Soap", slug: "lavender-oat-soap", short: "A gentle cold-process bar.", description: "A gentle cold-process bar made with colloidal oatmeal and French lavender, cured for six weeks.", category: "soaps", price: 9, compare: null, sku: "SOAP-LAV", stock: 40, featured: true, best: true, fresh: false, sale: false, ingredients: "Olive oil, coconut oil, shea butter, colloidal oatmeal, lavender essential oil, dried lavender buds.", how: "Lather between wet hands and massage onto skin. Rinse. Keep the bar dry between uses.", type: "Soap", scent: "Lavender", size: "4.5 oz", rituals: ["relax", "everyday"], badge: "Best Seller" },
  { name: "Sage & Cedar Soy Candle", slug: "sage-soy-candle", short: "Hand-poured soy with a wooden wick.", description: "Hand-poured soy wax with a crackling wooden wick. Green sage, cedarwood, and a hint of citrus.", category: "candles", price: 32, compare: null, sku: "CANDLE-SAGE", stock: 24, featured: true, best: true, fresh: false, sale: false, ingredients: "Soy wax, phthalate-free fragrance oil, essential oils, wooden wick.", how: "Trim the wick to 1/8 inch before each burn. Burn for 2–3 hours at a time.", type: "Candle", scent: "Sage & Cedar", size: "9 oz", rituals: ["unwind", "relax"], badge: "Best Seller" },
  { name: "Shea Vanilla Body Butter", slug: "shea-vanilla-body-butter", short: "Whipped shea and cocoa butter.", description: "Whipped until cloud-soft. Rich shea and cocoa butter melt into skin for a velvety finish.", category: "skincare", price: 24, compare: null, sku: "BUTTER-VAN", stock: 30, featured: true, best: true, fresh: false, sale: false, ingredients: "Shea butter, cocoa butter, sweet almond oil, vanilla absolute, vitamin E.", how: "Warm a small amount between palms and smooth over damp skin after bathing.", type: "Body butter", scent: "Shea Vanilla", size: "6.8 oz", rituals: ["pamper", "everyday"], badge: "Best Seller" },
  { name: "Rose Himalayan Bath Salts", slug: "rose-himalayan-bath-salts", short: "A softly scented soak.", description: "Pink Himalayan and Epsom salts blended with rose petals for a softly scented soak.", category: "bath-body", price: 18, compare: null, sku: "SALT-ROSE", stock: 20, featured: false, best: false, fresh: true, sale: false, ingredients: "Himalayan pink salt, Epsom salt, rose geranium oil, dried rose petals.", how: "Dissolve 2–3 scoops in warm running bath water. Soak for about 20 minutes.", type: "Bath soak", scent: "Rose Geranium", size: "12 oz", rituals: ["relax", "pamper"], badge: "New" },
  { name: "The Self-Care Gift Box", slug: "self-care-gift-set", short: "A wrapped set of four pieces.", description: "A bar soap, travel candle, lip balm, and eucalyptus bundle, wrapped in kraft and twine.", category: "gifts", price: 58, compare: 68, sku: "GIFT-SELF", stock: 12, featured: true, best: false, fresh: false, sale: true, ingredients: "See the included products for individual ingredient lists.", how: "Unwrap, light, lather, and enjoy — or give it as it is.", type: "Gift set", scent: "Assorted", size: "4 pieces", rituals: ["gift"], badge: "Limited" },
  { name: "Eucalyptus Bath & Body Oil", slug: "eucalyptus-body-oil", short: "A light oil for damp skin.", description: "A lightweight blend of jojoba and sweet almond with eucalyptus and spearmint.", category: "bath-body", price: 28, compare: null, sku: "OIL-EUC", stock: 18, featured: false, best: true, fresh: true, sale: false, ingredients: "Jojoba oil, sweet almond oil, eucalyptus oil, spearmint oil, vitamin E.", how: "Massage onto damp skin, or add a few drops to a warm bath.", type: "Body oil", scent: "Eucalyptus", size: "4 fl oz", rituals: ["refresh", "unwind"], badge: "Best Seller" },
  { name: "Calendula Honey Soap", slug: "calendula-honey-soap", short: "Currently sold out.", description: "Calendula petals and raw local honey in a creamy, softly sweet bar.", category: "soaps", price: 9, compare: null, sku: "SOAP-HON", stock: 0, featured: false, best: false, fresh: false, sale: false, ingredients: "Olive oil, coconut oil, raw honey, calendula, shea butter.", how: "Lather, massage, and rinse. Store on a draining dish.", type: "Soap", scent: "Honey", size: "4.5 oz", rituals: ["everyday", "pamper"], badge: null },
  { name: "Linen & Amber Candle", slug: "linen-amber-candle", short: "Clean cotton and warm amber.", description: "Clean cotton and warm amber — like sun-dried sheets on a quiet Sunday.", category: "candles", price: 32, compare: null, sku: "CANDLE-LIN", stock: 16, featured: false, best: false, fresh: true, sale: false, ingredients: "Soy wax, phthalate-free fragrance oil, wooden wick.", how: "Burn 2–3 hours at a time and trim the wick between burns.", type: "Candle", scent: "Linen & Amber", size: "9 oz", rituals: ["unwind", "refresh"], badge: "New" },
  { name: "Cedar Room Spray", slug: "cedar-room-spray", short: "A fine mist for rooms and linens.", description: "A fine mist of cedarwood and soft citrus for linens, rooms, and entryways.", category: "home-wellness", price: 22, compare: null, sku: "MIST-CED", stock: 14, featured: false, best: false, fresh: true, sale: false, ingredients: "Distilled water, witch hazel, cedarwood oil, sweet orange oil.", how: "Shake gently and mist into the air or over linens. Avoid unfinished wood.", type: "Room spray", scent: "Cedar", size: "4 fl oz", rituals: ["refresh", "everyday"], badge: "New" },
  { name: "Sunday Linen Mist", slug: "linen-mist", short: "A light scent for the bed.", description: "A light linen scent for pillows and freshly made beds.", category: "home-wellness", price: 22, compare: null, sku: "MIST-LIN", stock: 14, featured: false, best: false, fresh: false, sale: false, ingredients: "Distilled water, witch hazel, cotton blossom fragrance, essential oils.", how: "Mist above the bed and let it settle. Shake before each use.", type: "Room spray", scent: "Linen", size: "4 fl oz", rituals: ["unwind", "refresh"], badge: null },
];

const variantRows = [
  ["lavender-oat-soap", "Single bar · 4.5 oz", "bar", 9, 40],
  ["lavender-oat-soap", "Trio · 3 bars", "trio", 24, 12],
  ["sage-soy-candle", "Full size · 9 oz", "full", 32, 24],
  ["sage-soy-candle", "Travel · 3 oz", "travel", 18, 10],
  ["shea-vanilla-body-butter", "Jar · 6.8 oz", "jar", 24, 30],
  ["shea-vanilla-body-butter", "Travel tin · 2 oz", "travel", 14, 10],
  ["rose-himalayan-bath-salts", "Jar · 12 oz", "jar", 18, 20],
  ["rose-himalayan-bath-salts", "Refill pouch · 24 oz", "pouch", 32, 8],
  ["eucalyptus-body-oil", "Bottle · 4 fl oz", "bottle", 28, 18],
  ["eucalyptus-body-oil", "Mini · 1 fl oz", "mini", 16, 8],
  ["calendula-honey-soap", "Single bar · 4.5 oz", "bar", 9, 0],
  ["linen-amber-candle", "Full size · 9 oz", "full", 32, 16],
  ["linen-amber-candle", "Travel · 3 oz", "travel", 18, 6],
] as const;

const links = [
  ["best-sellers", "lavender-oat-soap", 1],
  ["best-sellers", "sage-soy-candle", 2],
  ["best-sellers", "shea-vanilla-body-butter", 3],
  ["best-sellers", "eucalyptus-body-oil", 4],
  ["ritual-edit", "lavender-oat-soap", 1],
  ["ritual-edit", "sage-soy-candle", 2],
  ["ritual-edit", "shea-vanilla-body-butter", 3],
  ["ritual-edit", "rose-himalayan-bath-salts", 4],
  ["ritual-edit", "eucalyptus-body-oil", 5],
  ["ritual-edit", "calendula-honey-soap", 6],
  ["ritual-edit", "cedar-room-spray", 7],
  ["ritual-edit", "linen-mist", 8],
  ["new-arrivals", "rose-himalayan-bath-salts", 1],
  ["new-arrivals", "eucalyptus-body-oil", 2],
  ["new-arrivals", "linen-amber-candle", 3],
  ["new-arrivals", "cedar-room-spray", 4],
  ["gifting", "self-care-gift-set", 1],
] as const;

const reviewRows = [
  ["lavender-oat-soap", 5, "The bar I keep reordering", "A soft lather and a quiet lavender scent. It lasts, and the oatmeal feels gentle."],
  ["shea-vanilla-body-butter", 5, "A little goes far", "Rich without feeling heavy. The vanilla is warm, not sugary."],
  ["sage-soy-candle", 5, "Clean burn", "The wooden wick crackles softly and the sage stays light through the room."],
] as const;

async function main() {
  const db = getDb();
  await db.insert(storeSettings).values({ id: 1 }).onConflictDoNothing();
  await db.insert(categories).values(categoryRows.map(([name, slug, description, sortOrder]) => ({ name, slug, description, sortOrder }))).onConflictDoNothing();
  await db.insert(collections).values(collectionRows.map(([name, slug, description]) => ({ name, slug, description }))).onConflictDoNothing();

  const categoryList = await db.select().from(categories);
  const categoryId = new Map(categoryList.map((row) => [row.slug, row.id]));
  for (const product of productRows) {
    const category = categoryId.get(product.category);
    if (!category) continue;
    await db.insert(products).values({
      name: product.name,
      slug: product.slug,
      shortDescription: product.short,
      description: product.description,
      categoryId: category,
      price: product.price,
      compareAtPrice: product.compare,
      sku: product.sku,
      inventoryQuantity: product.stock,
      isFeatured: product.featured,
      isBestSeller: product.best,
      isNewArrival: product.fresh,
      isOnSale: product.sale,
      ingredients: product.ingredients,
      howToUse: product.how,
      details,
      productType: product.type,
      scent: product.scent,
      sizeLabel: product.size,
      rituals: [...product.rituals],
      badge: product.badge,
    }).onConflictDoNothing();
  }

  const productList = await db.select().from(products);
  const productId = new Map(productList.map((row) => [row.slug, row.id]));
  for (const [slug, name, sku, price, stock] of variantRows) {
    const id = productId.get(slug);
    if (!id) continue;
    await db.insert(productVariants).values({ productId: id, name, sku, price, inventoryQuantity: stock, options: { size: name } }).onConflictDoNothing();
  }

  const collectionList = await db.select().from(collections);
  const collectionId = new Map(collectionList.map((row) => [row.slug, row.id]));
  for (const [collectionSlug, productSlug, sortOrder] of links) {
    const collection = collectionId.get(collectionSlug);
    const product = productId.get(productSlug);
    if (!collection || !product) continue;
    await db.insert(collectionProducts).values({ collectionId: collection, productId: product, sortOrder }).onConflictDoNothing();
  }

  await db.insert(coupons).values([
    { code: "RITUAL10", description: "10% off orders of $40 or more", discountType: "percent", discountValue: 10, minimumOrderAmount: 40 },
    { code: "WELCOME", description: "$10 off", discountType: "fixed", discountValue: 10, minimumOrderAmount: 0 },
  ]).onConflictDoNothing();

  for (const [slug, rating, title, comment] of reviewRows) {
    const id = productId.get(slug);
    if (!id) continue;
    const [existing] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.title, title)).limit(1);
    if (existing) continue;
    await db.insert(reviews).values({ productId: id, rating, title, comment, status: "approved" });
  }

  const email = process.env["ADMIN_EMAIL"]?.trim().toLowerCase();
  const password = process.env["ADMIN_PASSWORD"];
  if (email && password) {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const userId = existing?.id ?? (await db.insert(users).values({
      email,
      passwordHash: await hashPassword(password),
      fullName: "Shop admin",
      emailVerifiedAt: new Date(),
    }).returning({ id: users.id }))[0]?.id;
    if (userId) {
      await db.insert(userRoles).values({ userId, role: "admin" }).onConflictDoUpdate({ target: userRoles.userId, set: { role: "admin" } });
    }
  }
}

main().then(() => {
  console.log("Seeded the apothecary database.");
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

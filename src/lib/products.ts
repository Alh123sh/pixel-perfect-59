import soap from "@/assets/soap.jpg";
import candle from "@/assets/candle.jpg";
import cream from "@/assets/cream.jpg";
import bath from "@/assets/bath.jpg";
import gift from "@/assets/gift.jpg";
import hero from "@/assets/hero.jpg";
import type { Category, Collection, Coupon, JournalCategory, Post, Product, Review, Ritual, Variant } from "./types";

export type { Category, Collection, Coupon, JournalCategory, Post, Product, Review, Ritual, Variant };

const ship = "Ships in 1–3 business days. Free shipping on orders over $75.";
const returns = "Unopened items may be returned within 30 days of delivery.";
const details = "Made in small batches and packed in recyclable materials. Because each batch is handmade, color and texture may vary slightly.";

function item(p: Omit<Product, "details" | "shipping" | "returns" | "images"> & { images?: string[] }): Product {
  return {
    ...p,
    details,
    shipping: ship,
    returns,
    images: p.images ?? [p.image, p.hoverImage],
  };
}

const size = (id: string, name: string, price: number, inStock = true): Variant => ({ id, name, price, inStock });

export const categories: Category[] = [
  { slug: "bath-body", name: "Bath & Body", blurb: "Soaks, oils, and scrubs for slow evenings.", image: bath },
  { slug: "skincare", name: "Skincare", blurb: "Whipped butters, balms, and botanical oils.", image: cream },
  { slug: "soaps", name: "Soaps", blurb: "Cold-process bars, cut and cured by hand.", image: soap },
  { slug: "candles", name: "Candles", blurb: "Hand-poured soy with wooden wicks.", image: candle },
  { slug: "home-wellness", name: "Home & Wellness", blurb: "Room mists and quiet scents for the house.", image: hero },
  { slug: "gifts", name: "Gifts", blurb: "Thoughtful sets, wrapped and ready to give.", image: gift },
];

export const rituals: Ritual[] = [
  { slug: "relax", name: "Relax", description: "Soft scents for the end of the day.", image: bath },
  { slug: "refresh", name: "Refresh", description: "Clean, bright notes for a reset.", image: hero },
  { slug: "pamper", name: "Pamper", description: "Richer textures for unhurried care.", image: cream },
  { slug: "gift", name: "Gift", description: "Ready-to-give sets for someone you love.", image: gift },
  { slug: "unwind", name: "Unwind", description: "Candles and mists for a quieter room.", image: candle },
  { slug: "everyday", name: "Everyday Essentials", description: "The pieces worth keeping within reach.", image: soap },
];

export const collections: Collection[] = [
  { slug: "best-sellers", name: "Customer Favorites", description: "The products our community keeps coming back for.", image: cream },
  { slug: "new-arrivals", name: "New & Noteworthy", description: "The latest small batches, just poured and cured.", image: bath },
  { slug: "ritual-edit", name: "The Ritual Edit", description: "A considered edit of bath, body, and home.", image: hero },
  { slug: "gifting", name: "The Gifting Edit", description: "Sets and favorites, ready to wrap.", image: gift },
];

export const products: Product[] = [
  item({
    slug: "lavender-oat-soap",
    name: "Lavender Oat Bar Soap",
    category: "soaps",
    productType: "Soap",
    collections: ["best-sellers", "ritual-edit"],
    price: 9,
    image: soap,
    hoverImage: cream,
    scent: "Lavender",
    size: "4.5 oz",
    rating: 4.9,
    reviews: 212,
    badge: "Best Seller",
    needs: ["relax", "everyday"],
    rituals: ["relax", "everyday"],
    description: "A gentle cold-process bar made with colloidal oatmeal and French lavender, cured for six weeks.",
    ingredients: "Olive oil, coconut oil, shea butter, colloidal oatmeal, lavender essential oil, dried lavender buds.",
    howToUse: "Lather between wet hands and massage onto skin. Rinse. Keep the bar dry between uses.",
    inStock: true,
    variants: [size("bar", "Single bar · 4.5 oz", 9), size("trio", "Trio · 3 bars", 24)],
    createdAt: "2025-11-02",
    sold: 640,
  }),
  item({
    slug: "sage-soy-candle",
    name: "Sage & Cedar Soy Candle",
    category: "candles",
    productType: "Candle",
    collections: ["best-sellers", "ritual-edit"],
    price: 32,
    image: candle,
    hoverImage: hero,
    scent: "Sage & Cedar",
    size: "9 oz",
    rating: 4.8,
    reviews: 154,
    badge: "Best Seller",
    needs: ["unwind", "relax"],
    rituals: ["unwind", "relax"],
    description: "Hand-poured soy wax with a crackling wooden wick. Green sage, cedarwood, and a hint of citrus.",
    ingredients: "Soy wax, phthalate-free fragrance oil, essential oils, wooden wick.",
    howToUse: "Trim the wick to 1/8 inch before each burn. Burn for 2–3 hours at a time.",
    inStock: true,
    variants: [size("full", "Full size · 9 oz", 32), size("travel", "Travel · 3 oz", 18)],
    createdAt: "2025-10-14",
    sold: 410,
  }),
  item({
    slug: "shea-vanilla-body-butter",
    name: "Shea Vanilla Body Butter",
    category: "skincare",
    productType: "Body butter",
    collections: ["best-sellers", "ritual-edit"],
    price: 24,
    image: cream,
    hoverImage: bath,
    scent: "Shea Vanilla",
    size: "6.8 oz",
    rating: 4.9,
    reviews: 301,
    badge: "Best Seller",
    needs: ["pamper", "everyday"],
    rituals: ["pamper", "everyday"],
    description: "Whipped until cloud-soft. Rich shea and cocoa butter melt into skin for a velvety finish.",
    ingredients: "Shea butter, cocoa butter, sweet almond oil, vanilla absolute, vitamin E.",
    howToUse: "Warm a small amount between palms and smooth over damp skin after bathing.",
    inStock: true,
    variants: [size("jar", "Jar · 6.8 oz", 24), size("travel", "Travel tin · 2 oz", 14)],
    createdAt: "2025-09-20",
    sold: 820,
  }),
  item({
    slug: "rose-himalayan-bath-salts",
    name: "Rose Himalayan Bath Salts",
    category: "bath-body",
    productType: "Bath soak",
    collections: ["new-arrivals", "ritual-edit"],
    price: 18,
    image: bath,
    hoverImage: gift,
    scent: "Rose Geranium",
    size: "12 oz",
    rating: 4.7,
    reviews: 98,
    badge: "New",
    needs: ["relax", "pamper"],
    rituals: ["relax", "pamper"],
    description: "Pink Himalayan and Epsom salts blended with rose petals for a softly scented soak.",
    ingredients: "Himalayan pink salt, Epsom salt, rose geranium oil, dried rose petals.",
    howToUse: "Dissolve 2–3 scoops in warm running bath water. Soak for about 20 minutes.",
    inStock: true,
    variants: [size("jar", "Jar · 12 oz", 18), size("pouch", "Refill pouch · 24 oz", 32)],
    createdAt: "2026-08-18",
    sold: 120,
  }),
  item({
    slug: "self-care-gift-set",
    name: "The Self-Care Gift Box",
    category: "gifts",
    productType: "Gift set",
    collections: ["gifting", "best-sellers"],
    price: 58,
    compareAt: 68,
    image: gift,
    hoverImage: candle,
    scent: "Assorted",
    size: "4 pieces",
    rating: 5,
    reviews: 76,
    badge: "Limited",
    needs: ["gift"],
    rituals: ["gift"],
    description: "A bar soap, travel candle, lip balm, and eucalyptus bundle, wrapped in kraft and twine.",
    ingredients: "See the included products for individual ingredient lists.",
    howToUse: "Unwrap, light, lather, and enjoy — or give it as it is.",
    inStock: true,
    variants: [],
    createdAt: "2026-02-01",
    sold: 260,
  }),
  item({
    slug: "eucalyptus-body-oil",
    name: "Eucalyptus Bath & Body Oil",
    category: "bath-body",
    productType: "Body oil",
    collections: ["new-arrivals", "ritual-edit"],
    price: 28,
    image: hero,
    hoverImage: bath,
    scent: "Eucalyptus",
    size: "4 fl oz",
    rating: 4.8,
    reviews: 63,
    badge: "Best Seller",
    needs: ["refresh", "unwind"],
    rituals: ["refresh", "unwind"],
    description: "A lightweight blend of jojoba and sweet almond with eucalyptus and spearmint.",
    ingredients: "Jojoba oil, sweet almond oil, eucalyptus oil, spearmint oil, vitamin E.",
    howToUse: "Massage onto damp skin, or add a few drops to a warm bath.",
    inStock: true,
    variants: [size("bottle", "Bottle · 4 fl oz", 28), size("mini", "Mini · 1 fl oz", 16)],
    createdAt: "2026-07-04",
    sold: 390,
  }),
  item({
    slug: "calendula-honey-soap",
    name: "Calendula Honey Soap",
    category: "soaps",
    productType: "Soap",
    collections: ["ritual-edit"],
    price: 9,
    image: soap,
    hoverImage: gift,
    scent: "Honey",
    size: "4.5 oz",
    rating: 4.8,
    reviews: 140,
    needs: ["everyday", "pamper"],
    rituals: ["everyday", "pamper"],
    description: "Calendula petals and raw local honey in a creamy, softly sweet bar.",
    ingredients: "Olive oil, coconut oil, raw honey, calendula, shea butter.",
    howToUse: "Lather, massage, and rinse. Store on a draining dish.",
    inStock: false,
    variants: [size("bar", "Single bar · 4.5 oz", 9, false)],
    createdAt: "2026-01-12",
    sold: 300,
  }),
  item({
    slug: "linen-amber-candle",
    name: "Linen & Amber Candle",
    category: "candles",
    productType: "Candle",
    collections: ["new-arrivals"],
    price: 32,
    image: candle,
    hoverImage: cream,
    scent: "Linen & Amber",
    size: "9 oz",
    rating: 4.7,
    reviews: 88,
    badge: "New",
    needs: ["unwind", "refresh"],
    rituals: ["unwind", "refresh"],
    description: "Clean cotton and warm amber — like sun-dried sheets on a quiet Sunday.",
    ingredients: "Soy wax, phthalate-free fragrance oil, wooden wick.",
    howToUse: "Burn 2–3 hours at a time and trim the wick between burns.",
    inStock: true,
    variants: [size("full", "Full size · 9 oz", 32), size("travel", "Travel · 3 oz", 18)],
    createdAt: "2026-09-02",
    sold: 96,
  }),
  item({
    slug: "cedar-room-spray",
    name: "Cedar Room Spray",
    category: "home-wellness",
    productType: "Room spray",
    collections: ["new-arrivals", "ritual-edit"],
    price: 22,
    image: hero,
    hoverImage: candle,
    scent: "Cedar",
    size: "4 fl oz",
    rating: 4.6,
    reviews: 41,
    badge: "New",
    needs: ["refresh", "everyday"],
    rituals: ["refresh", "everyday"],
    description: "A fine mist of cedarwood and soft citrus for linens, rooms, and entryways.",
    ingredients: "Distilled water, witch hazel, cedarwood oil, sweet orange oil.",
    howToUse: "Shake gently and mist into the air or over linens. Avoid unfinished wood.",
    inStock: true,
    variants: [],
    createdAt: "2026-09-20",
    sold: 74,
  }),
  item({
    slug: "linen-mist",
    name: "Sunday Linen Mist",
    category: "home-wellness",
    productType: "Room spray",
    collections: ["ritual-edit"],
    price: 22,
    image: bath,
    hoverImage: hero,
    scent: "Linen",
    size: "4 fl oz",
    rating: 4.5,
    reviews: 28,
    needs: ["unwind", "refresh"],
    rituals: ["unwind", "refresh"],
    description: "A light linen scent for pillows and freshly made beds.",
    ingredients: "Distilled water, witch hazel, cotton blossom fragrance, essential oils.",
    howToUse: "Mist above the bed and let it settle. Shake before each use.",
    inStock: true,
    variants: [],
    createdAt: "2026-06-11",
    sold: 52,
  }),
];

export const reviews: Review[] = [
  { id: "r1", productSlug: "lavender-oat-soap", name: "Maya R.", rating: 5, title: "The bar I keep reordering", body: "A soft lather and a quiet lavender scent. It lasts, and the oatmeal feels gentle.", date: "Sep 2, 2026", verified: true },
  { id: "r2", productSlug: "lavender-oat-soap", name: "Elena P.", rating: 5, title: "Simple and lovely", body: "I use it every evening. The bar stays firm when I keep it on a draining dish.", date: "Aug 18, 2026", verified: true },
  { id: "r3", productSlug: "shea-vanilla-body-butter", name: "Jonah K.", rating: 5, title: "A little goes far", body: "Rich without feeling heavy. The vanilla is warm, not sugary.", date: "Sep 12, 2026", verified: true },
  { id: "r4", productSlug: "sage-soy-candle", name: "Priya S.", rating: 5, title: "Clean burn", body: "The wooden wick crackles softly and the sage stays light through the room.", date: "Jul 30, 2026", verified: true },
  { id: "r5", productSlug: "self-care-gift-set", name: "Hannah L.", rating: 5, title: "Beautiful to give", body: "Arrived wrapped and ready. The mix of soap, candle, and oil felt considered.", date: "Aug 4, 2026", verified: true },
  { id: "r6", productSlug: "rose-himalayan-bath-salts", name: "Claire D.", rating: 4, title: "A soft soak", body: "The rose is gentle. I use two scoops and the jar looks lovely on the tub.", date: "Sep 22, 2026", verified: true },
  { id: "r7", productSlug: "eucalyptus-body-oil", name: "Andre W.", rating: 5, title: "Light and fresh", body: "Sinks in quickly after a shower. The eucalyptus is bright, not sharp.", date: "Sep 8, 2026", verified: true },
  { id: "r8", productSlug: "linen-amber-candle", name: "Nora F.", rating: 5, title: "Sunday scent", body: "Like clean sheets with a little warmth. I burn it while reading.", date: "Sep 28, 2026", verified: false },
];

export const coupons: Coupon[] = [
  { code: "RITUAL10", type: "percent", value: 10, minSubtotal: 40 },
  { code: "WELCOME", type: "amount", value: 10 },
];

export const posts: Post[] = [
  { slug: "evening-bath-ritual", title: "Building an Evening Bath Ritual", excerpt: "Five slow steps for winding down after a long day.", category: "Self Care", image: bath, date: "Sep 28, 2026", body: ["A bath does not need to be elaborate to feel like a pause. Start by clearing the edge of the tub, then run the water a little warmer than you think you want.", "Add a scoop of salts once the tub is half full so they dissolve. Dim the overhead light. A single candle is enough.", "Step in and leave the phone in another room. Ten quiet minutes will do more than a complicated routine.", "When you get out, press a little body oil into damp skin. The warmth helps it settle.", "Keep the same order most evenings. Rituals work because they are familiar."] },
  { slug: "why-cold-process-soap", title: "Why We Still Make Soap the Slow Way", excerpt: "Six weeks of curing, and why it's worth every day.", category: "Behind the Brand", image: soap, date: "Sep 12, 2026", body: ["Cold-process soap is mixed, poured, cut, and then left alone. The cure is the part you cannot rush.", "Over six weeks the bars firm up and the lather becomes smoother. We stamp each batch and note the date.", "We keep the recipes short: oils, butters, and a scent that can stand on its own.", "That is the whole method. Small batches, a long rest, and bars we would use ourselves."] },
  { slug: "candle-care-guide", title: "The Little Guide to Candle Care", excerpt: "Get a cleaner, longer burn from every candle.", category: "Wellness", image: candle, date: "Aug 30, 2026", body: ["Trim the wooden wick to about an eighth of an inch before you light it.", "The first burn should last long enough for the melt pool to reach the edges. That helps the candle burn evenly later.", "Two to three hours is a good session. Extinguish it and let the wax settle before lighting it again.", "Keep candles away from drafts and always within sight."] },
  { slug: "gift-wrapping-notes", title: "How We Wrap a Gift", excerpt: "Kraft, twine, and a card — nothing more than it needs.", category: "Gift Ideas", image: gift, date: "Aug 12, 2026", body: ["We wrap sets in kraft paper and cotton twine. The point is that it should feel finished when it arrives.", "If you are building your own set, pair one bar, one candle, and one oil. Different scents can still feel related if they stay soft.", "Add a short note. The wrapping is only half of the gift."] },
  { slug: "body-oil-after-bath", title: "Oil, While Skin Is Still Damp", excerpt: "A simple way to finish a bath or shower.", category: "Bath & Body", image: hero, date: "Jul 19, 2026", body: ["Body oil spreads further on damp skin than on dry skin. Pat yourself mostly dry, then warm a few drops in your hands.", "Start with arms and legs. You can always add more; it is harder to take it back.", "Give it a minute before you dress. A light oil should leave a soft finish, not a slick one."] },
  { slug: "a-simple-skincare-shelf", title: "A Shelf With Only What You Use", excerpt: "Three products, and a reason for each one.", category: "Skincare", image: cream, date: "Jul 2, 2026", body: ["A crowded shelf is easy to ignore. We like a short list: a gentle soap, a butter or oil, and something that smells like the evening you want.", "Use the soap in the shower. Follow with butter where skin feels dry, and oil where you want something lighter.", "Replace a product when you finish it, not because a new jar looks interesting."] },
];

export const heroImage = hero;
export const socialImages = [hero, soap, candle, cream, bath, gift];

export const money = (n: number) => `$${n.toFixed(2)}`;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
export const byCategory = (slug: string) => products.filter((p) => p.category === slug);
export const byCollection = (slug: string) => products.filter((p) => p.collections.includes(slug));

export function categoryName(slug: string) {
  return getCategory(slug)?.name ?? slug;
}

export function hasVariants(product: Product) {
  return product.variants.length > 1;
}

export function isSoldOut(product: Product) {
  if (!product.inStock) return true;
  if (product.variants.length === 0) return false;
  return product.variants.every((v) => !v.inStock);
}

export function variantOf(product: Product, variantId?: string) {
  return product.variants.find((v) => v.id === variantId);
}

export function unitPrice(product: Product, variantId?: string) {
  return variantOf(product, variantId)?.price ?? product.price;
}

export function lineKey(slug: string, variantId?: string) {
  return `${slug}::${variantId ?? ""}`;
}

export function ratingBreakdown(rating: number, count: number) {
  const weights = rating >= 4.8 ? [0.84, 0.11, 0.03, 0.01, 0.01] : rating >= 4.5 ? [0.7, 0.18, 0.07, 0.03, 0.02] : [0.5, 0.25, 0.15, 0.06, 0.04];
  const stars = [5, 4, 3, 2, 1];
  const counts = weights.map((w) => Math.round(count * w));
  const drift = count - counts.reduce((a, b) => a + b, 0);
  counts[0] = Math.max(0, (counts[0] ?? 0) + drift);
  return Object.fromEntries(stars.map((star, i) => [star, counts[i] ?? 0])) as Record<number, number>;
}

export const needs = rituals.map((r) => ({ slug: r.slug, name: r.name }));

export const popularSearches = ["Lavender", "Candles", "Gift sets", "Body butter", "Bath salts"];

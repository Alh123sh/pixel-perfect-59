import soap from "@/assets/soap.jpg";
import candle from "@/assets/candle.jpg";
import cream from "@/assets/cream.jpg";
import bath from "@/assets/bath.jpg";
import gift from "@/assets/gift.jpg";
import hero from "@/assets/hero.jpg";

export type Category = { slug: string; name: string; blurb: string; image: string };
export type Product = {
  slug: string; name: string; category: string; price: number; compareAt?: number;
  image: string; scent: string; size: string; rating: number; reviews: number;
  badge?: "Best Seller" | "New" | "Limited"; needs: string[]; description: string;
  ingredients: string; howToUse: string;
};

export const categories: Category[] = [
  { slug: "bath-body", name: "Bath & Body", blurb: "Soaks, salts and scrubs for slow evenings.", image: bath },
  { slug: "skincare", name: "Skincare", blurb: "Whipped butters, balms and botanical oils.", image: cream },
  { slug: "soaps", name: "Soaps", blurb: "Cold-process bars, cut by hand.", image: soap },
  { slug: "candles", name: "Candles", blurb: "Hand-poured soy with wooden wicks.", image: candle },
  { slug: "gifts", name: "Gifts", blurb: "Thoughtful sets, wrapped and ready.", image: gift },
];

const P = (p: Product) => p;
export const products: Product[] = [
  P({ slug: "lavender-oat-soap", name: "Lavender Oat Bar Soap", category: "soaps", price: 9, image: soap, scent: "Lavender", size: "4.5 oz", rating: 4.9, reviews: 212, badge: "Best Seller", needs: ["relax", "sensitive"], description: "A gentle cold-process bar made with colloidal oatmeal and French lavender, cured for six weeks.", ingredients: "Olive oil, coconut oil, shea butter, colloidal oatmeal, lavender essential oil, dried lavender buds.", howToUse: "Lather between wet hands and massage onto skin. Rinse. Keep dry between uses." }),
  P({ slug: "sage-soy-candle", name: "Sage & Cedar Soy Candle", category: "candles", price: 32, image: candle, scent: "Sage & Cedar", size: "9 oz", rating: 4.8, reviews: 154, badge: "Best Seller", needs: ["relax", "home"], description: "Hand-poured soy wax with a crackling wooden wick. Green sage, cedarwood and a hint of citrus.", ingredients: "Soy wax, phthalate-free fragrance oil, essential oils, wooden wick.", howToUse: "Trim the wick to 1/8\" before each burn. Burn 2–3 hours at a time." }),
  P({ slug: "shea-vanilla-body-butter", name: "Shea Vanilla Body Butter", category: "skincare", price: 24, image: cream, scent: "Shea Vanilla", size: "6.8 oz", rating: 4.9, reviews: 301, badge: "Best Seller", needs: ["dry-skin", "sensitive"], description: "Whipped until cloud-soft. Rich shea and cocoa butter melt into skin for a velvety finish.", ingredients: "Shea butter, cocoa butter, sweet almond oil, vanilla absolute, vitamin E.", howToUse: "Warm a small amount between palms and smooth over damp skin after bathing." }),
  P({ slug: "rose-himalayan-bath-salts", name: "Rose Himalayan Bath Salts", category: "bath-body", price: 18, image: bath, scent: "Rose Geranium", size: "12 oz", rating: 4.7, reviews: 98, badge: "New", needs: ["relax"], description: "Pink Himalayan and Epsom salts blended with rose petals for a softly scented soak.", ingredients: "Himalayan pink salt, Epsom salt, rose geranium oil, dried rose petals.", howToUse: "Dissolve 2–3 scoops in warm running bath water. Soak for 20 minutes." }),
  P({ slug: "self-care-gift-set", name: "The Self-Care Gift Box", category: "gifts", price: 58, compareAt: 68, image: gift, scent: "Assorted", size: "4 pieces", rating: 5.0, reviews: 76, badge: "Limited", needs: ["gift"], description: "A bar soap, travel candle, lip balm and eucalyptus bundle, wrapped in kraft and twine.", ingredients: "See individual products.", howToUse: "Unwrap, light, lather, and enjoy." }),
  P({ slug: "eucalyptus-body-oil", name: "Eucalyptus Bath & Body Oil", category: "bath-body", price: 28, image: hero, scent: "Eucalyptus", size: "4 fl oz", rating: 4.8, reviews: 63, badge: "New", needs: ["relax", "dry-skin"], description: "A lightweight blend of jojoba and sweet almond with eucalyptus and spearmint.", ingredients: "Jojoba oil, sweet almond oil, eucalyptus oil, spearmint oil, vitamin E.", howToUse: "Massage onto damp skin, or add a few drops to a warm bath." }),
  P({ slug: "calendula-honey-soap", name: "Calendula Honey Soap", category: "soaps", price: 9, image: soap, scent: "Honey", size: "4.5 oz", rating: 4.8, reviews: 140, needs: ["sensitive", "dry-skin"], description: "Calendula petals and raw local honey in a creamy, softly sweet bar.", ingredients: "Olive oil, coconut oil, raw honey, calendula, shea butter.", howToUse: "Lather, massage, rinse. Store on a draining dish." }),
  P({ slug: "linen-amber-candle", name: "Linen & Amber Candle", category: "candles", price: 32, image: candle, scent: "Linen & Amber", size: "9 oz", rating: 4.7, reviews: 88, badge: "New", needs: ["home"], description: "Clean cotton and warm amber, like sun-dried sheets on a Sunday.", ingredients: "Soy wax, phthalate-free fragrance oil, wooden wick.", howToUse: "Burn 2–3 hours at a time; trim the wick between burns." }),
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const byCategory = (slug: string) => products.filter((p) => p.category === slug);
export const money = (n: number) => `$${n.toFixed(2)}`;

export const needs = [
  { slug: "relax", name: "Relax & Unwind" },
  { slug: "dry-skin", name: "Dry Skin" },
  { slug: "sensitive", name: "Sensitive Skin" },
  { slug: "home", name: "Home Fragrance" },
  { slug: "gift", name: "Gift Giving" },
];

export const posts = [
  { slug: "evening-bath-ritual", title: "Building an Evening Bath Ritual", excerpt: "Five slow steps for winding down after a long day.", image: bath, date: "Sep 28, 2026" },
  { slug: "why-cold-process-soap", title: "Why We Still Make Soap the Slow Way", excerpt: "Six weeks of curing, and why it's worth every day.", image: soap, date: "Sep 12, 2026" },
  { slug: "candle-care-guide", title: "The Little Guide to Candle Care", excerpt: "Get a cleaner, longer burn from every candle.", image: candle, date: "Aug 30, 2026" },
];
export const heroImage = hero;

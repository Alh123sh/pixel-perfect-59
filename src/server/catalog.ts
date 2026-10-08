import { asc, eq } from "drizzle-orm";
import { databaseConfigured, getDb } from "@/db/client";
import { categories, collections, products } from "@/db/schema";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  track_inventory: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_on_sale: boolean;
  ingredients: string | null;
  how_to_use: string | null;
  details: string | null;
  product_type: string | null;
  scent: string | null;
  size_label: string | null;
  rituals: string[] | null;
  badge: "Best Seller" | "New" | "Limited" | "Sale" | null;
  sold_count: number;
  created_at: string;
  categories: { slug: string; name: string; description: string | null; image_url: string | null } | null;
  product_images: { image_url: string; alt_text: string | null; sort_order: number; is_primary: boolean }[];
  product_variants: { sku: string; name: string; price: number | null; inventory_quantity: number; is_active: boolean }[];
  collection_products: { collections: { slug: string; name: string; description: string | null; image_url: string | null } | null }[];
  reviews: { rating: number; status: string }[];
};

export type CatalogResult =
  | { source: "local" }
  | {
      source: "postgres";
      error: string;
      products: CatalogProduct[];
      categories: { slug: string; name: string; description: string; image_url: string | null }[];
      collections: { slug: string; name: string; description: string; image_url: string | null }[];
    };

const empty = (error: string): CatalogResult => ({ source: "postgres", error, products: [], categories: [], collections: [] });

export async function loadCatalog(): Promise<CatalogResult> {
  if (!databaseConfigured()) return { source: "local" };
  try {
    const db = getDb();
    const [productRows, categoryRows, collectionRows] = await Promise.all([
      db.query.products.findMany({
        where: eq(products.isActive, true),
        with: {
          category: true,
          images: true,
          variants: true,
          collectionLinks: { with: { collection: true } },
          reviews: true,
        },
      }),
      db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder)),
      db.select().from(collections).where(eq(collections.isActive, true)).orderBy(asc(collections.name)),
    ]);
    return {
      source: "postgres",
      error: "",
      products: productRows.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        short_description: row.shortDescription,
        description: row.description,
        price: row.price,
        compare_at_price: row.compareAtPrice,
        inventory_quantity: row.inventoryQuantity,
        track_inventory: row.trackInventory,
        is_best_seller: row.isBestSeller,
        is_new_arrival: row.isNewArrival,
        is_on_sale: row.isOnSale,
        ingredients: row.ingredients,
        how_to_use: row.howToUse,
        details: row.details,
        product_type: row.productType,
        scent: row.scent,
        size_label: row.sizeLabel,
        rituals: row.rituals,
        badge: row.badge as CatalogProduct["badge"],
        sold_count: row.soldCount,
        created_at: row.createdAt.toISOString(),
        categories: row.category
          ? { slug: row.category.slug, name: row.category.name, description: row.category.description, image_url: row.category.imageUrl }
          : null,
        product_images: row.images.map((image) => ({
          image_url: image.imageUrl,
          alt_text: image.altText,
          sort_order: image.sortOrder,
          is_primary: image.isPrimary,
        })),
        product_variants: row.variants.map((variant) => ({
          sku: variant.sku,
          name: variant.name,
          price: variant.price,
          inventory_quantity: variant.inventoryQuantity,
          is_active: variant.isActive,
        })),
        collection_products: row.collectionLinks.map((link) => ({
          collections: link.collection
            ? { slug: link.collection.slug, name: link.collection.name, description: link.collection.description, image_url: link.collection.imageUrl }
            : null,
        })),
        reviews: row.reviews.filter((review) => review.status === "approved").map((review) => ({ rating: review.rating, status: review.status })),
      })),
      categories: categoryRows.map((category) => ({
        slug: category.slug,
        name: category.name,
        description: category.description,
        image_url: category.imageUrl,
      })),
      collections: collectionRows.map((collection) => ({
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        image_url: collection.imageUrl,
      })),
    };
  } catch (error) {
    console.error(error);
    return empty("The store database is not reachable.");
  }
}

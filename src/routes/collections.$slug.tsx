import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getCollections, useCatalog } from "@/lib/storefront";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const collection = (await getCollections()).find((item) => item.slug === params.slug);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.collection.name ?? "Collection"} — 63rd Street Apothecary`;
    const description = loaderData?.collection.description ?? "";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const { collection } = Route.useLoaderData();
  const { products } = useCatalog();
  return (
    <ProductGrid
      key={collection.slug}
      title={collection.name}
      intro={collection.description}
      items={products.filter((product) => product.collections.includes(collection.slug))}
      crumbs={[{ label: "Shop", to: "/shop" }, { label: collection.name }]}
    />
  );
}

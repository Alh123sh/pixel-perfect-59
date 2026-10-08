import { createFileRoute, notFound } from "@tanstack/react-router";
import { JsonLd, breadcrumbJsonLd } from "@/components/site/JsonLd";
import { ProductGrid } from "@/components/site/ProductGrid";
import { getCategories, useCatalog } from "@/lib/storefront";

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ params }) => {
    const category = (await getCategories()).find((item) => item.slug === params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    const title = `${loaderData?.category.name ?? "Category"} — 63rd Street Apothecary`;
    const description = loaderData?.category.blurb ?? "";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const { products } = useCatalog();
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: category.name, path: `/category/${category.slug}` }])} />
      <ProductGrid key={category.slug} title={category.name} intro={category.blurb} items={products.filter((product) => product.category === category.slug)} hideCategory crumbs={[{ label: "Shop", to: "/shop" }, { label: category.name }]} />
    </>
  );
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductGrid } from "@/components/site/ProductGrid";
import { byCategory, getCategory } from "@/lib/products";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    const t = `${loaderData?.category.name ?? "Category"} — 63rd Street Apothecary`;
    const d = loaderData?.category.blurb ?? "";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  return <ProductGrid key={category.slug} title={category.name} intro={category.blurb} items={byCategory(category.slug)} />;
}

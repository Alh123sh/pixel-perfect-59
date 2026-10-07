import { createFileRoute, notFound } from "@tanstack/react-router";
import { posts } from "@/lib/products";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.post.title ?? "Journal"} — 63rd Street Apothecary` }, { name: "description", content: loaderData?.post.excerpt ?? "" }, { property: "og:title", content: loaderData?.post.title ?? "Journal" }, { property: "og:description", content: loaderData?.post.excerpt ?? "" }, { property: "og:type", content: "article" }] }),
  component: Post,
});

function Post() {
  const { post } = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="eyebrow">{post.date}</p>
      <h1 className="mt-3 text-5xl md:text-6xl">{post.title}</h1>
      <img src={post.image} alt="" className="mt-10 aspect-[16/10] w-full object-cover" />
      <p className="mt-10 text-lg leading-relaxed text-muted-foreground">{post.excerpt} Full story coming soon.</p>
    </article>
  );
}

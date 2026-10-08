import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { JsonLd, breadcrumbJsonLd } from "@/components/site/JsonLd";
import { getJournalPost, getJournalPosts } from "@/lib/api";

export const Route = createFileRoute("/journal/$slug")({
  loader: ({ params }) => {
    const post = getJournalPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.post.title ?? "Journal"} — 63rd Street Apothecary` },
      { name: "description", content: loaderData?.post.excerpt ?? "" },
      { property: "og:title", content: loaderData?.post.title ?? "Journal" },
      { property: "og:description", content: loaderData?.post.excerpt ?? "" },
      { property: "og:type", content: "article" },
    ],
  }),
  component: Post,
});

function Post() {
  const { post } = Route.useLoaderData();
  const more = getJournalPosts().filter((p) => p.slug !== post.slug).slice(0, 2);
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Journal", path: "/journal" }, { name: post.title, path: `/journal/${post.slug}` }])} />
      <p className="eyebrow">{post.category} · {post.date}</p>
      <h1 className="mt-3 text-5xl md:text-6xl">{post.title}</h1>
      <img src={post.image} alt="" className="mt-10 aspect-[16/10] w-full object-cover" />
      <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted-foreground">
        {post.body.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
      </div>
      <div className="mt-16 border-t pt-10">
        <p className="eyebrow">Continue reading</p>
        <ul className="mt-4 space-y-3">
          {more.map((p) => <li key={p.slug}><Link to="/journal/$slug" params={{ slug: p.slug }} className="font-serif text-2xl">{p.title}</Link></li>)}
        </ul>
      </div>
    </article>
  );
}

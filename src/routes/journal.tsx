import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { posts } from "@/lib/products";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — 63rd Street Apothecary" }, { name: "description", content: "Notes on slow living, rituals and making things by hand." }, { property: "og:title", content: "Journal" }, { property: "og:description", content: "Notes on slow living and handmade rituals." }] }),
  component: Journal,
});

function Journal() {
  const child = useMatch({ from: "/journal/$slug", shouldThrow: false });
  if (child) return <Outlet />;
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <h1 className="text-6xl">The Journal</h1>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {posts.map((p) => (
          <Link key={p.slug} to="/journal/$slug" params={{ slug: p.slug }} className="group">
            <div className="aspect-[4/3] overflow-hidden"><img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
            <p className="eyebrow mt-4">{p.date}</p>
            <p className="mt-2 font-serif text-2xl">{p.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

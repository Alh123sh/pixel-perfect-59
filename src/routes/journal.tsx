import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useState } from "react";
import { posts, type JournalCategory } from "@/lib/products";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — 63rd Street Apothecary" }, { name: "description", content: "Notes on self-care, bath and body, skincare, wellness, gifts, and the work behind the brand." }, { property: "og:title", content: "Journal" }, { property: "og:description", content: "Notes on slow living and handmade rituals." }] }),
  component: Journal,
});

const cats: Array<JournalCategory | "All"> = ["All", "Self Care", "Bath & Body", "Skincare", "Wellness", "Gift Ideas", "Behind the Brand"];

function Journal() {
  const child = useMatch({ from: "/journal/$slug", shouldThrow: false });
  const [cat, setCat] = useState<(typeof cats)[number]>("All");
  if (child) return <Outlet />;
  const list = cat === "All" ? posts : posts.filter((p) => p.category === cat);
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <h1 className="text-6xl">The Journal</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Essays and short guides on rituals, making, and giving.</p>
      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Journal categories">
        {cats.map((c) => (
          <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`px-4 py-2 text-xs uppercase tracking-[0.14em] ${cat === c ? "bg-foreground text-background" : "border"}`}>{c}</button>
        ))}
      </div>
      {list.length === 0 ? <p className="py-20 font-serif text-2xl">No notes in this category yet.</p> : (
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {list.map((p) => (
            <article key={p.slug}>
              <Link to="/journal/$slug" params={{ slug: p.slug }} className="group">
                <div className="aspect-[4/3] overflow-hidden"><img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                <p className="eyebrow mt-4">{p.category}</p>
                <h2 className="mt-2 font-serif text-2xl">{p.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                <p className="link-underline mt-3 inline-block text-xs uppercase tracking-[0.18em]">Read article</p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

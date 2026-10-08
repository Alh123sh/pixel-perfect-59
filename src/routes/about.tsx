import { createFileRoute, Link } from "@tanstack/react-router";
import bath from "@/assets/bath.jpg";
import candle from "@/assets/candle.jpg";
import cream from "@/assets/cream.jpg";
import hero from "@/assets/hero.jpg";
import soap from "@/assets/soap.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — 63rd Street Apothecary" },
      { name: "description", content: "63rd Street Apothecary makes small-batch bath, body, skincare, and home products with a slower, more careful approach." },
      { property: "og:title", content: "Our Story — 63rd Street Apothecary" },
      { property: "og:description", content: "The story, philosophy, and craft behind 63rd Street Apothecary." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <article>
      <section className="mx-auto grid max-w-7xl items-end gap-10 px-5 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <p className="eyebrow">Our Story</p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-7xl">A kitchen table, then a studio.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            63rd Street Apothecary began with a single batch of lavender soap. The work is still done in small batches — soaps cured for weeks, candles poured by hand, butters whipped until they feel right.
          </p>
        </div>
        <img src={soap} alt="Handmade soap bars" className="aspect-[4/5] w-full object-cover" />
      </section>

      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2 lg:px-8">
          <img src={hero} alt="Oils and candles on linen" className="aspect-[5/4] w-full object-cover" />
          <div className="lg:pl-10">
            <p className="eyebrow">Our Philosophy</p>
            <h2 className="mt-3 text-5xl">Care, kept simple.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
              We would rather make fewer things well. A bar, a candle, an oil — each one should earn a place in an ordinary day. Nothing here is meant to be complicated, and nothing is promised beyond what the product actually does.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <p className="eyebrow">Our Products</p>
        <h2 className="mt-3 max-w-xl text-5xl">Bath, body, skin, and the room around them.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[[bath, "Bath & body", "Soaks, oils, and the things you reach for after a long day."], [cream, "Skincare", "Butters and balms with short ingredient lists."], [candle, "Home", "Candles and mists for the hour before sleep."]].map(([img, title, copy]) => (
            <figure key={title}>
              <img src={img} alt="" className="aspect-[4/5] w-full object-cover" />
              <figcaption className="mt-4">
                <p className="font-serif text-2xl">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <img src={bath} alt="A bath arranged for a slow evening" className="aspect-square h-full w-full object-cover" />
        <div className="flex items-center bg-cream px-8 py-16 md:px-16">
          <div>
            <p className="eyebrow">Small-Batch Craftsmanship</p>
            <h2 className="mt-3 text-5xl">Six weeks, one batch.</h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
              Soap is cured before it is sold. Candles are poured in amounts we can watch. When a batch is gone, we make it again — we do not stretch it. That pace is the product.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-24 text-center">
        <p className="eyebrow">Our Values</p>
        <h2 className="mt-3 text-5xl">What we keep returning to</h2>
        <ul className="mt-10 space-y-6 text-left text-muted-foreground">
          <li><strong className="font-serif text-2xl text-foreground">Honesty.</strong> We describe scent, texture, and use. We do not make medical claims.</li>
          <li><strong className="font-serif text-2xl text-foreground">Restraint.</strong> Short formulas, quiet packaging, and only the products we would keep.</li>
          <li><strong className="font-serif text-2xl text-foreground">Care.</strong> For the people who buy from us, and for the pace of the work itself.</li>
        </ul>
        <Link to="/shop" className="btn btn-primary mt-12">Shop the collection</Link>
      </section>
    </article>
  );
}

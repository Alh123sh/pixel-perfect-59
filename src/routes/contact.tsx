import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — 63rd Street Apothecary" },
      { name: "description", content: "Write to 63rd Street Apothecary in Batavia, Illinois. We reply within one business day." },
      { property: "og:title", content: "Contact — 63rd Street Apothecary" },
      { property: "og:description", content: "Questions about an order or a product? Send us a note." },
    ],
  }),
  component: Contact,
});

const field = "w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

function Contact() {
  const [done, setDone] = useState(false);
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-5 py-16 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="eyebrow">Say hello</p>
        <h1 className="mt-3 text-5xl md:text-6xl">Contact</h1>
        {done ? <p className="mt-8 text-muted-foreground">Thank you. We received your note and will reply within one business day.</p> : (
          <form className="mt-8 grid gap-3" onSubmit={(e) => { e.preventDefault(); setDone(true); }}>
            <label className="text-xs uppercase tracking-[0.14em]" htmlFor="name">Name</label>
            <input id="name" required className={field} />
            <label className="text-xs uppercase tracking-[0.14em]" htmlFor="email">Email</label>
            <input id="email" required type="email" className={field} />
            <label className="text-xs uppercase tracking-[0.14em]" htmlFor="phone">Phone</label>
            <input id="phone" type="tel" className={field} />
            <label className="text-xs uppercase tracking-[0.14em]" htmlFor="message">Message</label>
            <textarea id="message" required rows={5} className={field} />
            <button className="btn btn-primary w-fit">Send message</button>
          </form>
        )}
      </div>
      <aside className="space-y-8 bg-secondary p-8">
        <div>
          <p className="eyebrow">Studio</p>
          <p className="mt-3 font-serif text-3xl">10 E. Wilson Street, Unit 1<br />Batavia, IL 60510</p>
        </div>
        <div>
          <p className="eyebrow">Hours</p>
          <p className="mt-3 text-muted-foreground">Studio visits by appointment. Orders placed online ship in 1–3 business days.</p>
        </div>
        <div>
          <p className="eyebrow">Write</p>
          <a className="mt-3 block underline" href="mailto:hello@63rdstreetapothecary.com">hello@63rdstreetapothecary.com</a>
        </div>
        <div className="flex gap-4 text-sm">
          <a href="https://www.instagram.com/" className="underline">Instagram</a>
          <a href="https://www.facebook.com/" className="underline">Facebook</a>
        </div>
        <Link to="/faq" className="btn btn-outline">Read the FAQ</Link>
      </aside>
    </div>
  );
}

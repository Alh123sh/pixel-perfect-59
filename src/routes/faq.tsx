import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — 63rd Street Apothecary" }, { name: "description", content: "Shipping, returns, ingredients, and orders at 63rd Street Apothecary." }, { property: "og:title", content: "FAQ — 63rd Street Apothecary" }, { property: "og:description", content: "Answers about shipping, returns, and small-batch products." }] }),
  component: Faq,
});

const items: [string, string, string][] = [
  ["ship", "When will my order ship?", "Orders ship within 1–3 business days. You will see a confirmation on the checkout thank-you page. This demo does not send a real tracking email."],
  ["free", "Do you offer free shipping?", "Standard shipping is free on orders over $75. Under that, a flat rate is added at checkout."],
  ["returns", "What is your return policy?", "Unopened items can be returned within 30 days of delivery. Because these are personal-care goods, opened products cannot be resold."],
  ["batches", "Why do products sometimes sell out?", "We make small batches. When a batch is gone, we make it again rather than stretching the recipe."],
  ["ingredients", "Where can I read ingredients?", "Every product page lists ingredients, how to use it, and shipping details. We do not make medical claims about what a product can treat."],
];

function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow">Help</p>
      <h1 className="mt-3 text-5xl md:text-6xl">FAQ</h1>
      <Accordion type="single" collapsible className="mt-10">
        {items.map(([id, q, a]) => (
          <AccordionItem key={id} value={id}>
            <AccordionTrigger className="font-serif text-2xl">{q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="mt-10 text-sm text-muted-foreground">Still looking? <Link to="/contact" className="underline">Contact the studio</Link>.</p>
    </div>
  );
}

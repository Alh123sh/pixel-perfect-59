import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — 63rd Street Apothecary" }, { name: "description", content: "Our products are handmade in small batches. Orders ship in 1 to 3 business days, and orders over $75 ship free." }, { property: "og:title", content: "FAQ — 63rd Street Apothecary" }, { property: "og:description", content: "Our products are handmade in small batches. Orders ship in 1 to 3 business days, and orders over $75 ship free." }] }),
  component: () => <InfoPage eyebrow="Help" title="FAQ"><p>Our products are handmade in small batches. Orders ship in 1 to 3 business days, and orders over $75 ship free.</p></InfoPage>,
});

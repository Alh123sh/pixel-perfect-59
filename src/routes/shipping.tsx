import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping — 63rd Street Apothecary" }, { name: "description", content: "Orders ship within 1 to 3 business days. Standard shipping is free on orders over $75." }, { property: "og:title", content: "Shipping — 63rd Street Apothecary" }, { property: "og:description", content: "Orders ship within 1 to 3 business days. Standard shipping is free on orders over $75." }] }),
  component: () => <InfoPage eyebrow="Help" title="Shipping"><p>Orders ship within 1 to 3 business days. Standard shipping is free on orders over $75.</p></InfoPage>,
});

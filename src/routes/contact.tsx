import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Us — 63rd Street Apothecary" }, { name: "description", content: "Questions about an order or a product? Email hello@63rdstreetapothecary.com and we will reply within one business day." }, { property: "og:title", content: "Contact Us — 63rd Street Apothecary" }, { property: "og:description", content: "Questions about an order or a product? Email hello@63rdstreetapothecary.com and we will reply within one business day." }] }),
  component: () => <InfoPage eyebrow="Say hello" title="Contact Us"><p>Questions about an order or a product? Email hello@63rdstreetapothecary.com and we will reply within one business day.</p></InfoPage>,
});

import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/returns")({
  head: () => ({ meta: [{ title: "Returns — 63rd Street Apothecary" }, { name: "description", content: "Unopened items may be returned within 30 days of delivery for a full refund." }, { property: "og:title", content: "Returns — 63rd Street Apothecary" }, { property: "og:description", content: "Unopened items may be returned within 30 days of delivery for a full refund." }] }),
  component: () => <InfoPage eyebrow="Help" title="Returns"><p>Unopened items may be returned within 30 days of delivery for a full refund.</p></InfoPage>,
});

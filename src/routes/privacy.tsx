import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — 63rd Street Apothecary" }, { name: "description", content: "We only collect the information needed to process your order and never sell your data." }, { property: "og:title", content: "Privacy Policy — 63rd Street Apothecary" }, { property: "og:description", content: "We only collect the information needed to process your order and never sell your data." }] }),
  component: () => <InfoPage eyebrow="Legal" title="Privacy Policy"><p>We only collect the information needed to process your order and never sell your data.</p></InfoPage>,
});

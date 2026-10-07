import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "Our Story — 63rd Street Apothecary" }, { name: "description", content: "63rd Street Apothecary began at a kitchen table with a single batch of lavender soap. Today every bar, balm and candle is still made by hand in small batches, with natural ingredients and a lot of care." }, { property: "og:title", content: "Our Story — 63rd Street Apothecary" }, { property: "og:description", content: "63rd Street Apothecary began at a kitchen table with a single batch of lavender soap. Today every bar, balm and candle is still made by hand in small batches, with natural ingredients and a lot of care." }] }),
  component: () => <InfoPage eyebrow="About" title="Our Story"><p>63rd Street Apothecary began at a kitchen table with a single batch of lavender soap. Today every bar, balm and candle is still made by hand in small batches, with natural ingredients and a lot of care.</p></InfoPage>,
});

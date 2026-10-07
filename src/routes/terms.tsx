import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — 63rd Street Apothecary" }, { name: "description", content: "By using this site you agree to our terms of purchase and use." }, { property: "og:title", content: "Terms of Service — 63rd Street Apothecary" }, { property: "og:description", content: "By using this site you agree to our terms of purchase and use." }] }),
  component: () => <InfoPage eyebrow="Legal" title="Terms of Service"><p>By using this site you agree to our terms of purchase and use.</p></InfoPage>,
});

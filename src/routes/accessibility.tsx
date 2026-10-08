import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/accessibility")({
  head: () => ({
    meta: [
      { title: "Accessibility — 63rd Street Apothecary" },
      { name: "description", content: "We aim to keep 63rd Street Apothecary usable with a keyboard, a screen reader, and clear contrast." },
      { property: "og:title", content: "Accessibility" },
      { property: "og:description", content: "Accessibility at 63rd Street Apothecary." },
    ],
  }),
  component: () => (
    <InfoPage eyebrow="Help" title="Accessibility">
      <p>We build this shop so it can be used with a keyboard, a screen reader, and without relying on color alone. Focus states stay visible, dialogs can be closed with Escape, and form fields have labels.</p>
      <p>If you hit a barrier, write to us through the <Link to="/contact" className="underline">contact form</Link> and tell us what you were trying to do. We will treat that as a fix, not a suggestion.</p>
    </InfoPage>
  ),
});

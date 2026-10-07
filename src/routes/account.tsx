import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";
export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Your Account — 63rd Street Apothecary" }, { name: "description", content: "Account sign-in is coming soon. Your bag and wishlist are saved on this device." }, { property: "og:title", content: "Your Account — 63rd Street Apothecary" }, { property: "og:description", content: "Account sign-in is coming soon. Your bag and wishlist are saved on this device." }] }),
  component: () => <InfoPage eyebrow="Account" title="Your Account"><p>Account sign-in is coming soon. Your bag and wishlist are saved on this device.</p></InfoPage>,
});

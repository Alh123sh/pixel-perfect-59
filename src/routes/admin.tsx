import { createFileRoute } from "@tanstack/react-router";
import { AdminGate } from "@/components/admin/ui";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — 63rd Street Apothecary" }, { name: "robots", content: "noindex" }] }),
  component: () => <AdminGate />,
});

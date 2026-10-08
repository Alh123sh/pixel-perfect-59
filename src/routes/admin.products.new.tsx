import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const Route = createFileRoute("/admin/products/new")({
  component: () => {
    const navigate = useNavigate();
    return <ProductEditor onSaved={(id) => navigate({ to: "/admin/products/$id", params: { id } })} />;
  },
});

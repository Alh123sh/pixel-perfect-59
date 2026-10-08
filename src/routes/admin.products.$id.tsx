import { createFileRoute } from "@tanstack/react-router";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const Route = createFileRoute("/admin/products/$id")({
  component: function EditProduct() {
    const { id } = Route.useParams();
    return <ProductEditor productId={id} />;
  },
});

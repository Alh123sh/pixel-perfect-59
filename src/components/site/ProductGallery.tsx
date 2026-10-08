import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images.length ? product.images : [product.image];
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="hidden md:block">
        <img src={current} alt={product.name} width={1024} height={1280} className="aspect-[4/5] w-full bg-secondary object-cover" />
        {images.length > 1 && (
          <div className="mt-3 grid grid-cols-4 gap-3">
            {images.map((src, i) => (
              <button key={src + i} type="button" onClick={() => setActive(i)} aria-label={`Show image ${i + 1}`}
                className={`aspect-square overflow-hidden bg-secondary ${i === active ? "ring-1 ring-foreground" : "opacity-80"}`}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto md:hidden" aria-label="Product images">
        {images.map((src, i) => (
          <img key={src + i} src={src} alt={`${product.name} ${i + 1}`} className="aspect-[4/5] w-[86%] shrink-0 snap-center bg-secondary object-cover" />
        ))}
      </div>
    </div>
  );
}

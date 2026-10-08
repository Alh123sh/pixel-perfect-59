import { Star } from "lucide-react";

export function Stars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <span className="flex" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(value) ? "fill-clay text-clay" : "text-border"}`} />
        ))}
      </span>
      <span className="sr-only">{value} out of 5 stars</span>
      <span>{value.toFixed(1)}{count != null ? ` (${count})` : ""}</span>
    </span>
  );
}

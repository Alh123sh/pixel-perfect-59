import type { ReactNode } from "react";
export function InfoPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 text-5xl md:text-6xl">{title}</h1>
      <div className="mt-8 space-y-5 leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

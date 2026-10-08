import { useMemo, useState } from "react";
import { getReviews } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ratingBreakdown } from "@/lib/products";
import { useStore } from "@/lib/store";
import { submitProductReview } from "@/lib/storefront";
import type { Product, Review } from "@/lib/types";
import { Stars } from "./Stars";

const field = "w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

export function ReviewSection({ product, published = [] }: { product: Product; published?: Review[] }) {
  const { reviews: extra, addReview } = useStore();
  const { configured, user } = useAuth();
  const [sent, setSent] = useState("");
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const local = useMemo(() => getReviews(product.slug, extra), [product.slug, extra]);
  const list = configured ? published : local;
  const total = product.reviews + extra.filter((r) => r.productSlug === product.slug).length;
  const breakdown = ratingBreakdown(product.rating, product.reviews);

  return (
    <section className="mt-20 border-t pt-16" aria-labelledby="reviews-heading">
      <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 id="reviews-heading" className="text-4xl">Reviews</h2>
          <div className="mt-4"><Stars value={product.rating} count={total} /></div>
          <ul className="mt-6 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const n = breakdown[star] ?? 0;
              const pct = product.reviews ? Math.round((n / product.reviews) * 100) : 0;
              return (
                <li key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-6">{star}★</span>
                  <span className="h-1 flex-1 bg-secondary"><span className="block h-full bg-clay" style={{ width: `${pct}%` }} /></span>
                  <span className="w-8 text-muted-foreground">{n}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="space-y-8">
          {list.length === 0 && <p className="text-muted-foreground">No written reviews yet. Be the first to share how you use it.</p>}
          {list.map((review) => (
            <article key={review.id} className="border-b pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <Stars value={review.rating} />
                {review.verified && <span className="border px-2 py-1 text-[0.65rem] uppercase tracking-[0.16em]">Verified purchase</span>}
              </div>
              <h3 className="mt-3 font-serif text-2xl">{review.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{review.body}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{review.name} · {review.date}</p>
            </article>
          ))}
          <div>
            <h3 className="font-serif text-3xl">Write a review</h3>
            {sent ? <p className="mt-4">{sent}</p> : (
              <form className="mt-5 grid gap-3" onSubmit={async (e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                const title = String(data.get("title") || "Review");
                const body = String(data.get("body") || "");
                const name = String(data.get("name") || "Guest");
                setError("");
                try {
                  if (configured) {
                    if (!user) throw new Error("Sign in before submitting a review.");
                    if (!product.id) throw new Error("This product is not in the store database yet.");
                    await submitProductReview({ productId: product.id, rating, title, comment: body });
                    setSent("Thank you. Your review is waiting for approval and is not public yet.");
                    return;
                  }
                  addReview({ productSlug: product.slug, name, rating, title, body });
                  setSent("Saved on this device only. It is not published to the shop.");
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Could not submit the review.");
                }
              }}>
                <label className="text-xs uppercase tracking-[0.16em]" htmlFor="review-name">Name</label>
                <input id="review-name" name="name" required className={field} />
                <p className="text-xs uppercase tracking-[0.16em]">Rating</p>
                <div className="flex gap-2" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" aria-checked={rating === n} role="radio" onClick={() => setRating(n)}
                      className={`h-10 w-10 border ${rating === n ? "bg-foreground text-background" : ""}`}>{n}</button>
                  ))}
                </div>
                <label className="text-xs uppercase tracking-[0.16em]" htmlFor="review-title">Title</label>
                <input id="review-title" name="title" required className={field} />
                <label className="text-xs uppercase tracking-[0.16em]" htmlFor="review-body">Review</label>
                <textarea id="review-body" name="body" required rows={4} className={field} />
                <button className="btn btn-primary w-fit">Submit review</button>
                {error && <p className="text-sm" role="alert">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

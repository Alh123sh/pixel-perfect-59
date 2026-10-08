import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminDeleteReviewFn, adminReviewsFn, adminReviewStatusFn } from "@/server/fns";

export const Route = createFileRoute("/admin/reviews")({ component: ReviewsPage });

type Row = { id: string; rating: number; title: string; comment: string; status: string };

function ReviewsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminReviewsFn().then((data) => {
      setRows(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load reviews.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  async function setStatus(id: string, status: "approved" | "rejected") {
    try {
      await adminReviewStatusFn({ data: { id, status } });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the review.");
    }
  }
  return (
    <div>
      <h1 className="text-4xl">Reviews</h1>
      <div className="mt-6"><AdminState loading={loading} error={error} empty={rows.length === 0} onRetry={load}>
        <ul className="space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="border p-4 text-sm">
              <p className="font-serif text-2xl">{row.title} · {row.rating}/5 · {row.status}</p>
              <p className="mt-2">{row.comment}</p>
              <div className="mt-3 flex gap-3">
                <button type="button" className="underline" onClick={() => setStatus(row.id, "approved")}>Approve</button>
                <button type="button" className="underline" onClick={() => setStatus(row.id, "rejected")}>Reject</button>
                <button type="button" className="underline" onClick={async () => { await adminDeleteReviewFn({ data: { id: row.id } }); load(); }}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </AdminState></div>
    </div>
  );
}

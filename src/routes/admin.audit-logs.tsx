import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { AdminState } from "@/components/admin/ui";
import { adminAuditFn } from "@/server/fns";

export const Route = createFileRoute("/admin/audit-logs")({ component: AuditPage });

type Row = { id: string; action: string; entity_type: string; entity_id: string | null; created_at: string };

function AuditPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    adminAuditFn().then((data) => {
      setRows(data);
      setError("");
      setLoading(false);
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Could not load the audit log.");
      setLoading(false);
    });
  }, []);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <h1 className="text-4xl">Audit log</h1>
      <div className="mt-6"><AdminState loading={loading} error={error} empty={rows.length === 0} onRetry={load}>
        <ul className="divide-y text-sm">
          {rows.map((row) => <li key={row.id} className="py-3">{new Date(row.created_at).toLocaleString()} · {row.action} · {row.entity_type} {row.entity_id ?? ""}</li>)}
        </ul>
      </AdminState></div>
    </div>
  );
}

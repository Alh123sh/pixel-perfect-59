import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const links = [
  ["/admin/dashboard", "Dashboard"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/collections", "Collections"],
  ["/admin/orders", "Orders"],
  ["/admin/inventory", "Inventory"],
  ["/admin/customers", "Customers"],
  ["/admin/reviews", "Reviews"],
  ["/admin/coupons", "Coupons"],
  ["/admin/settings", "Settings"],
  ["/admin/audit-logs", "Audit log"],
] as const;

export function AdminGate({ children }: { children?: ReactNode }) {
  const auth = useAuth();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (!auth.ready) return <p className="px-5 py-24 text-center">Loading admin…</p>;
  if (!auth.configured) return <p className="mx-auto max-w-lg px-5 py-24 text-center">Connect the store database before opening the admin. No store data is being simulated here.</p>;
  if (!auth.user) return <p className="mx-auto max-w-lg px-5 py-24 text-center">Sign in with an admin account. <Link to="/login" search={{ redirect: pathname }} className="underline">Sign in</Link></p>;
  if (!auth.isAdmin) return <p className="mx-auto max-w-lg px-5 py-24 text-center">This account does not have admin access.</p>;
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 md:grid-cols-[180px_1fr]">
      <nav className="space-y-2 text-sm" aria-label="Admin">
        {links.map(([to, label]) => <Link key={to} to={to} className="block hover:underline">{label}</Link>)}
      </nav>
      <div>{children ?? <Outlet />}</div>
    </div>
  );
}

export function AdminState({ loading, error, empty, onRetry, children }: { loading: boolean; error: string; empty?: boolean; onRetry: () => void; children: ReactNode }) {
  if (loading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 animate-pulse bg-secondary" />)}</div>;
  if (error) return <p role="alert">{error} <button type="button" className="underline" onClick={onRetry}>Retry</button></p>;
  if (empty) return <p className="text-muted-foreground">Nothing here yet.</p>;
  return children;
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } => (
    typeof s["redirect"] === "string" && s["redirect"].startsWith("/") ? { redirect: s["redirect"] } : {}
  ),
  head: () => ({ meta: [{ title: "Sign in — 63rd Street Apothecary" }, { name: "description", content: "Sign in to your 63rd Street Apothecary account." }] }),
  component: LoginPage,
});

const field = "w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

function LoginPage() {
  const { redirect } = Route.useSearch();
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-5xl">Sign in</h1>
      <form className="mt-8 space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setPending(true);
        setError("");
        try {
          await auth.signIn(String(data.get("email")), String(data.get("password")));
          navigate({ to: redirect || "/account" });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not sign in.");
        } finally {
          setPending(false);
        }
      }}>
        <input required type="email" name="email" autoComplete="email" placeholder="Email" className={field} />
        <input required type="password" name="password" autoComplete="current-password" placeholder="Password" className={field} />
        {error && <p className="text-sm" role="alert">{error}</p>}
        <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      </form>
      <p className="mt-6 text-sm"><Link to="/forgot-password" className="underline">Forgot password</Link> · <Link to="/register" className="underline">Create account</Link></p>
    </div>
  );
}

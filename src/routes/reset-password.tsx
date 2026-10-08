import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search["token"] === "string" ? search["token"] : "" }),
  head: () => ({ meta: [{ title: "Choose a new password — 63rd Street Apothecary" }, { name: "description", content: "Set a new password." }] }),
  component: ResetPage,
});

function ResetPage() {
  const auth = useAuth();
  const { token } = Route.useSearch();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-5xl">New password</h1>
      <p className="mt-3 text-sm text-muted-foreground">Use the reset link from your email. In local development that link is shown on the previous page.</p>
      {done ? <p className="mt-6">Password updated. <Link to="/login" className="underline">Sign in</Link></p> : (
        <form className="mt-8 space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            if (!token) throw new Error("This reset link is missing its token.");
            await auth.updatePassword(token, String(new FormData(e.currentTarget).get("password")));
            setDone(true);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not update the password.");
          }
        }}>
          <input required type="password" name="password" minLength={8} autoComplete="new-password" placeholder="New password" className="w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
          {error && <p className="text-sm" role="alert">{error}</p>}
          <button className="btn btn-primary w-full">Update password</button>
        </form>
      )}
    </div>
  );
}

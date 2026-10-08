import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — 63rd Street Apothecary" }, { name: "description", content: "Create a 63rd Street Apothecary account." }] }),
  component: RegisterPage,
});

const field = "w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

function RegisterPage() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-5xl">Create account</h1>
      <p className="mt-3 text-sm text-muted-foreground">New accounts are customers. Admin access is granted separately and is not available here.</p>
      <form className="mt-8 space-y-3" onSubmit={async (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setPending(true);
        setError("");
        try {
          const result = await auth.signUp(String(data.get("email")), String(data.get("password")), String(data.get("name")));
          setNotice(result.devVerifyUrl ? `Account created. Email is not sent in local development. Confirm it here: ${result.devVerifyUrl}` : "Account created. Email delivery is not configured, so confirm the address from the link returned in development.");
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not create the account.");
        } finally {
          setPending(false);
        }
      }}>
        <input required name="name" autoComplete="name" placeholder="Full name" className={field} />
        <input required type="email" name="email" autoComplete="email" placeholder="Email" className={field} />
        <input required type="password" name="password" autoComplete="new-password" minLength={8} placeholder="Password" className={field} />
        {error && <p className="text-sm" role="alert">{error}</p>}
        {notice && <p className="text-sm">{notice}</p>}
        <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Creating…" : "Create account"}</button>
      </form>
      <p className="mt-6 text-sm"><Link to="/login" className="underline">Already have an account</Link></p>
    </div>
  );
}

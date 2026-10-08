import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — 63rd Street Apothecary" }, { name: "description", content: "Send a password reset email." }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-5xl">Reset password</h1>
      {notice ? <p className="mt-6">{notice}</p> : (
        <form className="mt-8 space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            const result = await auth.sendPasswordReset(String(new FormData(e.currentTarget).get("email")));
            setNotice(result.devResetUrl ? `${result.message} ${result.devResetUrl}` : result.message);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Could not send the reset email.");
          }
        }}>
          <input required type="email" name="email" placeholder="Email" className="w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground" />
          {error && <p className="text-sm" role="alert">{error}</p>}
          <button className="btn btn-primary w-full">Send reset link</button>
        </form>
      )}
      <p className="mt-6 text-sm"><Link to="/login" className="underline">Back to sign in</Link></p>
    </div>
  );
}

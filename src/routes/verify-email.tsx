import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifyEmailFn } from "@/server/fns";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({ token: typeof search["token"] === "string" ? search["token"] : "" }),
  head: () => ({ meta: [{ title: "Confirm email — 63rd Street Apothecary" }, { name: "description", content: "Confirm your email address." }] }),
  component: VerifyPage,
});

function VerifyPage() {
  const { token } = Route.useSearch();
  const [message, setMessage] = useState("Confirming your email…");
  useEffect(() => {
    if (!token) {
      setMessage("This confirmation link is missing its token.");
      return;
    }
    verifyEmailFn({ data: { token } }).then(() => setMessage("Email confirmed. You can sign in.")).catch((err: unknown) => {
      setMessage(err instanceof Error ? err.message : "Could not confirm that email.");
    });
  }, [token]);
  return (
    <div className="mx-auto max-w-md px-5 py-20">
      <h1 className="text-5xl">Confirm email</h1>
      <p className="mt-6">{message}</p>
      <p className="mt-6 text-sm"><Link to="/login" className="underline">Sign in</Link></p>
    </div>
  );
}

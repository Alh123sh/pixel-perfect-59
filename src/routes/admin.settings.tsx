import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminSaveSettingsFn, adminSettingsFn } from "@/server/fns";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const [form, setForm] = useState({ store_name: "", support_email: "", support_phone: "", announcement_text: "", free_over: "75", standard: "8", express: "12", tax_rate: "0" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    adminSettingsFn().then(setForm).catch((err: unknown) => setError(err instanceof Error ? err.message : "Settings unavailable."));
  }, []);
  return (
    <form className="space-y-3" onSubmit={async (e) => {
      e.preventDefault();
      try {
        await adminSaveSettingsFn({ data: {
          store_name: form.store_name,
          support_email: form.support_email,
          support_phone: form.support_phone,
          announcement_text: form.announcement_text,
          free_over: Number(form.free_over),
          standard: Number(form.standard),
          express: Number(form.express),
          tax_rate: Number(form.tax_rate),
        } });
        setError("");
        setNotice("Saved.");
      } catch (err) {
        setNotice("");
        setError(err instanceof Error ? err.message : "Could not save settings.");
      }
    }}>
      <h1 className="text-4xl">Settings</h1>
      {(["store_name", "support_email", "support_phone", "announcement_text", "free_over", "standard", "express", "tax_rate"] as const).map((key) => (
        <label key={key} className="block text-sm">{key.replaceAll("_", " ")}<input className="mt-1 w-full border px-3 py-2" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>
      ))}
      {error && <p className="text-sm" role="alert">{error}</p>}
      {notice && <p className="text-sm">{notice}</p>}
      <button className="btn btn-primary">Save settings</button>
    </form>
  );
}

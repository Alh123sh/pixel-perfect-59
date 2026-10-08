import { createFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { saveAddressFn, updateProfileFn } from "@/server/fns";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Your Account — 63rd Street Apothecary" }, { name: "description", content: "Manage your profile, orders, wishlist, and saved addresses." }, { property: "og:title", content: "Your Account" }, { property: "og:description", content: "Your 63rd Street Apothecary account." }] }),
  component: Account,
});

const field = "w-full border bg-background px-4 py-3 text-sm outline-none focus:border-foreground";

function Account() {
  const orders = useMatch({ from: "/account/orders", shouldThrow: false });
  const detail = useMatch({ from: "/account/orders/$id", shouldThrow: false });
  if (orders || detail) return <Outlet />;
  return <AccountHome />;
}

function AccountHome() {
  const { customer, saveCustomer, addresses, saveAddress, removeAddress, orders, ready } = useStore();
  const auth = useAuth();
  const [profile, setProfile] = useState(customer);
  useEffect(() => { if (ready) setProfile(customer); }, [ready, customer]);
  const [saved, setSaved] = useState(false);
  const [addr, setAddr] = useState({ label: "Home", firstName: "", lastName: "", line1: "", city: "", state: "", zip: "", isDefault: true });

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 md:grid-cols-[200px_1fr]">
      <nav className="space-y-3 text-sm" aria-label="Account">
        <a href="#profile" className="block">Profile</a>
        <Link to="/account/orders" className="block">Orders</Link>
        <Link to="/wishlist" className="block">Wishlist</Link>
        <a href="#addresses" className="block">Saved addresses</a>
      </nav>
      <div className="space-y-16">
        <section id="profile">
          <h1 className="text-5xl">Profile</h1>
          <p className="mt-3 text-sm text-muted-foreground">{auth.configured ? (auth.user ? `Signed in as ${auth.user.email}.` : "Sign in to save orders, addresses, and reviews to your account.") : "Saved on this device until the store database is connected."}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {!auth.user && <Link to="/login" className="underline">Sign in</Link>}
            {!auth.user && <Link to="/register" className="underline">Create account</Link>}
            {auth.user && <button type="button" className="underline" onClick={() => auth.signOut()}>Sign out</button>}
            {auth.isAdmin && <Link to="/admin" className="underline">Admin</Link>}
          </div>
          <form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
            e.preventDefault();
            saveCustomer(profile);
            if (auth.user) {
              try {
                await updateProfileFn({ data: { fullName: `${profile.firstName} ${profile.lastName}`.trim(), email: profile.email, phone: profile.phone } });
              } catch {
                return;
              }
            }
            setSaved(true);
          }}>
            <label className="text-xs uppercase tracking-[0.14em]">First name<input className={`${field} mt-2`} value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} /></label>
            <label className="text-xs uppercase tracking-[0.14em]">Last name<input className={`${field} mt-2`} value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} /></label>
            <label className="text-xs uppercase tracking-[0.14em]">Email<input required type="email" className={`${field} mt-2`} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
            <label className="text-xs uppercase tracking-[0.14em]">Phone<input className={`${field} mt-2`} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label>
            <button className="btn btn-primary sm:col-span-2 w-fit">Save profile</button>
            {saved && <p className="text-sm">Profile saved.</p>}
          </form>
        </section>
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-3xl">Recent orders</h2>
            <Link to="/account/orders" className="text-xs uppercase tracking-[0.16em] underline">View all</Link>
          </div>
          {orders.length === 0 ? <p className="mt-4 text-muted-foreground">No orders yet.</p> : (
            <ul className="mt-4 divide-y">
              {orders.slice(0, 3).map((order) => (
                <li key={order.id} className="flex items-center justify-between py-3 text-sm">
                  <Link to="/account/orders/$id" params={{ id: order.id }} className="underline">{order.id}</Link>
                  <span>{order.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section id="addresses">
          <h2 className="text-3xl">Saved addresses</h2>
          {addresses.length === 0 && <p className="mt-3 text-muted-foreground">No addresses saved yet.</p>}
          <ul className="mt-4 space-y-3">
            {addresses.map((a) => (
              <li key={a.id} className="flex items-start justify-between border p-4 text-sm">
                <p>{a.label}{a.isDefault ? " · Default" : ""}<br />{a.firstName} {a.lastName}<br />{a.line1}, {a.city}, {a.state} {a.zip}</p>
                <button className="text-xs underline" onClick={() => removeAddress(a.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <form className="mt-6 grid gap-3 sm:grid-cols-2" onSubmit={async (e) => {
            e.preventDefault();
            saveAddress(addr);
            if (auth.user) {
              await saveAddressFn({ data: { label: addr.label, line1: addr.line1, city: addr.city, state: addr.state, zip: addr.zip, isDefault: addr.isDefault } });
            }
            setAddr({ ...addr, line1: "", city: "", zip: "" });
          }}>
            <input required aria-label="Label" placeholder="Label" className={field} value={addr.label} onChange={(e) => setAddr({ ...addr, label: e.target.value })} />
            <input required aria-label="Address" placeholder="Address" className={field} value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} />
            <input required aria-label="City" placeholder="City" className={field} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} />
            <input required aria-label="State" placeholder="State" className={field} value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} />
            <input required aria-label="ZIP" placeholder="ZIP" className={field} value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addr.isDefault} onChange={(e) => setAddr({ ...addr, isDefault: e.target.checked })} /> Default address</label>
            <button className="btn btn-outline w-fit">Save address</button>
          </form>
        </section>
      </div>
    </div>
  );
}

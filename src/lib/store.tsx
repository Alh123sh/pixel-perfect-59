import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "./auth";
import { addToCart, addWishlist, discountAmount, getCustomerOrders, removeFromCart, removeWishlist, shippingCost, submitReview, updateCart } from "./api";
import { orderFromPlacement, placeSecureOrder } from "./checkout";
import { isSoldOut, lineKey, unitPrice, variantOf } from "./products";
import { listMyOrdersFn, mergeCartFn, syncWishlistFn, toggleWishlistFn } from "@/server/fns";
import { previewCoupon, useCatalog } from "./storefront";
import type { Address, CartItem, Customer, Order, OrderItem, Product, Review } from "./types";

type ResolvedLine = CartItem & { product: Product; key: string; unit: number; variantName?: string | undefined };

type Ctx = {
  lines: ResolvedLine[];
  saved: ResolvedLine[];
  count: number;
  subtotal: number;
  discount: number;
  coupon: string;
  couponError: string;
  shipping: number;
  total: number;
  add: (slug: string, qty?: number, variantId?: string | undefined, openCart?: boolean) => void;
  setQty: (slug: string, qty: number, variantId?: string | undefined) => void;
  remove: (slug: string, variantId?: string | undefined) => void;
  saveForLater: (slug: string, variantId?: string | undefined) => void;
  moveToCart: (slug: string, variantId?: string | undefined) => void;
  removeSaved: (slug: string, variantId?: string | undefined) => void;
  applyCoupon: (code: string) => void;
  clearCoupon: () => void;
  clear: () => void;
  wishlist: string[];
  wished: (slug: string) => boolean;
  toggleWish: (slug: string) => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  reviews: Review[];
  addReview: (input: Omit<Review, "id" | "date" | "verified">) => void;
  recent: string[];
  viewProduct: (slug: string) => void;
  customer: Customer;
  saveCustomer: (customer: Customer) => void;
  addresses: Address[];
  saveAddress: (address: Omit<Address, "id"> & { id?: string }) => void;
  removeAddress: (id: string) => void;
  orders: Order[];
  ready: boolean;
  placeOrder: (input: { email: string; address: Address; delivery: string; idempotencyKey: string }) => Promise<Order>;
};

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "63rd";

function read<T>(name: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${KEY}-${name}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function resolve(items: CartItem[], products: Product[]): ResolvedLine[] {
  return items.flatMap((item) => {
    const product = products.find((entry) => entry.slug === item.slug);
    if (!product) return [];
    const variant = variantOf(product, item.variantId);
    return [{
      ...item,
      product,
      key: lineKey(item.slug, item.variantId),
      unit: unitPrice(product, item.variantId),
      variantName: variant?.name,
    }];
  });
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedItems, setSaved] = useState<CartItem[]>([]);
  const [wishlist, setWish] = useState<string[]>([]);
  const [coupon, setCoupon] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [customer, setCustomer] = useState<Customer>({ id: "cust_local", firstName: "", lastName: "", email: "", phone: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ready, setReady] = useState(false);
  const [remoteCoupon, setRemoteCoupon] = useState<{ amount: number; error: string } | null>(null);
  const cartRef = useRef(cart);
  const wishRef = useRef(wishlist);
  const mergedFor = useRef<string | null>(null);
  cartRef.current = cart;
  wishRef.current = wishlist;

  useEffect(() => {
    setCart(read<CartItem[]>("cart", []));
    setSaved(read<CartItem[]>("saved", []));
    setWish(read<string[]>("wish", []));
    setCoupon(read<string>("coupon", ""));
    setReviews(read<Review[]>("reviews", []));
    setRecent(read<string[]>("recent", []));
    setCustomer(read("customer", { id: "cust_local", firstName: "", lastName: "", email: "", phone: "" }));
    setAddresses(read<Address[]>("addresses", []));
    setOrders(read<Order[]>("orders", []));
    setReady(true);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-cart`, JSON.stringify(cart)); }, [cart, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-saved`, JSON.stringify(savedItems)); }, [savedItems, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-wish`, JSON.stringify(wishlist)); }, [wishlist, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-coupon`, JSON.stringify(coupon)); }, [coupon, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-reviews`, JSON.stringify(reviews)); }, [reviews, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-recent`, JSON.stringify(recent)); }, [recent, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-customer`, JSON.stringify(customer)); }, [customer, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-addresses`, JSON.stringify(addresses)); }, [addresses, ready]);
  useEffect(() => { if (ready) localStorage.setItem(`${KEY}-orders`, JSON.stringify(orders)); }, [orders, ready]);

  const lines = useMemo(() => resolve(cart, catalog.products), [cart, catalog.products]);
  const saved = useMemo(() => resolve(savedItems, catalog.products), [savedItems, catalog.products]);
  const subtotal = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  const localCoupon = discountAmount(coupon, subtotal);
  const discount = catalog.source === "postgres" && coupon ? (remoteCoupon?.amount ?? 0) : localCoupon.amount;
  const couponError = catalog.source === "postgres" && coupon ? (remoteCoupon?.error ?? "") : (coupon ? localCoupon.error : "");

  useEffect(() => {
    if (catalog.source !== "postgres" || !coupon) return;
    let cancel = false;
    previewCoupon(coupon, subtotal).then((result) => {
      if (!cancel) setRemoteCoupon(result);
    });
    return () => { cancel = true; };
  }, [catalog.source, coupon, subtotal]);

  useEffect(() => {
    if (!user || catalog.source !== "postgres" || !ready || mergedFor.current === user.id) return;
    mergedFor.current = user.id;
    const items = cartRef.current.map((item) => ({ slug: item.slug, quantity: item.qty, ...(item.variantId ? { variant_sku: item.variantId } : {}) }));
    mergeCartFn({ data: { items } }).then((data) => {
      if (!Array.isArray(data)) return;
      setCart(data.map((row) => ({
        slug: row.slug,
        qty: row.quantity,
        ...(row.variant_sku ? { variantId: row.variant_sku } : {}),
      })));
    }).catch(() => {
      mergedFor.current = null;
    });
    syncWishlistFn({ data: { slugs: wishRef.current } }).then((slugs) => {
      if (Array.isArray(slugs)) setWish(slugs);
    }).catch(() => {});
    listMyOrdersFn().then((rows) => {
      if (!Array.isArray(rows)) return;
      setOrders((current) => {
        const ids = new Set(rows.map((row) => row.id));
        return [...rows, ...current.filter((order) => !ids.has(order.id))];
      });
    }).catch(() => {});
  }, [user, catalog.source, ready]);
  const shipping = shippingCost(subtotal);

  const value: Ctx = {
    lines,
    saved,
    count: lines.reduce((sum, line) => sum + line.qty, 0),
    subtotal,
    discount,
    coupon,
    couponError: coupon ? couponError : "",
    shipping,
    total: Math.max(0, subtotal - discount) + shipping,
    add: (slug, qty = 1, variantId, openCart = true) => {
      const product = catalog.products.find((item) => item.slug === slug);
      if (!product || isSoldOut(product)) return;
      const variant = variantOf(product, variantId);
      if (variant && !variant.inStock) return;
      setCart((items) => addToCart(items, { slug, qty, variantId }));
      if (openCart) setCartOpen(true);
    },
    setQty: (slug, qty, variantId) => setCart((items) => updateCart(items, slug, qty, variantId)),
    remove: (slug, variantId) => setCart((items) => removeFromCart(items, slug, variantId)),
    saveForLater: (slug, variantId) => {
      const key = lineKey(slug, variantId);
      const line = cart.find((item) => lineKey(item.slug, item.variantId) === key);
      if (!line) return;
      setCart((items) => removeFromCart(items, slug, variantId));
      setSaved((items) => addToCart(items, line));
    },
    moveToCart: (slug, variantId) => {
      const key = lineKey(slug, variantId);
      const line = savedItems.find((item) => lineKey(item.slug, item.variantId) === key);
      if (!line) return;
      setSaved((items) => removeFromCart(items, slug, variantId));
      setCart((items) => addToCart(items, line));
    },
    removeSaved: (slug, variantId) => setSaved((items) => removeFromCart(items, slug, variantId)),
    applyCoupon: (code) => setCoupon(code.trim()),
    clearCoupon: () => setCoupon(""),
    clear: () => { setCart([]); setCoupon(""); },
    wishlist,
    wished: (slug) => wishlist.includes(slug),
    toggleWish: (slug) => {
      setWish((current) => (current.includes(slug) ? removeWishlist({ productSlugs: current }, slug).productSlugs : addWishlist({ productSlugs: current }, slug).productSlugs));
      if (user && catalog.source === "postgres") {
        toggleWishlistFn({ data: { slug } }).then((slugs) => {
          if (Array.isArray(slugs)) setWish(slugs);
        }).catch(() => {});
      }
    },
    cartOpen,
    setCartOpen,
    reviews,
    addReview: (input) => setReviews((current) => [submitReview(input), ...current]),
    recent,
    viewProduct: (slug) => setRecent((current) => [slug, ...current.filter((item) => item !== slug)].slice(0, 8)),
    customer,
    saveCustomer: setCustomer,
    addresses,
    saveAddress: (address) => setAddresses((current) => {
      const id = address.id ?? `addr-${Date.now()}`;
      const next = { ...address, id };
      const without = current.filter((item) => item.id !== id).map((item) => (next.isDefault ? { ...item, isDefault: false } : item));
      return [next, ...without];
    }),
    removeAddress: (id) => setAddresses((current) => current.filter((item) => item.id !== id)),
    orders: getCustomerOrders(orders),
    ready,
    placeOrder: async (input) => {
      if (lines.length === 0) throw new Error("Your bag is empty.");
      const placed = await placeSecureOrder({
        idempotency_key: input.idempotencyKey,
        customer_email: input.email,
        customer_name: `${input.address.firstName} ${input.address.lastName}`.trim(),
        shipping_method: input.delivery.startsWith("Express") ? "express" : "standard",
        ...(coupon ? { coupon_code: coupon } : {}),
        shipping_address: {
          recipient_name: `${input.address.firstName} ${input.address.lastName}`.trim(),
          address_line_1: input.address.line1,
          city: input.address.city,
          state_or_region: input.address.state,
          postal_code: input.address.zip,
          country: "US",
        },
        items: cart.map((item) => ({
          slug: item.slug,
          quantity: item.qty,
          ...(item.variantId ? { variant_sku: item.variantId } : {}),
        })),
      });
      const snapshots: OrderItem[] = lines.map((line) => {
        const priced = placed.items.find((item) => item.slug === line.slug && item.variant === (line.variantName ?? ""));
        return {
          slug: line.slug,
          name: line.product.name,
          ...(line.variantName ? { variant: line.variantName } : {}),
          qty: line.qty,
          price: priced?.price ?? line.unit,
          image: priced?.image || line.product.image,
        };
      });
      const order = orderFromPlacement(
        placed,
        snapshots,
        input.email,
        `${input.address.firstName} ${input.address.lastName}, ${input.address.line1}, ${input.address.city}, ${input.address.state} ${input.address.zip}`,
        input.delivery,
      );
      order.subtotal = placed.subtotal;
      order.discount = placed.discount_total;
      order.shipping = placed.shipping_total;
      order.total = placed.total;
      setOrders((current) => [order, ...current]);
      setCart([]);
      setCoupon("");
      return order;
    },
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

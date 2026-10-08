export type Variant = {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
};

export type Product = {
  id?: string;
  slug: string;
  name: string;
  category: string;
  productType: string;
  collections: string[];
  price: number;
  compareAt?: number;
  image: string;
  hoverImage: string;
  images: string[];
  scent: string;
  size: string;
  rating: number;
  reviews: number;
  badge?: "Best Seller" | "New" | "Limited" | "Sale";
  needs: string[];
  rituals: string[];
  description: string;
  ingredients: string;
  howToUse: string;
  details: string;
  shipping: string;
  returns: string;
  inStock: boolean;
  variants: Variant[];
  createdAt: string;
  sold: number;
};

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
};

export type Collection = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type Ritual = {
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type CartItem = {
  slug: string;
  variantId?: string | undefined;
  qty: number;
};

export type Cart = {
  items: CartItem[];
  couponCode?: string;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

export type OrderItem = {
  slug: string;
  name: string;
  variant?: string | undefined;
  qty: number;
  price: number;
  image: string;
};

export type Order = {
  id: string;
  createdAt: string;
  status: "Pending" | "Confirmed" | "Processing" | "Shipped" | "Delivered" | "Cancelled" | "Refunded";
  paymentStatus?: "pending" | "paid" | "failed" | "partially_refunded" | "refunded";
  email: string;
  shippingAddress: string;
  delivery: string;
  payment: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

export type Review = {
  id: string;
  productSlug: string;
  name: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type Wishlist = {
  productSlugs: string[];
};

export type Coupon = {
  code: string;
  type: "percent" | "amount";
  value: number;
  minSubtotal?: number;
};

export type JournalCategory =
  | "Self Care"
  | "Bath & Body"
  | "Skincare"
  | "Wellness"
  | "Gift Ideas"
  | "Behind the Brand";

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  body: string[];
  image: string;
  date: string;
  category: JournalCategory;
};

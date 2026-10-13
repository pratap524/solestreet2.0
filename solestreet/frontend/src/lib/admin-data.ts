/**
 * Admin data service — handles all admin CRUD operations.
 * Works with both Firebase Firestore and localStorage demo mode.
 */
import { products as localProducts } from "@/data/products";
import { INITIAL_COUPONS } from "@/lib/constants";
import type {
  Product,
  Order,
  Review,
  Coupon,
  UserProfile,
  AdminStats,
  FulfillmentStatus,
  ReviewStatus,
  Category,
} from "@/types";

// ─── localStorage Keys ──────────────────────────────────────────────────────

const KEYS = {
  orders: "solestreet_orders",
  reviews: "solestreet_reviews",
  coupons: "solestreet_admin_coupons",
  products: "solestreet_admin_products",
  users: "solestreet_mock_users_db",
  categories: "solestreet_admin_categories",
} as const;

// Only this account may provision additional administrators.
export const SUPER_ADMIN_EMAIL = "majorpartap2026@gmail.com";

function getStore<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStore<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore storage errors */ }
}

// ─── Products ───────────────────────────────────────────────────────────────

export function adminGetProducts(): Product[] {
  const stored = getStore<Product>(KEYS.products);
  if (stored.length > 0) return stored;
  // Legacy seed products are system-owned and cannot be changed by an arbitrary admin.
  // New products receive an explicit createdBy UID below.
  return localProducts.map((product) => ({ ...product, createdBy: product.createdBy || "system" }));
}

export function canManageProduct(product: Product, actorUid: string): boolean {
  return Boolean(actorUid && product.createdBy === actorUid);
}

export function adminCreateProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt" | "createdBy">,
  actorUid: string
): Product {
  if (!actorUid) throw new Error("Authentication required to create a product.");
  const product: Product = {
    ...data,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actorUid,
  };
  const products = adminGetProducts();
  products.unshift(product);
  setStore(KEYS.products, products);
  return product;
}

export function adminUpdateProduct(
  id: string,
  data: Partial<Product>,
  actorUid: string
): Product | null {
  const products = adminGetProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  if (!canManageProduct(products[idx], actorUid)) {
    throw new Error("Only the admin who created this product can edit it.");
  }
  delete data.createdBy;
  products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
  setStore(KEYS.products, products);
  return products[idx];
}

export function adminDeleteProduct(id: string, actorUid: string): boolean {
  const products = adminGetProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return false;
  if (!canManageProduct(product, actorUid)) {
    throw new Error("Only the admin who created this product can delete it.");
  }
  const filtered = products.filter((p) => p.id !== id);
  if (filtered.length === products.length) return false;
  setStore(KEYS.products, filtered);
  return true;
}

// ─── Categories ─────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat_running", name: "Running", slug: "running", description: "Performance running shoes", productCount: 0, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_casual", name: "Casual & Lifestyle", slug: "casual", description: "Everyday sneakers", productCount: 0, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_basketball", name: "Basketball", slug: "basketball", description: "Court-ready shoes", productCount: 0, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_skateboarding", name: "Skateboarding", slug: "skateboarding", description: "Skate shoes with grip", productCount: 0, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_hiking", name: "Hiking & Outdoor", slug: "hiking", description: "Trail-ready footwear", productCount: 0, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
  { id: "cat_training", name: "Training & Gym", slug: "training", description: "Versatile workout shoes", productCount: 0, isActive: true, createdAt: "2026-01-01T00:00:00Z" },
];

export function adminGetCategories(): Category[] {
  const stored = getStore<Category>(KEYS.categories);
  if (stored.length > 0) return stored;
  // Initialize with defaults and persist
  const withCounts = DEFAULT_CATEGORIES.map((cat) => {
    const products = adminGetProducts();
    return { ...cat, productCount: products.filter((p) => p.category === cat.slug).length };
  });
  setStore(KEYS.categories, withCounts);
  return withCounts;
}

export function adminCreateCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt" | "productCount">
): Category {
  const category: Category = {
    ...data,
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    productCount: 0,
    createdAt: new Date().toISOString(),
  };
  const categories = adminGetCategories();
  categories.push(category);
  setStore(KEYS.categories, categories);
  return category;
}

export function adminUpdateCategory(
  id: string,
  data: Partial<Category>
): Category | null {
  const categories = adminGetCategories();
  const idx = categories.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  categories[idx] = { ...categories[idx], ...data, updatedAt: new Date().toISOString() };
  setStore(KEYS.categories, categories);
  return categories[idx];
}

export function adminDeleteCategory(id: string): boolean {
  const categories = adminGetCategories();
  const filtered = categories.filter((c) => c.id !== id);
  if (filtered.length === categories.length) return false;
  setStore(KEYS.categories, filtered);
  return true;
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export function adminGetOrders(): Order[] {
  return getStore<Order>(KEYS.orders);
}

export function adminGetOrderById(id: string): Order | null {
  return adminGetOrders().find((o) => o.id === id) || null;
}

export function adminUpdateOrderStatus(
  id: string,
  fulfillmentStatus: FulfillmentStatus,
  trackingNumber?: string,
  notes?: string
): Order | null {
  const orders = adminGetOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;

  orders[idx] = {
    ...orders[idx],
    fulfillmentStatus,
    updatedAt: new Date().toISOString(),
    ...(trackingNumber && { trackingNumber }),
    ...(notes && { notes }),
    ...(fulfillmentStatus === "refunded" && { paymentStatus: "refunded" as const }),
  };
  setStore(KEYS.orders, orders);
  return orders[idx];
}

export function adminDeleteOrder(id: string): boolean {
  const orders = adminGetOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;
  setStore(KEYS.orders, filtered);
  return true;
}

// ─── Customers ──────────────────────────────────────────────────────────────

const DEFAULT_CUSTOMERS: UserProfile[] = [
  {
    uid: "cust_101",
    email: "sarah.jenkins@example.com",
    displayName: "Sarah Jenkins",
    role: "customer",
    addresses: [],
    createdAt: "2026-01-15T10:30:00Z",
    isDisabled: false,
  },
  {
    uid: "cust_102",
    email: "marcus.vance@example.com",
    displayName: "Marcus Vance",
    role: "customer",
    addresses: [],
    createdAt: "2026-02-04T14:20:00Z",
    isDisabled: false,
  },
  {
    uid: "cust_103",
    email: "elena.rostova@example.com",
    displayName: "Elena Rostova",
    role: "customer",
    addresses: [],
    createdAt: "2026-02-18T09:15:00Z",
    isDisabled: false,
  },
  {
    uid: "cust_104",
    email: "customer@solestreet.com",
    displayName: "Demo Customer",
    role: "customer",
    addresses: [],
    createdAt: "2026-03-01T12:00:00Z",
    isDisabled: false,
  },
];

export function adminGetCustomers(): UserProfile[] {
  if (typeof window === "undefined") return DEFAULT_CUSTOMERS;
  try {
    const raw = localStorage.getItem(KEYS.users);
    if (!raw) {
      const map: Record<string, UserProfile> = {};
      DEFAULT_CUSTOMERS.forEach((c) => {
        map[c.email.toLowerCase()] = c;
      });
      localStorage.setItem(KEYS.users, JSON.stringify(map));
      return DEFAULT_CUSTOMERS;
    }
    const usersMap: Record<string, UserProfile> = JSON.parse(raw);
    const customers = Object.values(usersMap).filter((u) => u.role === "customer");
    if (customers.length === 0) {
      DEFAULT_CUSTOMERS.forEach((c) => {
        usersMap[c.email.toLowerCase()] = c;
      });
      localStorage.setItem(KEYS.users, JSON.stringify(usersMap));
      return DEFAULT_CUSTOMERS;
    }
    return customers;
  } catch {
    return DEFAULT_CUSTOMERS;
  }
}

export function adminCreateCustomer(data: {
  email: string;
  displayName: string;
}): UserProfile {
  const newCustomer: UserProfile = {
    uid: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    email: data.email.toLowerCase(),
    displayName: data.displayName,
    role: "customer",
    addresses: [],
    isDisabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(KEYS.users);
      const usersMap: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
      usersMap[newCustomer.email] = newCustomer;
      localStorage.setItem(KEYS.users, JSON.stringify(usersMap));
    } catch {
      // ignore
    }
  }

  return newCustomer;
}

/** Creates an admin in the local development fallback. Production admin creation
 * is performed by /api/admin/admins using Firebase Admin SDK. */
export async function adminCreateAdmin(data: {
  email: string;
  displayName: string;
  password: string;
}, actorUid: string, actorEmail: string): Promise<UserProfile> {
  if (!actorUid) throw new Error("Authentication required.");
  if (actorEmail.trim().toLowerCase() !== SUPER_ADMIN_EMAIL) {
    throw new Error("Only the primary administrator can create admin accounts.");
  }
  const passwordBytes = new TextEncoder().encode(data.password);
  const digest = await crypto.subtle.digest("SHA-256", passwordBytes);
  const passwordHash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  const email = data.email.trim().toLowerCase();
  const admin: UserProfile = {
    uid: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email,
    displayName: data.displayName.trim(),
    role: "admin",
    addresses: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    passwordHash,
  };
  if (typeof window === "undefined") return admin;
  const raw = localStorage.getItem(KEYS.users);
  const usersMap: Record<string, UserProfile> = raw ? JSON.parse(raw) : {};
  if (usersMap[email]) throw new Error("An account with this email already exists.");
  usersMap[email] = admin;
  localStorage.setItem(KEYS.users, JSON.stringify(usersMap));
  return admin;
}

export function adminUpdateCustomer(
  uid: string,
  data: Partial<UserProfile>
): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEYS.users);
    if (!raw) return null;
    const usersMap: Record<string, UserProfile> = JSON.parse(raw);
    const key = Object.keys(usersMap).find((k) => usersMap[k].uid === uid);
    if (!key) return null;
    usersMap[key] = {
      ...usersMap[key],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.users, JSON.stringify(usersMap));
    return usersMap[key];
  } catch {
    return null;
  }
}

export function adminDeleteCustomer(uid: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(KEYS.users);
    if (!raw) return false;
    const usersMap: Record<string, UserProfile> = JSON.parse(raw);
    const key = Object.keys(usersMap).find((k) => usersMap[k].uid === uid);
    if (!key) return false;
    delete usersMap[key];
    localStorage.setItem(KEYS.users, JSON.stringify(usersMap));
    return true;
  } catch {
    return false;
  }
}

export function adminToggleCustomerStatus(uid: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEYS.users);
    if (!raw) return null;
    const usersMap: Record<string, UserProfile> = JSON.parse(raw);
    const key = Object.keys(usersMap).find((k) => usersMap[k].uid === uid);
    if (!key) return null;
    usersMap[key] = {
      ...usersMap[key],
      isDisabled: !usersMap[key].isDisabled,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.users, JSON.stringify(usersMap));
    return usersMap[key];
  } catch {
    return null;
  }
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export function adminGetCoupons(): Coupon[] {
  const stored = getStore<Coupon>(KEYS.coupons);
  return stored.length > 0 ? stored : [...INITIAL_COUPONS];
}

export function adminCreateCoupon(
  data: Omit<Coupon, "id" | "usageCount">
): Coupon {
  const coupon: Coupon = {
    ...data,
    id: `coupon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    usageCount: 0,
  };
  const coupons = adminGetCoupons();
  coupons.unshift(coupon);
  setStore(KEYS.coupons, coupons);
  return coupon;
}

export function adminUpdateCoupon(
  id: string,
  data: Partial<Coupon>
): Coupon | null {
  const coupons = adminGetCoupons();
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  coupons[idx] = { ...coupons[idx], ...data };
  setStore(KEYS.coupons, coupons);
  return coupons[idx];
}

export function adminDeleteCoupon(id: string): boolean {
  const coupons = adminGetCoupons();
  const filtered = coupons.filter((c) => c.id !== id);
  if (filtered.length === coupons.length) return false;
  setStore(KEYS.coupons, filtered);
  return true;
}

// ─── Reviews ────────────────────────────────────────────────────────────────

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "rev_1",
    productId: "1",
    userId: "usr_101",
    userName: "Devon Carter",
    rating: 5,
    title: "Unmatched cushioning for daily sprints",
    comment:
      "Landed these on launch day. The impact protection is exceptional and zero heel slipping on quick cuts. Truly elite craftsmanship and comfort.",
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: "2026-09-28T16:30:00Z",
  },
  {
    id: "rev_2",
    productId: "2",
    userId: "usr_102",
    userName: "Sophia Lin",
    rating: 2,
    title: "Runs half size smaller than expected",
    comment:
      "Love the colorway and materials, but the toe box is unusually narrow. I recommend going up a half size. Might need to exchange for a 9.5.",
    isVerifiedPurchase: true,
    status: "pending",
    createdAt: "2026-10-01T11:15:00Z",
  },
  {
    id: "rev_3",
    productId: "3",
    userId: "usr_103",
    userName: "Jordan Reed",
    rating: 1,
    title: "Suspicious discount link spam",
    comment:
      "Visit my sketchysite discount portal for 90% off stolen coupons telegram @sketchy-deals-bot!",
    isVerifiedPurchase: false,
    status: "pending",
    createdAt: "2026-10-02T08:45:00Z",
  },
  {
    id: "rev_4",
    productId: "4",
    userId: "usr_104",
    userName: "Elena Rostova",
    rating: 5,
    title: "Masterpiece in hand. Vault authentication was instant.",
    comment:
      "The leather quality and suede finish are top tier. Arrived double-boxed in mint condition with SoleStreet verified tags.",
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: "2026-10-02T19:20:00Z",
  },
  {
    id: "rev_5",
    productId: "1",
    userId: "usr_105",
    userName: "Chris Miller",
    rating: 3,
    title: "Good silhouette, laces feel a bit stiff",
    comment:
      "Overall nice pair for casual weekend rotation, but the stock laces are somewhat rigid. Swapped them with flat waxed laces.",
    isVerifiedPurchase: true,
    status: "hidden",
    createdAt: "2026-09-25T14:10:00Z",
  },
];

export function adminGetReviews(): Review[] {
  const stored = getStore<Review>(KEYS.reviews);
  if (stored.length > 0) return stored;
  setStore(KEYS.reviews, DEFAULT_REVIEWS);
  return [...DEFAULT_REVIEWS];
}

export function adminUpdateReviewStatus(
  id: string,
  status: ReviewStatus
): Review | null {
  const reviews = adminGetReviews();
  const idx = reviews.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  reviews[idx] = { ...reviews[idx], status, updatedAt: new Date().toISOString() };
  setStore(KEYS.reviews, reviews);
  return reviews[idx];
}

export function adminDeleteReview(id: string): boolean {
  const reviews = adminGetReviews();
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) return false;
  setStore(KEYS.reviews, filtered);
  return true;
}

// ─── Stats ──────────────────────────────────────────────────────────────────

export function adminGetStats(): AdminStats {
  const orders = adminGetOrders();
  const products = adminGetProducts();
  const customers = adminGetCustomers();

  const totalSales = orders
    .filter((o) => o.paymentStatus === "succeeded")
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockProducts = products.filter((p) =>
    p.sizes.some((s) => s.stock <= 5)
  ).length;

  const pendingOrders = orders.filter(
    (o) => o.fulfillmentStatus === "unfulfilled" || o.fulfillmentStatus === "processing"
  ).length;

  return {
    totalSales: Math.round(totalSales * 100) / 100,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    totalProducts: products.length,
    lowStockProducts,
    pendingOrders,
    averageOrderValue:
      orders.length > 0
        ? Math.round((totalSales / orders.length) * 100) / 100
        : 0,
  };
}

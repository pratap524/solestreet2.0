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
  return stored.length > 0 ? stored : [...localProducts];
}

export function adminCreateProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Product {
  const product: Product = {
    ...data,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const products = adminGetProducts();
  products.unshift(product);
  setStore(KEYS.products, products);
  return product;
}

export function adminUpdateProduct(
  id: string,
  data: Partial<Product>
): Product | null {
  const products = adminGetProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  products[idx] = { ...products[idx], ...data, updatedAt: new Date().toISOString() };
  setStore(KEYS.products, products);
  return products[idx];
}

export function adminDeleteProduct(id: string): boolean {
  const products = adminGetProducts();
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

export function adminGetReviews(): Review[] {
  return getStore<Review>(KEYS.reviews);
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

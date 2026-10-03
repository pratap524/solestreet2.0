import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  runTransaction,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./client";
import { products as localProducts } from "@/data/products";
import { INITIAL_COUPONS } from "@/lib/constants";
import type {
  Product,
  ProductFilters,
  SortOption,
  Order,
  OrderItem,
  Review,
  Wishlist,
  Coupon,
  ShoeSize,
} from "@/types";

const LOCAL_STORAGE_ORDERS_KEY = "solestreet_orders";
const LOCAL_STORAGE_REVIEWS_KEY = "solestreet_reviews";
const LOCAL_STORAGE_WISHLIST_KEY = "solestreet_wishlist";

function getLocalOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
}

function getLocalReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReviews(reviews: Review[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
  } catch {
    // ignore
  }
}

function getLocalWishlist(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalWishlist(wishlists: Record<string, string[]>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, JSON.stringify(wishlists));
  } catch {
    // ignore
  }
}

// ─── Products Data Access ───────────────────────────────────────────────────

export async function getProducts(
  filters?: ProductFilters,
  sort?: SortOption
): Promise<Product[]> {
  if (!isFirebaseConfigured()) {
    // Return filtered local products
    let result = [...localProducts];

    if (filters?.category) {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters?.gender) {
      result = result.filter(
        (p) => p.gender === filters.gender || p.gender === "unisex"
      );
    }
    if (filters?.brand) {
      result = result.filter(
        (p) => p.brand.toLowerCase() === filters.brand?.toLowerCase()
      );
    }
    if (filters?.minPrice !== undefined) {
      result = result.filter((p) => p.price >= (filters.minPrice ?? 0));
    }
    if (filters?.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= (filters.maxPrice ?? Infinity));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sort) {
      switch (sort) {
        case "newest":
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case "price-asc":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          result.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          result.sort((a, b) => b.rating - a.rating);
          break;
        case "bestselling":
          result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
          break;
        case "name-asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
      }
    }

    return result;
  }

  try {
    const productsRef = collection(db, "products");
    const snap = await getDocs(productsRef);

    if (snap.empty) {
      // Auto-seed if empty
      await seedFirestoreProducts();
      return getProducts(filters, sort);
    }

    let products: Product[] = [];
    snap.forEach((d) => products.push({ id: d.id, ...(d.data() as Omit<Product, "id">) }));

    if (filters?.category) {
      products = products.filter((p) => p.category === filters.category);
    }
    if (filters?.gender) {
      products = products.filter(
        (p) => p.gender === filters.gender || p.gender === "unisex"
      );
    }
    if (filters?.brand) {
      products = products.filter(
        (p) => p.brand.toLowerCase() === filters.brand?.toLowerCase()
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return products;
  } catch (err) {
    console.error("Firestore getProducts error, falling back to local data:", err);
    return localProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isFirebaseConfigured()) {
    return localProducts.find((p) => p.slug === slug) || null;
  }

  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      return localProducts.find((p) => p.slug === slug) || null;
    }

    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...(docSnap.data() as Omit<Product, "id">) };
  } catch (err) {
    console.error("Firestore getProductBySlug error:", err);
    return localProducts.find((p) => p.slug === slug) || null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isFirebaseConfigured()) {
    return localProducts.find((p) => p.id === id) || null;
  }

  try {
    const snap = await getDoc(doc(db, "products", id));
    if (!snap.exists()) {
      return localProducts.find((p) => p.id === id) || null;
    }
    return { id: snap.id, ...(snap.data() as Omit<Product, "id">) };
  } catch (err) {
    console.error("Firestore getProductById error:", err);
    return localProducts.find((p) => p.id === id) || null;
  }
}

// ─── Inventory Management ───────────────────────────────────────────────────

export async function checkInventory(
  items: { productId: string; size: ShoeSize; quantity: number }[]
): Promise<{ valid: boolean; message?: string; unavailableItem?: string }> {
  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product) {
      return { valid: false, message: `Product not found` };
    }
    const sizeStock = product.sizes.find((s) => s.size === item.size);
    if (!sizeStock || sizeStock.stock < item.quantity) {
      return {
        valid: false,
        message: `Only ${sizeStock ? sizeStock.stock : 0} left in size ${item.size} for ${product.name}`,
        unavailableItem: product.name,
      };
    }
  }
  return { valid: true };
}

export async function decrementInventory(items: OrderItem[]): Promise<void> {
  if (!isFirebaseConfigured()) return;

  try {
    for (const item of items) {
      const prodRef = doc(db, "products", item.productId);
      await runTransaction(db, async (transaction) => {
        const prodDoc = await transaction.get(prodRef);
        if (!prodDoc.exists()) return;
        const data = prodDoc.data() as Product;
        const updatedSizes = data.sizes.map((s) => {
          if (s.size === item.size) {
            return { ...s, stock: Math.max(0, s.stock - item.quantity) };
          }
          return s;
        });
        transaction.update(prodRef, { sizes: updatedSizes });
      });
    }
  } catch (err) {
    console.error("Error decrementing inventory:", err);
  }
}

// ─── Orders Data Access ─────────────────────────────────────────────────────

export async function createOrderInDb(
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<Order> {
  const orderId = "order_" + Math.random().toString(36).substring(2, 9).toUpperCase();
  const newOrder: Order = {
    ...orderData,
    id: orderId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured()) {
    const orders = getLocalOrders();
    orders.unshift(newOrder);
    saveLocalOrders(orders);
    return newOrder;
  }

  try {
    await setDoc(doc(db, "orders", orderId), newOrder);
    await decrementInventory(newOrder.items);
    return newOrder;
  } catch (err) {
    console.error("Error creating order in Firestore, saving locally:", err);
    const orders = getLocalOrders();
    orders.unshift(newOrder);
    saveLocalOrders(orders);
    return newOrder;
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!isFirebaseConfigured()) {
    const orders = getLocalOrders();
    return orders.filter((o) => o.userId === userId);
  }

  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const orders: Order[] = [];
    snap.forEach((d) => orders.push({ id: d.id, ...(d.data() as Omit<Order, "id">) }));
    return orders;
  } catch (err) {
    console.error("Error fetching user orders from Firestore:", err);
    const orders = getLocalOrders();
    return orders.filter((o) => o.userId === userId);
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!isFirebaseConfigured()) {
    const orders = getLocalOrders();
    return orders.find((o) => o.id === orderId) || null;
  }

  try {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) {
      const orders = getLocalOrders();
      return orders.find((o) => o.id === orderId) || null;
    }
    return { id: snap.id, ...(snap.data() as Omit<Order, "id">) };
  } catch (err) {
    console.error("Error fetching order by ID:", err);
    const orders = getLocalOrders();
    return orders.find((o) => o.id === orderId) || null;
  }
}

// ─── Reviews Data Access ────────────────────────────────────────────────────

export async function getProductReviews(productId: string): Promise<Review[]> {
  const local = getLocalReviews().filter((r) => r.productId === productId);
  if (local.length > 0) return local;

  // Default mock reviews for high quality experience
  return [
    {
      id: "rev_1",
      productId,
      userId: "user_demo_1",
      userName: "Alex Morgan",
      rating: 5,
      title: "Best running shoes I've ever owned!",
      comment:
        "The cushioning is phenomenal. I logged 50 miles in my first two weeks with zero blisters. True to size and super responsive.",
      isVerifiedPurchase: true,
      status: "approved",
      createdAt: "2026-09-10T14:20:00Z",
    },
    {
      id: "rev_2",
      productId,
      userId: "user_demo_2",
      userName: "Marcus Vance",
      rating: 4,
      title: "Great comfort, stylish look",
      comment:
        "Very lightweight and breathable. Perfect for both training runs and all-day casual wear. Clean aesthetic.",
      isVerifiedPurchase: true,
      status: "approved",
      createdAt: "2026-09-15T09:45:00Z",
    },
  ];
}

export async function addProductReview(
  reviewData: Omit<Review, "id" | "createdAt">
): Promise<Review> {
  const newReview: Review = {
    ...reviewData,
    id: "rev_" + Math.random().toString(36).substring(2, 9),
    createdAt: new Date().toISOString(),
  };

  const reviews = getLocalReviews();
  reviews.unshift(newReview);
  saveLocalReviews(reviews);

  if (isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, "reviews", newReview.id), newReview);
    } catch (err) {
      console.error("Error saving review to Firestore:", err);
    }
  }

  return newReview;
}

// ─── Wishlist Data Access ───────────────────────────────────────────────────

export async function getUserWishlist(userId: string): Promise<string[]> {
  if (!isFirebaseConfigured()) {
    const list = getLocalWishlist();
    return list[userId] || [];
  }

  try {
    const snap = await getDoc(doc(db, "wishlists", userId));
    if (!snap.exists()) return [];
    return (snap.data() as Wishlist).productIds || [];
  } catch {
    const list = getLocalWishlist();
    return list[userId] || [];
  }
}

export async function toggleWishlistInDb(
  userId: string,
  productId: string
): Promise<string[]> {
  const list = getLocalWishlist();
  const current = list[userId] || [];
  const exists = current.includes(productId);
  const updated = exists
    ? current.filter((id) => id !== productId)
    : [...current, productId];

  list[userId] = updated;
  saveLocalWishlist(list);

  if (isFirebaseConfigured()) {
    try {
      await setDoc(doc(db, "wishlists", userId), {
        userId,
        productIds: updated,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error updating wishlist in Firestore:", err);
    }
  }

  return updated;
}

// ─── Coupon Validation ──────────────────────────────────────────────────────

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; coupon?: Coupon; discountAmount: number; message?: string }> {
  const upper = code.trim().toUpperCase();
  const coupon = INITIAL_COUPONS.find(
    (c) => c.code === upper && c.isActive
  );

  if (!coupon) {
    return { valid: false, discountAmount: 0, message: "Invalid promo code" };
  }

  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum spend of ₹${coupon.minSpend} required for this coupon`,
    };
  }

  let discount = 0;
  if (coupon.discountPercent) {
    discount = (subtotal * coupon.discountPercent) / 100;
  } else if (coupon.discountAmount) {
    discount = Math.min(subtotal, coupon.discountAmount);
  }

  return { valid: true, coupon, discountAmount: Math.round(discount * 100) / 100 };
}

// ─── Seeding Utility ────────────────────────────────────────────────────────

export async function seedFirestoreProducts(): Promise<void> {
  if (!isFirebaseConfigured()) return;

  try {
    for (const prod of localProducts) {
      await setDoc(doc(db, "products", prod.id), prod);
    }
    console.log("Successfully seeded Firestore products!");
  } catch (err) {
    console.error("Failed to seed Firestore products:", err);
  }
}

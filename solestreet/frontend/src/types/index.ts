// ─── Product Types ───────────────────────────────────────────────────────────

export type ShoeCategory =
  | "running"
  | "casual"
  | "basketball"
  | "skateboarding"
  | "hiking"
  | "training";

export type ShoeGender = "men" | "women" | "unisex";

export type ShoeSize =
  | 6
  | 6.5
  | 7
  | 7.5
  | 8
  | 8.5
  | 9
  | 9.5
  | 10
  | 10.5
  | 11
  | 11.5
  | 12
  | 13
  | 14;

export interface ShoeColor {
  name: string;
  hex: string;
}

export interface SizeStock {
  size: ShoeSize;
  stock: number;
}

export interface ProductImage {
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  longDescription: string;
  price: number;
  compareAtPrice?: number;
  category: ShoeCategory;
  gender: ShoeGender;
  colors: ShoeColor[];
  selectedColor: string;
  sizes: SizeStock[];
  images: ProductImage[];
  features: string[];
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestseller: boolean;
  createdAt: string;
  updatedAt?: string;
  /** UID of the admin who created this product. Required for product ownership checks. */
  createdBy?: string;
}

// ─── Category Types ──────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  productCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ─── Cart Types ──────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  slug: string;
  price: number;
  image: string;
  color: string;
  size: ShoeSize;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  couponCode?: string;
}

// ─── Filter Types ────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: ShoeCategory;
  gender?: ShoeGender;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: ShoeSize[];
  sort?: SortOption;
  search?: string;
}

export type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "bestselling"
  | "name-asc";

// ─── User & Address Types ────────────────────────────────────────────────────

export interface Address {
  id: string;
  fullName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  role: "customer" | "admin";
  isDisabled?: boolean;
  addresses: Address[];
  createdAt: string;
  updatedAt?: string;
  /** Only used by the local development fallback; Firebase never stores plaintext passwords. */
  passwordHash?: string;
}

// ─── Order Types ─────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderCustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  description: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  slug: string;
  price: number;
  image: string;
  color: string;
  size: ShoeSize;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customer: OrderCustomerInfo;
  shippingAddress: Address;
  billingAddress: Address;
  items: OrderItem[];
  shippingMethod: ShippingMethod;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  stripePaymentIntentId?: string;
  stripeCheckoutSessionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Review Types ────────────────────────────────────────────────────────────

export type ReviewStatus = "pending" | "approved" | "hidden" | "deleted";

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  orderId?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Wishlist Types ──────────────────────────────────────────────────────────

export interface Wishlist {
  userId: string;
  productIds: string[];
  updatedAt: string;
}

// ─── Coupon Types ────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  minSpend?: number;
  expiresAt: string;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  userId: string;
  userName: string;
  details?: string;
  timestamp: string;
}

// ─── UI Types ────────────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface HeroBanner {
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
}

// ─── Pagination Types ────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

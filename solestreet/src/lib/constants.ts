import type { NavLink, ShippingMethod, Coupon } from "@/types";

export const SITE_NAME = "SoleStreet";
export const SITE_DESCRIPTION =
  "Premium footwear for every step. Discover the latest styles in running, casual, basketball, and outdoor shoes.";
export const SITE_URL = "https://solestreet.com";

export const FREE_SHIPPING_THRESHOLD = 150;
export const STANDARD_SHIPPING_FEE = 10;
export const TAX_RATE = 0.08; // 8% standard tax rate

export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Ground Delivery",
    price: 10,
    estimatedDays: "3-5 business days",
    description: "Free on orders over $150. Reliable door-to-door ground shipping.",
  },
  {
    id: "express",
    name: "Express Air Priority",
    price: 25,
    estimatedDays: "1-2 business days",
    description: "Fastest air shipping with guaranteed priority handling.",
  },
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: "coupon_welcome10",
    code: "WELCOME10",
    discountPercent: 10,
    expiresAt: "2027-12-31T23:59:59Z",
    isActive: true,
    usageCount: 0,
  },
  {
    id: "coupon_sole20",
    code: "SOLE20",
    discountPercent: 20,
    minSpend: 100,
    expiresAt: "2027-12-31T23:59:59Z",
    isActive: true,
    usageCount: 0,
  },
  {
    id: "coupon_vip50",
    code: "VIP50",
    discountAmount: 50,
    minSpend: 200,
    expiresAt: "2027-12-31T23:59:59Z",
    isActive: true,
    usageCount: 0,
  },
];

export const NAV_LINKS: NavLink[] = [
  { label: "New Arrivals", href: "/shop?sort=newest" },
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  {
    label: "Categories",
    href: "/shop",
    children: [
      { label: "Running", href: "/shop?category=running" },
      { label: "Casual & Lifestyle", href: "/shop?category=casual" },
      { label: "Basketball", href: "/shop?category=basketball" },
      { label: "Skateboarding", href: "/shop?category=skateboarding" },
      { label: "Hiking & Outdoor", href: "/shop?category=hiking" },
      { label: "Training & Gym", href: "/shop?category=training" },
    ],
  },
  { label: "Bestsellers", href: "/shop?sort=bestselling" },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "New Arrivals", href: "/shop?sort=newest" },
    { label: "Bestsellers", href: "/shop?sort=bestselling" },
    { label: "Running", href: "/shop?category=running" },
    { label: "Casual", href: "/shop?category=casual" },
    { label: "Basketball", href: "/shop?category=basketball" },
    { label: "Sale", href: "/shop?sort=price-asc" },
  ],
  support: [
    { label: "Contact Us", href: "#" },
    { label: "Shipping & Returns", href: "#" },
    { label: "Size Guide", href: "#" },
    { label: "FAQ", href: "#" },
    { label: "Order Tracking", href: "/account/orders" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Sustainability", href: "#" },
    { label: "Affiliate Program", href: "#" },
  ],
};

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com/solestreet",
  twitter: "https://twitter.com/solestreet",
  facebook: "https://facebook.com/solestreet",
  tiktok: "https://tiktok.com/@solestreet",
};

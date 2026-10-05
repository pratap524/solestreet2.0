import { Coupon } from "../types/index.js";

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

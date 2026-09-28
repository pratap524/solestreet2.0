import { describe, it, expect } from "vitest";

function calculateCouponDiscount(
  subtotal: number,
  coupon: { discountPercent?: number; discountAmount?: number; minSpend?: number }
): number {
  if (coupon.minSpend && subtotal < coupon.minSpend) {
    return 0;
  }
  if (coupon.discountPercent) {
    return (subtotal * coupon.discountPercent) / 100;
  }
  if (coupon.discountAmount) {
    return Math.min(subtotal, coupon.discountAmount);
  }
  return 0;
}

describe("Coupon Discount Calculations", () => {
  it("should apply percentage discount correctly", () => {
    const discount = calculateCouponDiscount(200, { discountPercent: 15 });
    expect(discount).toBe(30);
  });

  it("should apply fixed dollar discount correctly", () => {
    const discount = calculateCouponDiscount(150, { discountAmount: 25 });
    expect(discount).toBe(25);
  });

  it("should enforce minimum spend limit", () => {
    const discount = calculateCouponDiscount(80, { discountPercent: 20, minSpend: 100 });
    expect(discount).toBe(0);
  });

  it("should not allow fixed discount to exceed subtotal", () => {
    const discount = calculateCouponDiscount(30, { discountAmount: 50 });
    expect(discount).toBe(30);
  });
});

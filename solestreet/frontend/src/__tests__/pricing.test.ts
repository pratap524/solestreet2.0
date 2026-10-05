import { describe, it, expect } from "vitest";
import { validateCoupon } from "@/lib/firebase/firestore";
import {
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from "@/lib/constants";

describe("Pricing and Tax Calculations", () => {
  it("calculates standard tax correctly (8%)", () => {
    const subtotal = 100;
    const tax = subtotal * TAX_RATE;
    expect(tax).toBe(8);
  });

  it("applies free shipping when subtotal exceeds threshold", () => {
    const subtotal1 = 120;
    const isFree1 = subtotal1 >= FREE_SHIPPING_THRESHOLD;
    expect(isFree1).toBe(false);

    const subtotal2 = 160;
    const isFree2 = subtotal2 >= FREE_SHIPPING_THRESHOLD;
    expect(isFree2).toBe(true);
  });

  it("validates 20% discount coupon (SOLE20)", async () => {
    const res = await validateCoupon("SOLE20", 150);
    expect(res.valid).toBe(true);
    expect(res.discountAmount).toBe(30); // 20% of 150 = 30
  });

  it("rejects coupon when minimum spend is not met", async () => {
    const res = await validateCoupon("SOLE20", 50); // min spend is 100
    expect(res.valid).toBe(false);
    expect(res.discountAmount).toBe(0);
  });

  it("rejects unknown coupon code", async () => {
    const res = await validateCoupon("INVALIDCODE123", 200);
    expect(res.valid).toBe(false);
  });
});

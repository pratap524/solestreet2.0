import { describe, it, expect } from "vitest";
import { checkInventory } from "@/lib/firebase/firestore";

describe("Inventory Stock Validation", () => {
  it("validates requested stock against available inventory", async () => {
    // Airflow Pro Runner (id: 1) has default size 10 stock = 18
    const check = await checkInventory([
      { productId: "1", size: 10, quantity: 2 },
    ]);
    expect(check.valid).toBe(true);
  });

  it("fails when requested quantity exceeds available stock", async () => {
    // Size 13 stock is only 4
    const check = await checkInventory([
      { productId: "1", size: 13, quantity: 100 },
    ]);
    expect(check.valid).toBe(false);
    expect(check.message).toContain("left in size");
  });
});

import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { addressSchema } from "@/lib/validations/checkout";
import { reviewSchema } from "@/lib/validations/review";

describe("Zod Validation Schemas", () => {
  describe("Login Schema", () => {
    it("accepts valid email and password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Register Schema", () => {
    it("accepts valid registration data", () => {
      const result = registerSchema.safeParse({
        name: "Alex Morgan",
        email: "alex@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      });
      expect(result.success).toBe(true);
    });

    it("rejects password mismatch", () => {
      const result = registerSchema.safeParse({
        name: "Alex Morgan",
        email: "alex@example.com",
        password: "Password123!",
        confirmPassword: "Password999!",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Address Schema", () => {
    it("accepts complete valid address", () => {
      const result = addressSchema.safeParse({
        fullName: "Marcus Vance",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        phone: "+1 555-0199",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing postal code", () => {
      const result = addressSchema.safeParse({
        fullName: "Marcus Vance",
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "",
        country: "United States",
        phone: "+1 555-0199",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("Review Schema", () => {
    it("validates ratings between 1 and 5", () => {
      const valid = reviewSchema.safeParse({
        rating: 5,
        title: "Incredible fit",
        comment: "These shoes fit like a glove and the foam is super plush.",
      });
      expect(valid.success).toBe(true);

      const invalidRating = reviewSchema.safeParse({
        rating: 6,
        title: "Incredible fit",
        comment: "These shoes fit like a glove and the foam is super plush.",
      });
      expect(invalidRating.success).toBe(false);
    });
  });
});

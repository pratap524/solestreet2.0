import { describe, it, expect } from "vitest";

interface User {
  uid: string;
  email: string;
  role: "admin" | "customer";
  isDisabled?: boolean;
}

function canAccessAdminRoute(user: User | null): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: "Authentication required" };
  }
  if (user.isDisabled) {
    return { allowed: false, reason: "Account is disabled" };
  }
  if (user.role !== "admin") {
    return { allowed: false, reason: "Admin role required" };
  }
  return { allowed: true };
}

describe("Admin Access Control Logic", () => {
  it("should deny unauthenticated users", () => {
    const access = canAccessAdminRoute(null);
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe("Authentication required");
  });

  it("should deny customer role users", () => {
    const customer: User = { uid: "1", email: "user@test.com", role: "customer" };
    const access = canAccessAdminRoute(customer);
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe("Admin role required");
  });

  it("should deny disabled admin users", () => {
    const disabledAdmin: User = { uid: "2", email: "admin@test.com", role: "admin", isDisabled: true };
    const access = canAccessAdminRoute(disabledAdmin);
    expect(access.allowed).toBe(false);
    expect(access.reason).toBe("Account is disabled");
  });

  it("should grant access to active admin users", () => {
    const activeAdmin: User = { uid: "3", email: "admin@solestreet.com", role: "admin" };
    const access = canAccessAdminRoute(activeAdmin);
    expect(access.allowed).toBe(true);
  });
});

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Strict Edge Authentication Middleware
 * Enforces role-based access control for administrative areas.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes strictly
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const roleCookie = request.cookies.get("solestreet_role")?.value;

    // Deny access if not explicitly verified as admin
    if (roleCookie !== "admin") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("unauthorized", "true");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

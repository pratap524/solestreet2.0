"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ShoppingBag,
  Search,
  Menu,
  ChevronDown,
  User,
  Heart,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SearchDialog } from "@/components/search/search-dialog";
import { SITE_NAME, NAV_LINKS } from "@/lib/constants";

function isNavActive(href: string, pathname: string, searchParams: URLSearchParams): boolean {
  const url = new URL(href, "http://localhost");
  if (url.pathname !== pathname) return false;
  // If the link has query params, all of them must match
  const linkParams = url.searchParams;
  if ([...linkParams].length === 0) {
    // Bare path like "/shop" — only active if no relevant nav params in current URL
    return [...searchParams].length === 0;
  }
  for (const [key, value] of linkParams) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { user } = useAuth();
  const { count: wishlistCount } = useWishlist();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 transition-all">
        {/* Top banner */}
        <div className="bg-zinc-900 text-zinc-100 text-xs py-2 px-4 text-center font-medium tracking-wide">
          <span className="opacity-90">
            🔥 Free standard shipping on all orders over $150 • Use code{" "}
            <span className="font-bold text-amber-400">SOLE20</span> for 20% off
          </span>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-zinc-700"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 overflow-y-auto">
                <SheetHeader className="p-6 border-b border-zinc-100">
                  <SheetTitle className="text-xl font-black tracking-tight">
                    {SITE_NAME}
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-6 space-y-4">
                  {NAV_LINKS.map((link) => (
                    <div key={link.label}>
                      <Link
                        href={link.href}
                        className={`block px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                          isNavActive(link.href, pathname, searchParams)
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-700 hover:bg-zinc-100"
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                      {link.children && (
                        <div className="ml-4 mt-1 space-y-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="block px-4 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4 border-t border-zinc-100 space-y-1">
                    <Link
                      href="/account?tab=wishlist"
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Wishlist
                      </span>
                      {mounted && wishlistCount > 0 && (
                        <Badge className="bg-zinc-950 text-white text-xs px-2 py-0.5 rounded-full">
                          {wishlistCount}
                        </Badge>
                      )}
                    </Link>
                    {mounted && user?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-purple-600" />
                          Admin Panel
                        </span>
                        <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5">Admin</Badge>
                      </Link>
                    )}
                    <Link
                      href={mounted && user ? "/account" : "/login"}
                      className="block px-4 py-3 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
                      onClick={() => setMobileOpen(false)}
                    >
                      {mounted && user ? `Account (${user.displayName || user.email})` : "Sign In / Register"}
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link
              href="/"
              className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 hover:text-zinc-700 transition-colors"
            >
              <span className="hidden sm:inline">{SITE_NAME}</span>
              <span className="sm:hidden">SS</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.children && setHoveredNav(link.label)
                  }
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  <Link
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1 ${
                      isNavActive(link.href, pathname, searchParams)
                        ? "bg-zinc-900 text-white"
                        : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                    }`}
                  >
                    {link.label}
                    {link.children && (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </Link>

                  {/* Dropdown mega-menu */}
                  <AnimatePresence>
                    {hoveredNav === link.label && link.children && (
                      <div className="absolute top-full left-0 w-56 pt-1">
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-2 z-50"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              className="block px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search products"
                onClick={() => setSearchOpen(true)}
                className="text-zinc-600 hover:text-zinc-900"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Wishlist"
                className="hidden sm:flex text-zinc-600 hover:text-zinc-900 relative"
              >
                <Link href="/account?tab=wishlist">
                  <Heart className="h-5 w-5" />
                  {mounted && wishlistCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] font-bold bg-zinc-900 text-white hover:bg-zinc-900">
                      {wishlistCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {mounted && user?.role === "admin" && (
                <Button
                  asChild
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-8 px-2.5 sm:px-3 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Link href="/admin">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                </Button>
              )}

              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Account"
                className="hidden sm:flex text-zinc-600 hover:text-zinc-900 relative"
              >
                <Link href={mounted && user ? "/account" : "/login"}>
                  {mounted && user ? (
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center">
                      {user.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                aria-label="Shopping bag"
                className="relative text-zinc-600 hover:text-zinc-900"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-5 w-5" />
                {mounted && itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-zinc-900 text-white hover:bg-zinc-900 border-2 border-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart sheet */}
      <CartSheet />

      {/* Search dialog */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

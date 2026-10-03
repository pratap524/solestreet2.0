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
  Sparkles,
  Command,
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
  try {
    const url = new URL(href, "http://localhost");
    if (url.pathname !== pathname) return false;
    const linkParams = url.searchParams;
    if ([...linkParams].length === 0) {
      return [...searchParams].length === 0;
    }
    for (const [key, value] of linkParams) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  } catch {
    return false;
  }
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 transition-all">
        {/* Top Announcement Banner */}
        <div className="bg-zinc-950 text-zinc-100 text-xs py-2 px-4 text-center font-semibold tracking-wide border-b border-zinc-800">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              Free complimentary shipping on orders over ₹150 • Use code{" "}
              <span className="font-extrabold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                SOLE20
              </span>{" "}
              for 20% off
            </span>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="bg-white/90 backdrop-blur-md border-b border-zinc-200/80 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
              {/* Left: Mobile Menu & Brand */}
              <div className="flex items-center gap-3">
                {/* Mobile Menu Trigger */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Open mobile navigation menu"
                      className="text-zinc-900 hover:bg-zinc-100 rounded-xl"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0 flex flex-col bg-white">
                    <SheetHeader className="p-6 border-b border-zinc-100 flex flex-row items-center justify-between">
                      <SheetTitle className="text-xl font-black tracking-tight text-zinc-950">
                        {SITE_NAME}
                      </SheetTitle>
                    </SheetHeader>

                    <nav className="p-5 flex-1 overflow-y-auto space-y-2">
                      {NAV_LINKS.map((link) => {
                        const active = isNavActive(link.href, pathname, searchParams);
                        return (
                          <div key={link.label} className="space-y-1">
                            <Link
                              href={link.href}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                                active
                                  ? "bg-zinc-950 text-white"
                                  : "text-zinc-800 hover:bg-zinc-100"
                              }`}
                              onClick={() => setMobileOpen(false)}
                            >
                              <span>{link.label}</span>
                            </Link>

                            {link.children && (
                              <div className="pl-4 space-y-1">
                                {link.children.map((child) => (
                                  <Link
                                    key={child.label}
                                    href={child.href}
                                    className="block px-3 py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-950 hover:bg-zinc-50 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {child.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Mobile Account & Quick Links */}
                      <div className="pt-4 mt-4 border-t border-zinc-100 space-y-1.5">
                        <Link
                          href="/account?tab=wishlist"
                          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-zinc-800 hover:bg-zinc-100"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="flex items-center gap-2.5">
                            <Heart className="h-4 w-4 text-zinc-600" />
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
                            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-600" />
                              Admin Portal
                            </span>
                            <Badge className="bg-purple-600 text-white text-[10px] px-2 py-0.5">Admin</Badge>
                          </Link>
                        )}

                        <Link
                          href={mounted && user ? "/account" : "/login"}
                          className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-zinc-800 hover:bg-zinc-100"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="flex items-center gap-2.5">
                            <User className="h-4 w-4 text-zinc-600" />
                            {mounted && user ? `My Account (${user.displayName || "User"})` : "Sign In / Register"}
                          </span>
                        </Link>
                      </div>
                    </nav>
                  </SheetContent>
                </Sheet>

                {/* Brand Logo */}
                <Link
                  href="/"
                  className="flex items-center gap-2 group"
                  aria-label="SoleStreet Home"
                >
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 group-hover:text-zinc-700 transition-colors uppercase">
                    {SITE_NAME}
                  </span>
                </Link>
              </div>

              {/* Center: Desktop Navigation Bar */}
              <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
                {NAV_LINKS.map((link) => {
                  const active = isNavActive(link.href, pathname, searchParams);
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => link.children && setHoveredNav(link.label)}
                      onMouseLeave={() => setHoveredNav(null)}
                    >
                      <Link
                        href={link.href}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all inline-flex items-center gap-1.5 ${
                          active
                            ? "bg-zinc-950 text-white shadow-xs"
                            : "text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100/80"
                        }`}
                      >
                        {link.label}
                        {link.children && (
                          <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform duration-200" />
                        )}
                      </Link>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {hoveredNav === link.label && link.children && (
                          <div className="absolute top-full left-0 w-60 pt-2 z-50">
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.15 }}
                              className="bg-white rounded-2xl shadow-xl border border-zinc-200/80 p-2 overflow-hidden"
                            >
                              {link.children.map((child) => (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  className="block px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>

              {/* Right: Actions (Search, Wishlist, Account, Cart) */}
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Search Trigger Button */}
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search sneakers and collections"
                  className="flex items-center gap-2.5 h-10 px-3 sm:px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-950 transition-colors border border-zinc-200/60 cursor-pointer"
                >
                  <Search className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-500 hidden md:inline">Search drops...</span>
                  <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-zinc-200 text-zinc-400">
                    <Command className="h-2.5 w-2.5" />K
                  </kbd>
                </button>

                {/* Wishlist Link */}
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label={`Wishlist (${mounted ? wishlistCount : 0} items)`}
                  className="text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl relative"
                >
                  <Link href="/wishlist">
                    <Heart className="h-5 w-5" />
                    {mounted && wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </Button>

                {/* Admin Access Indicator */}
                {mounted && user?.role === "admin" && (
                  <Button
                    asChild
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-9 px-3 text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Link href="/admin">
                      <Shield className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Admin</span>
                    </Link>
                  </Button>
                )}

                {/* Account Button */}
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label={mounted && user ? `Account of ${user.displayName || user.email}` : "Sign In to account"}
                  className="hidden sm:flex text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-xl"
                >
                  <Link href={mounted && user ? "/account" : "/login"}>
                    {mounted && user ? (
                      <div className="w-7 h-7 rounded-full bg-zinc-950 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                        {user.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Link>
                </Button>

                {/* Cart Bag Drawer Trigger */}
                <Button
                  variant="default"
                  aria-label={`Shopping bag (${mounted ? itemCount : 0} items)`}
                  className="relative bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl h-10 px-3.5 sm:px-4 text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
                  onClick={() => setCartOpen(true)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span className="hidden sm:inline">Bag</span>
                  {mounted && itemCount > 0 && (
                    <span className="h-5 min-w-5 px-1 rounded-full bg-white text-zinc-950 text-[11px] font-black flex items-center justify-center shadow-2xs">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over Cart Drawer */}
      <CartSheet />

      {/* Keyboard Shortcut Search Modal */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

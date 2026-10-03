"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Star,
  FolderTree,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Search,
  Bell,
  Plus,
  ExternalLink,
  Sparkles,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminGetOrders, adminGetProducts, adminGetCustomers } from "@/lib/admin-data";
import { SITE_NAME } from "@/lib/constants";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package, badgeKey: "products" },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, badgeKey: "orders" },
  { label: "Customers", href: "/admin/customers", icon: Users, badgeKey: "customers" },
  { label: "Coupons", href: "/admin/coupons", icon: Tag },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({ products: 0, orders: 0, customers: 0 });
  const [searchQuery, setSearchQuery] = useState("");

  const isLightAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    try {
      const p = adminGetProducts();
      const o = adminGetOrders();
      const c = adminGetCustomers();
      setCounts({
        products: p.length,
        orders: o.filter((ord) => ord.fulfillmentStatus === "unfulfilled" || ord.fulfillmentStatus === "processing").length,
        customers: c.length,
      });
    } catch {
      // fallback
    }
  }, [pathname]);

  // Redirect non-admin users immediately
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}&unauthorized=true`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
          <p className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">
            Verifying admin credentials...
          </p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
            Strict administrative security is enabled. You need an authorized administrator account to access the SoleStreet control panel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="outline" className="flex-1 rounded-xl border-zinc-700 text-zinc-300 hover:text-white">
              <Link href="/">Return to Store</Link>
            </Button>
            <Button asChild className="flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold">
              <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>Admin Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <nav className="flex flex-col h-full bg-[#0d0e11] text-zinc-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-800/80">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Shield className="h-5 w-5 text-zinc-950" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-black text-white tracking-tight truncate">
                {SITE_NAME}
              </p>
              <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 text-zinc-300 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Vault Operations
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          Management
        </p>

        {ADMIN_NAV.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          let countVal: number | null = null;
          if (item.badgeKey === "orders" && counts.orders > 0) countVal = counts.orders;
          if (item.badgeKey === "products" && counts.products > 0) countVal = counts.products;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-white text-zinc-950 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-zinc-950" : "text-zinc-400"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {countVal !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? "bg-zinc-900 text-white"
                        : item.badgeKey === "orders"
                        ? "bg-amber-500/20 text-amber-300 font-bold"
                        : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {countVal}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="h-3 w-3 opacity-60 shrink-0" />
                )}
              </div>
            </Link>
          );
        })}

        <div className="pt-5 mt-4 border-t border-zinc-800/80">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Storefront
          </p>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-all"
          >
            <span className="flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-zinc-400" />
              Live Customer Store
            </span>
            <span className="text-[10px] font-mono text-zinc-400">↗</span>
          </Link>
        </div>
      </div>

      {/* User Information & Session */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/60">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs font-bold flex items-center justify-center border border-zinc-600">
              {user.displayName?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-900" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {user.displayName || "Sole Administrator"}
            </p>
            <p className="text-[10px] text-zinc-400 truncate font-mono">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="flex-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 text-xs h-8 rounded-xl font-bold justify-start px-2"
          >
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Sign Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs h-8 rounded-xl font-bold border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
          >
            <Link href="/">Store</Link>
          </Button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className={`min-h-screen flex ${isLightAdmin ? "bg-[#f4f4f6] text-zinc-900" : "bg-zinc-950 text-white"}`}>
      {/* Desktop Sidebar (Charcoal / Dark) */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-800/90 flex-col fixed inset-y-0 left-0 z-30 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-3.5 right-3.5 z-10 text-zinc-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-800/90 transition-colors"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close admin navigation menu"
        >
          <X className="h-4 w-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Clean Admin Header */}
        <header
          className={`sticky top-0 z-20 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between border-b transition-colors ${
            isLightAdmin
              ? "bg-white/95 border-zinc-200/90 text-zinc-900 shadow-2xs"
              : "bg-zinc-900/95 border-zinc-800 text-white shadow-2xs"
          }`}
        >
          {/* Left: Mobile hamburger & breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden w-10 h-10 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isLightAdmin
                  ? "border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                  : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
              aria-label="Open admin navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400">
                <span>SoleStreet Admin</span>
                <span>/</span>
                <span className={isLightAdmin ? "text-zinc-900" : "text-zinc-200"}>
                  {pathname === "/admin"
                    ? "Overview Dashboard"
                    : pathname.replace("/admin/", "").replace(/^\w/, (c) => c.toUpperCase())}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-600">
                  Store Online · Vault Authentications Active
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick actions, notifications, user avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Button
              asChild
              size="sm"
              className={`rounded-xl font-bold text-xs h-9 px-3.5 shadow-2xs ${
                isLightAdmin
                  ? "bg-zinc-950 hover:bg-zinc-800 text-white"
                  : "bg-white hover:bg-zinc-100 text-zinc-950"
              }`}
            >
              <Link href="/admin/products">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                New Sneaker
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="sm"
              className={`hidden sm:inline-flex rounded-xl font-bold text-xs h-9 px-3 border ${
                isLightAdmin
                  ? "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                  : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
              }`}
            >
              <Link href="/" target="_blank">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Live Shop
              </Link>
            </Button>

            <div className="relative">
              <Link
                href="/admin/orders"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors relative ${
                  isLightAdmin
                    ? "border-zinc-200 bg-white text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50"
                    : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white"
                }`}
                title="Pending Orders & Alerts"
              >
                <Bell className="w-4 h-4" />
                {counts.orders > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {counts.orders}
                  </span>
                )}
              </Link>
            </div>

            <div className="flex items-center gap-2 pl-1 border-l border-zinc-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-zinc-950 text-white font-black text-xs flex items-center justify-center shadow-xs">
                {user.displayName?.charAt(0).toUpperCase() || "A"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

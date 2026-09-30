"use client";

import React, { useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
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
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

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
          <p className="text-zinc-400 text-sm font-medium">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
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
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-zinc-900" />
          </div>
          <div>
            <p className="text-sm font-black text-white tracking-tight">
              {SITE_NAME}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              Admin Panel
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {ADMIN_NAV.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-50" />
              )}
            </Link>
          );
        })}
      </div>

      {/* User info */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs font-bold flex items-center justify-center">
            {user.displayName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user.displayName}
            </p>
            <p className="text-[10px] text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs h-8 rounded-lg"
            asChild
          >
            <Link href="/">
              <LogOut className="h-3 w-3 mr-1.5" />
              Store
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-zinc-900 border-r border-zinc-800 flex-col fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-20 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-white">{SITE_NAME} Admin</span>
        </div>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

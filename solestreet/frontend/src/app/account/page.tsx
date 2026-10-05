"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  Shield,
  ShoppingBag,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderCard } from "@/components/account/order-card";
import { AddressModal } from "@/components/account/address-modal";
import { DeleteAddressDialog } from "@/components/account/delete-address-dialog";
import { ProfileSettings } from "@/components/account/profile-settings";
import { useAuth } from "@/context/auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { getUserOrders } from "@/lib/firebase/firestore";
import { products } from "@/data/products";
import { formatPrice, formatDate } from "@/lib/format";
import type { AddressFormValues } from "@/lib/validations/checkout";
import type { Order, Address } from "@/types";
import { toast } from "sonner";

type AccountTab = "overview" | "orders" | "addresses" | "wishlist" | "settings";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as AccountTab | null;

  const {
    user,
    isLoading,
    signOut,
    updateUser,
    addAddress,
    updateAddress,
    removeAddress,
    setAsDefaultAddress,
    resetPassword,
  } = useAuth();
  const { wishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<AccountTab>(
    tabParam && ["overview", "orders", "addresses", "wishlist", "settings"].includes(tabParam)
      ? tabParam
      : "overview"
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Address modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);

  // Delete address dialog state
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  // Order filtering states
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | "active" | "delivered" | "cancelled">("all");

  // Sync activeTab when searchParam changes
  useEffect(() => {
    if (tabParam && ["overview", "orders", "addresses", "wishlist", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Update URL parameter when switching tabs
  const handleTabChange = (tab: AccountTab) => {
    setActiveTab(tab);
    router.replace(`/account?tab=${tab}`, { scroll: false });
  };

  // Redirect unauthenticated users UNLESS they are viewing their guest wishlist
  useEffect(() => {
    if (!isLoading && !user && tabParam !== "wishlist") {
      router.push("/login?redirect=/account");
    }
  }, [user, isLoading, router, tabParam]);

  // Load user orders from Firestore
  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        setIsLoadingOrders(true);
        try {
          const userOrders = await getUserOrders(user.uid);
          setOrders(userOrders);
        } catch (err) {
          console.error("Failed to load user orders:", err);
        } finally {
          setIsLoadingOrders(false);
        }
      }
    }
    fetchOrders();
  }, [user]);

  // Address Handlers
  const handleOpenAddAddress = () => {
    setAddressToEdit(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setAddressToEdit(addr);
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (data: AddressFormValues) => {
    try {
      if (addressToEdit) {
        await updateAddress(addressToEdit.id, data);
        toast.success("Shipping address updated successfully");
      } else {
        await addAddress(data);
        toast.success("New shipping address saved");
      }
      setIsAddressModalOpen(false);
      setAddressToEdit(null);
    } catch {
      toast.error("Failed to save shipping address");
    }
  };

  const handleConfirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await removeAddress(addressToDelete.id);
      toast.success("Address removed from your account");
      setAddressToDelete(null);
    } catch {
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (addrId: string) => {
    try {
      await setAsDefaultAddress(addrId);
      toast.success("Default delivery address updated");
    } catch {
      toast.error("Failed to update default address");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out of your account");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (orderStatusFilter === "active") {
        if (["delivered", "cancelled", "refunded"].includes(o.fulfillmentStatus)) {
          return false;
        }
      } else if (orderStatusFilter === "delivered") {
        if (o.fulfillmentStatus !== "delivered") return false;
      } else if (orderStatusFilter === "cancelled") {
        if (!["cancelled", "refunded"].includes(o.fulfillmentStatus)) return false;
      }

      // Search query
      if (orderSearchQuery.trim()) {
        const query = orderSearchQuery.toLowerCase().trim();
        const matchesId = o.id.toLowerCase().includes(query);
        const matchesItem = o.items.some(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.brand.toLowerCase().includes(query)
        );
        if (!matchesId && !matchesItem) return false;
      }

      return true;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // Total Lifetime Purchases Calculation
  const totalSpent = useMemo(() => {
    return orders
      .filter((o) => o.paymentStatus === "succeeded" || (o.paymentStatus as string) === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">
            Loading your collector portal...
          </p>
        </div>
      </div>
    );
  }

  // Guest Wishlist View (if not logged in)
  if (!user) {
    const guestWishlistProducts = products.filter((p) => wishlist.includes(p.id));
    return (
      <div className="min-h-screen bg-zinc-50 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Guest Wishlist
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2.5">
                <Heart className="h-7 w-7 text-red-500 fill-current" />
                Saved Sneakers
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500">
                Stored on this browser ({guestWishlistProducts.length} pair{guestWishlistProducts.length === 1 ? "" : "s"}).
                Sign in to sync your rotation across devices.
              </p>
            </div>
            <Button
              asChild
              className="rounded-xl h-11 px-6 font-bold bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm"
            >
              <Link href="/login?redirect=/account?tab=wishlist">
                Sign In to Sync
              </Link>
            </Button>
          </div>

          {guestWishlistProducts.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Your Wishlist is Empty"
              description="Explore our curated collection of verified deadstock and premium streetwear. Tap the heart icon on any pair to build your dream rotation."
              actionLabel="Explore Sneakers"
              actionHref="/shop"
              secondaryLabel="Browse Bestsellers"
              secondaryHref="/shop?sort=bestselling"
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {guestWishlistProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-zinc-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-950 text-white flex items-center justify-center text-2xl font-black shadow-md border border-zinc-800">
              {user.displayName?.charAt(0).toUpperCase() || "C"}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                  {user.displayName || "Sole Collector"}
                </h1>
                {user.role === "admin" ? (
                  <Badge className="bg-purple-600 hover:bg-purple-600 text-white text-[11px] font-bold px-2.5 py-0.5 shadow-2xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px] font-bold border-zinc-300 text-zinc-700 bg-zinc-50">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                    Collector Tier
                  </Badge>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-medium">{user.email}</p>
              <p className="text-[11px] text-zinc-400" suppressHydrationWarning>
                Member since {user.createdAt ? formatDate(user.createdAt) : "2026"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100">
            {user.role === "admin" && (
              <Button
                asChild
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs h-10 px-4 shadow-sm"
              >
                <Link href="/admin">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Admin Control
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="rounded-xl font-bold text-xs border-zinc-200 text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-10 px-4 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <div className="lg:hidden overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-2 min-w-max p-1 bg-white rounded-2xl border border-zinc-200/90 shadow-2xs">
            <button
              onClick={() => handleTabChange("overview")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Overview
            </button>

            <button
              onClick={() => handleTabChange("orders")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "orders"
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Orders
              {orders.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === "orders" ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-800"
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange("addresses")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "addresses"
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              Addresses
              {(user.addresses?.length || 0) > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === "addresses" ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-800"
                  }`}
                >
                  {user.addresses?.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange("wishlist")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "wishlist"
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Heart className="h-3.5 w-3.5" />
              Wishlist
              {wishlist.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === "wishlist" ? "bg-white/20 text-white" : "bg-zinc-200 text-zinc-800"
                  }`}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange("settings")}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-zinc-950 text-white shadow-xs"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Left Sidebar Navigation */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-zinc-200/90 p-3 shadow-xs space-y-1">
              <button
                onClick={() => handleTabChange("overview")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <User className="h-4 w-4" />
                Account Overview
              </button>

              <button
                onClick={() => handleTabChange("orders")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "orders"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <Package className="h-4 w-4" />
                  Order History
                </span>
                {orders.length > 0 && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      activeTab === "orders"
                        ? "bg-white/20 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange("addresses")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "addresses"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <MapPin className="h-4 w-4" />
                  Saved Addresses
                </span>
                {(user.addresses?.length || 0) > 0 && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      activeTab === "addresses"
                        ? "bg-white/20 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {user.addresses?.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange("wishlist")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "wishlist"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <Heart className="h-4 w-4" />
                  My Wishlist
                </span>
                {wishlist.length > 0 && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      activeTab === "wishlist"
                        ? "bg-white/20 text-white"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleTabChange("settings")}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === "settings"
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <Settings className="h-4 w-4" />
                Profile Settings
              </button>

              {user.role === "admin" && (
                <div className="pt-2 mt-2 border-t border-zinc-100">
                  <Link
                    href="/admin"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-purple-600" />
                      Admin Control
                    </span>
                    <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5">
                      Console
                    </Badge>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Admin Alert if applicable */}
                {user.role === "admin" && (
                  <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-900 rounded-3xl p-6 text-white border border-purple-800/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <Shield className="h-6 w-6 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Administrator Access Active</h3>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          Manage sneaker inventory, orders, customer accounts, and promo codes.
                        </p>
                      </div>
                    </div>
                    <Button asChild className="bg-white text-zinc-950 hover:bg-zinc-100 font-bold rounded-xl h-10 px-5 shrink-0 shadow-xs">
                      <Link href="/admin">Open Admin Control</Link>
                    </Button>
                  </div>
                )}

                {/* Account Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Total Orders
                      </span>
                      <Package className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-zinc-950">{orders.length}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Recorded orders</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Volume Spent
                      </span>
                      <CreditCard className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-zinc-950">{formatPrice(totalSpent)}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Lifetime acquisitions</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Wishlist
                      </span>
                      <Heart className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-zinc-950">{wishlist.length}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Saved silhouettes</p>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-zinc-200/90 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                        Saved Destinations
                      </span>
                      <MapPin className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-zinc-950">{user.addresses?.length || 0}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Active addresses</p>
                  </div>
                </div>

                {/* Recent Orders Spotlight */}
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-zinc-950 tracking-tight">
                        Recent Activity & Orders
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Track your live package fulfillments and past orders.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTabChange("orders")}
                      className="text-xs font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1 transition-colors"
                    >
                      View all ({orders.length}) <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {isLoadingOrders ? (
                    <div className="py-12 text-center text-zinc-400 text-xs">
                      <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading recent orders...
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-10 bg-zinc-50/60 rounded-2xl border border-zinc-200/60 p-6">
                      <ShoppingBag className="h-9 w-9 text-zinc-300 mx-auto mb-2.5" />
                      <h4 className="text-sm font-bold text-zinc-900">No Orders Yet</h4>
                      <p className="text-xs text-zinc-500 mt-1 mb-4 max-w-sm mx-auto">
                        Your sneaker collection journey starts with your first verified pair.
                      </p>
                      <Button asChild size="sm" className="rounded-xl font-bold text-xs h-9 px-5 bg-zinc-950 hover:bg-zinc-800 text-white">
                        <Link href="/shop">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 2).map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Address Snapshot */}
                <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-zinc-950">Default Delivery Address</h4>
                      {user.addresses && user.addresses.length > 0 ? (
                        <p className="text-xs text-zinc-600">
                          {user.addresses.find((a) => a.isDefault)?.street || user.addresses[0].street},{" "}
                          {user.addresses.find((a) => a.isDefault)?.city || user.addresses[0].city}
                        </p>
                      ) : (
                        <p className="text-xs text-zinc-400">
                          No address on file. Add one to enable 1-click checkout.
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleTabChange("addresses")}
                    className="rounded-xl text-xs font-bold border-zinc-200 h-10 px-5 shrink-0"
                  >
                    Manage Addresses
                  </Button>
                </div>
              </div>
            )}

            {/* 2. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                      Order Manifest & History
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Inspect past purchases, verified receipts, and live courier tracking.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200/60 self-start sm:self-auto">
                    {orders.length} Total Orders
                  </span>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  {/* Status Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {(
                      [
                        { id: "all", label: "All Orders" },
                        { id: "active", label: "In Progress" },
                        { id: "delivered", label: "Delivered" },
                        { id: "cancelled", label: "Cancelled" },
                      ] as const
                    ).map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => setOrderStatusFilter(filter.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          orderStatusFilter === filter.id
                            ? "bg-zinc-950 text-white shadow-2xs"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[220px]">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      placeholder="Search by #ID or sneaker..."
                      className="h-9 pl-8 text-xs rounded-xl border-zinc-200"
                    />
                  </div>
                </div>

                {isLoadingOrders ? (
                  <div className="py-16 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-zinc-500 font-semibold">Loading orders history...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No Orders Yet"
                    description="You have not placed any orders yet. Discover limited edition sneakers and exclusive releases in our catalog."
                    actionLabel="Explore Sneakers"
                    actionHref="/shop"
                    secondaryLabel="Browse Bestsellers"
                    secondaryHref="/shop?sort=bestselling"
                  />
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-50/60 rounded-2xl border border-zinc-200/60 p-6 space-y-3">
                    <Filter className="w-8 h-8 text-zinc-300 mx-auto" />
                    <h4 className="text-sm font-bold text-zinc-900">No Orders Found</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                      No orders match your search criteria or selected status filter.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setOrderStatusFilter("all");
                        setOrderSearchQuery("");
                      }}
                      className="rounded-xl text-xs font-bold border-zinc-200"
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                      Saved Shipping Addresses
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Maintain your verified shipping destinations for rapid 1-click checkout.
                    </p>
                  </div>
                  <Button
                    onClick={handleOpenAddAddress}
                    size="sm"
                    className="rounded-xl font-bold text-xs h-10 px-5 bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm self-start sm:self-auto"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Add New Address
                  </Button>
                </div>

                {!user.addresses || user.addresses.length === 0 ? (
                  <EmptyState
                    icon={MapPin}
                    title="No Saved Addresses"
                    description="Save your home, office, or private suite address to unlock 1-click checkout during high-demand releases."
                    actionLabel="Add First Address"
                    onAction={handleOpenAddAddress}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-2xl border relative flex flex-col justify-between transition-all ${
                          addr.isDefault
                            ? "border-zinc-950 bg-zinc-50/50 shadow-2xs ring-1 ring-zinc-950/10"
                            : "border-zinc-200/90 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-sm text-zinc-950">{addr.fullName}</span>
                            {addr.isDefault && (
                              <Badge className="bg-zinc-950 text-white text-[10px] font-bold px-2.5 py-0.5">
                                Default Shipping
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-zinc-600 leading-relaxed font-medium space-y-0.5">
                            <p>
                              {addr.street}
                              {addr.apartment ? `, ${addr.apartment}` : ""}
                            </p>
                            <p>
                              {addr.city}, {addr.state} {addr.zipCode}
                            </p>
                            <p>{addr.country}</p>
                            <p className="pt-1 text-zinc-500 font-mono">📞 {addr.phone}</p>
                          </div>
                        </div>

                        <div className="mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                          <div>
                            {!addr.isDefault ? (
                              <button
                                onClick={() => handleSetDefault(addr.id)}
                                className="font-bold text-xs text-zinc-700 hover:text-zinc-950 transition-colors"
                              >
                                Set as Default
                              </button>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Primary Destination
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditAddress(addr)}
                              className="text-zinc-600 hover:text-zinc-950 font-bold p-1 rounded-md transition-colors flex items-center gap-1"
                              title="Edit address"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => setAddressToDelete(addr)}
                              className="text-red-500 hover:text-red-700 font-bold p-1 rounded-md transition-colors flex items-center gap-1 ml-1"
                              title="Delete address"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-zinc-950 tracking-tight">
                      Curated Wishlist
                    </h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Your saved sneaker rotations, grail pairs, and upcoming releases.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-500 bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200/60">
                    {wishlistProducts.length} Pairs
                  </span>
                </div>

                {wishlistProducts.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="Your Wishlist is Empty"
                    description="Click the heart icon on any pair in the catalog to save your grail sneakers for quick access."
                    actionLabel="Explore Sneakers"
                    actionHref="/shop"
                    secondaryLabel="Browse Bestsellers"
                    secondaryHref="/shop?sort=bestselling"
                  />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    {wishlistProducts.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. SETTINGS TAB */}
            {activeTab === "settings" && (
              <ProfileSettings
                user={user}
                onUpdate={updateUser}
                onResetPassword={resetPassword}
              />
            )}
          </div>
        </div>
      </div>

      {/* Address Add / Edit Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setAddressToEdit(null);
        }}
        addressToEdit={addressToEdit}
        onSave={handleSaveAddress}
      />

      {/* Delete Address Confirmation Dialog */}
      <DeleteAddressDialog
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        address={addressToDelete}
        onConfirm={handleConfirmDeleteAddress}
      />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">
              Loading account...
            </p>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

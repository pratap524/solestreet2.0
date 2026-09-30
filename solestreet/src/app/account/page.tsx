"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Package,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Truck,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductCard } from "@/components/product/product-card";
import { useAuth } from "@/context/auth-context";
import { useWishlist } from "@/context/wishlist-context";
import { getUserOrders } from "@/lib/firebase/firestore";
import { products } from "@/data/products";
import { formatPrice, formatDate } from "@/lib/format";
import { addressSchema, type AddressFormValues } from "@/lib/validations/checkout";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/auth";
import type { Order } from "@/types";
import { toast } from "sonner";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "overview" | "orders" | "addresses" | "wishlist" | "settings" | null;

  const { user, isLoading, signOut, updateUser, addAddress, removeAddress, setAsDefaultAddress } =
    useAuth();
  const { wishlist, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses" | "wishlist" | "settings">(
    tabParam && ["overview", "orders", "addresses", "wishlist", "settings"].includes(tabParam)
      ? tabParam
      : "overview"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  // Sync activeTab if searchParam changes
  useEffect(() => {
    if (tabParam && ["overview", "orders", "addresses", "wishlist", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Redirect unauthenticated users UNLESS they are viewing their guest wishlist
  useEffect(() => {
    if (!isLoading && !user && tabParam !== "wishlist") {
      router.push("/login?redirect=/account");
    }
  }, [user, isLoading, router, tabParam]);

  // Load orders
  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        setIsLoadingOrders(true);
        try {
          const userOrders = await getUserOrders(user.uid);
          setOrders(userOrders);
        } finally {
          setIsLoadingOrders(false);
        }
      }
    }
    fetchOrders();
  }, [user]);

  // Address form
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      street: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
      isDefault: false,
    },
  });

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      phone: user?.phone || "",
    },
  });

  const onSaveAddress = async (data: AddressFormValues) => {
    try {
      await addAddress(data);
      toast.success("Address saved successfully");
      setAddressModalOpen(false);
      addressForm.reset();
    } catch {
      toast.error("Failed to save address");
    }
  };

  const onUpdateProfile = async (data: ProfileFormValues) => {
    try {
      await updateUser({ displayName: data.displayName, phone: data.phone });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const guestWishlistProducts = products.filter((p) => wishlist.includes(p.id));
    return (
      <div className="min-h-screen bg-zinc-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500 fill-current" />
                Your Wishlist
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Saved on this device ({guestWishlistProducts.length} item{guestWishlistProducts.length === 1 ? "" : "s"})
              </p>
            </div>
            <Button asChild className="rounded-xl font-semibold bg-zinc-900 hover:bg-zinc-800 text-white">
              <Link href="/login?redirect=/account?tab=wishlist">
                Sign In to Sync Across Devices
              </Link>
            </Button>
          </div>

          {guestWishlistProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200/80 p-8 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Your wishlist is empty</h3>
              <p className="text-sm text-zinc-500 mb-6 max-w-sm mx-auto">
                Explore our collection and click the heart icon on any pair to save them here.
              </p>
              <Button asChild className="rounded-xl px-8">
                <Link href="/shop">Start Shopping</Link>
              </Button>
            </div>
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
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xl font-bold shadow-md">
              {user.displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                  {user.displayName || "Shoe Collector"}
                </h1>
                {user.role === "admin" && (
                  <Badge className="bg-purple-600 text-white hover:bg-purple-600 text-xs">
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === "admin" && (
              <Button
                asChild
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-xs h-9 px-3.5 shadow-sm"
              >
                <Link href="/admin">
                  <Shield className="h-4 w-4 mr-1.5" />
                  Admin Panel
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="rounded-xl font-semibold text-xs border-zinc-200 text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-9"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-2 shadow-xs space-y-1">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "overview"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <User className="h-4 w-4" />
                Overview
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "orders"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Package className="h-4 w-4" />
                  Orders
                </span>
                {orders.length > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === "orders"
                        ? "bg-white text-zinc-900"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "wishlist"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Heart className="h-4 w-4" />
                  Wishlist
                </span>
                {wishlist.length > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === "wishlist"
                        ? "bg-white text-zinc-900"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "addresses"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <MapPin className="h-4 w-4" />
                Addresses
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === "settings"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              {user.role === "admin" && (
                <div className="pt-2 border-t border-zinc-100">
                  <Link
                    href="/admin"
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-purple-600" />
                      Admin Panel
                    </span>
                    <Badge className="bg-purple-600 text-white text-[10px] px-1.5 py-0.5">Admin</Badge>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Pane */}
          <div className="lg:col-span-3 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {user.role === "admin" && (
                  <div className="bg-gradient-to-r from-purple-950 via-zinc-900 to-zinc-900 rounded-2xl p-6 text-white border border-purple-800/40 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center shrink-0">
                        <Shield className="h-6 w-6 text-purple-300" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Administrator Access Active</h3>
                        <p className="text-xs text-zinc-300 mt-0.5">
                          Manage products, categories, orders, customers, coupons, and product reviews in the control center.
                        </p>
                      </div>
                    </div>
                    <Button asChild className="bg-white text-zinc-950 hover:bg-zinc-100 font-bold rounded-xl h-10 px-5 shrink-0 shadow-sm">
                      <Link href="/admin">Open Admin Panel</Link>
                    </Button>
                  </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Total Orders
                      </span>
                      <Package className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-zinc-900">{orders.length}</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Saved in Wishlist
                      </span>
                      <Heart className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-zinc-900">{wishlist.length}</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Saved Addresses
                      </span>
                      <MapPin className="h-4 w-4 text-zinc-400" />
                    </div>
                    <p className="mt-2 text-2xl font-black text-zinc-900">
                      {user.addresses?.length || 0}
                    </p>
                  </div>
                </div>

                {/* Recent Orders Overview */}
                <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-zinc-900 text-lg">Recent Orders</h3>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-xs font-bold text-zinc-900 hover:underline flex items-center gap-1"
                    >
                      View all <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-zinc-700">No orders placed yet</p>
                      <p className="text-xs text-zinc-400 mt-1 mb-4">
                        Discover your next favorite pair from our collection.
                      </p>
                      <Button asChild size="sm" className="rounded-xl">
                        <Link href="/shop">
                          Start Shopping
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="py-4 flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-zinc-900">#{order.id}</span>
                              <Badge
                                variant="outline"
                                className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border-emerald-200"
                              >
                                {order.fulfillmentStatus}
                              </Badge>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""} •{" "}
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-zinc-900">
                              {formatPrice(order.total)}
                            </p>
                            <Link
                              href={`/account/orders/${order.id}`}
                              className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold"
                            >
                              Details →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
                <h3 className="font-bold text-zinc-900 text-lg mb-6">Order History</h3>

                {isLoadingOrders ? (
                  <div className="py-12 text-center text-zinc-400 text-sm">
                    Loading your orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <h4 className="font-bold text-zinc-800">You have no orders yet</h4>
                    <p className="text-xs text-zinc-500 mt-1 mb-6">
                      When you place an order, it will show up here with live status tracking.
                    </p>
                    <Button asChild className="rounded-xl font-semibold">
                      <Link href="/shop">Explore Catalog</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                          <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                              Order ID
                            </span>
                            <p className="font-bold text-sm text-zinc-900">#{order.id}</p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                              Date Placed
                            </span>
                            <p className="font-medium text-xs text-zinc-700">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                              Total
                            </span>
                            <p className="font-bold text-sm text-zinc-900">
                              {formatPrice(order.total)}
                            </p>
                          </div>
                          <div>
                            <Badge
                              className={`text-xs uppercase font-bold ${
                                order.fulfillmentStatus === "delivered"
                                  ? "bg-emerald-600 text-white"
                                  : order.fulfillmentStatus === "shipped"
                                  ? "bg-blue-600 text-white"
                                  : "bg-amber-500 text-white"
                              }`}
                            >
                              {order.fulfillmentStatus}
                            </Badge>
                          </div>
                        </div>

                        {/* Items in this order */}
                        <div className="py-4 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="relative w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold text-sm text-zinc-900 truncate">
                                  {item.name}
                                </h5>
                                <p className="text-xs text-zinc-500">
                                  Size US {item.size} • Color: {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                              <span className="font-semibold text-sm text-zinc-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
                          <span className="text-zinc-500 flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-zinc-400" />
                            {order.shippingMethod?.name || "Standard Ground Delivery"}
                          </span>
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="font-bold text-zinc-900 hover:underline"
                          >
                            View Full Invoice →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-zinc-900 text-lg">My Wishlist</h3>
                  <span className="text-xs text-zinc-500 font-medium">
                    {wishlistProducts.length} saved items
                  </span>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <h4 className="font-bold text-zinc-800">Your wishlist is empty</h4>
                    <p className="text-xs text-zinc-500 mt-1 mb-6">
                      Click the heart icon on any shoe to save it to your personal wishlist.
                    </p>
                    <Button asChild className="rounded-xl font-semibold">
                      <Link href="/shop">Explore Catalog</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((p) => (
                      <div
                        key={p.id}
                        className="border border-zinc-200 rounded-xl p-4 flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-100 mb-3">
                            <Image
                              src={p.images[0]?.url || ""}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() => toggleWishlist(p.id, p.name)}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-white shadow-xs"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                          <span className="text-[10px] uppercase font-bold text-zinc-400">
                            {p.brand}
                          </span>
                          <Link href={`/product/${p.slug}`}>
                            <h5 className="font-semibold text-sm text-zinc-900 hover:underline line-clamp-1">
                              {p.name}
                            </h5>
                          </Link>
                          <p className="font-bold text-sm text-zinc-900 mt-1">
                            {formatPrice(p.price)}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-100">
                          <Button asChild size="sm" className="w-full rounded-xl text-xs">
                            <Link href={`/product/${p.slug}`}>
                              Select Size & Buy
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ADDRESSES TAB */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-zinc-900 text-lg">Saved Addresses</h3>
                  <Dialog open={addressModalOpen} onOpenChange={setAddressModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="rounded-xl font-semibold">
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add New Address
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                      </DialogHeader>
                      <form
                        onSubmit={addressForm.handleSubmit(onSaveAddress)}
                        className="space-y-4 mt-2"
                      >
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">Full Name</label>
                          <Input
                            {...addressForm.register("fullName")}
                            placeholder="John Doe"
                            className="mt-1"
                          />
                          {addressForm.formState.errors.fullName && (
                            <p className="text-xs text-red-500 mt-0.5">
                              {addressForm.formState.errors.fullName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-zinc-700">Street Address</label>
                          <Input
                            {...addressForm.register("street")}
                            placeholder="123 Main St"
                            className="mt-1"
                          />
                          {addressForm.formState.errors.street && (
                            <p className="text-xs text-red-500 mt-0.5">
                              {addressForm.formState.errors.street.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-zinc-700">
                            Apartment, Suite, etc. (Optional)
                          </label>
                          <Input
                            {...addressForm.register("apartment")}
                            placeholder="Apt 4B"
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-zinc-700">City</label>
                            <Input
                              {...addressForm.register("city")}
                              placeholder="New York"
                              className="mt-1"
                            />
                            {addressForm.formState.errors.city && (
                              <p className="text-xs text-red-500 mt-0.5">
                                {addressForm.formState.errors.city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-zinc-700">State / Region</label>
                            <Input
                              {...addressForm.register("state")}
                              placeholder="NY"
                              className="mt-1"
                            />
                            {addressForm.formState.errors.state && (
                              <p className="text-xs text-red-500 mt-0.5">
                                {addressForm.formState.errors.state.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-zinc-700">Postal / ZIP</label>
                            <Input
                              {...addressForm.register("zipCode")}
                              placeholder="10001"
                              className="mt-1"
                            />
                            {addressForm.formState.errors.zipCode && (
                              <p className="text-xs text-red-500 mt-0.5">
                                {addressForm.formState.errors.zipCode.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-zinc-700">Phone</label>
                            <Input
                              {...addressForm.register("phone")}
                              placeholder="+1 (555) 000-0000"
                              className="mt-1"
                            />
                            {addressForm.formState.errors.phone && (
                              <p className="text-xs text-red-500 mt-0.5">
                                {addressForm.formState.errors.phone.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <Button type="submit" className="w-full rounded-xl mt-4">
                          Save Address
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {!user.addresses || user.addresses.length === 0 ? (
                  <div className="text-center py-10">
                    <MapPin className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-zinc-700">No saved addresses</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Add a shipping address for rapid 1-click checkout.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-4 rounded-xl border relative flex flex-col justify-between ${
                          addr.isDefault
                            ? "border-zinc-900 bg-zinc-50/50"
                            : "border-zinc-200 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-zinc-900">{addr.fullName}</span>
                            {addr.isDefault && (
                              <Badge className="bg-zinc-900 text-white text-[10px]">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-600 leading-relaxed">
                            {addr.street} {addr.apartment ? `, ${addr.apartment}` : ""}
                            <br />
                            {addr.city}, {addr.state} {addr.zipCode}
                            <br />
                            {addr.country}
                            <br />
                            📞 {addr.phone}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                          {!addr.isDefault && (
                            <button
                              onClick={() => setAsDefaultAddress(addr.id)}
                              className="font-semibold text-zinc-600 hover:text-zinc-900"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => removeAddress(addr.id)}
                            className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 ml-auto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs">
                <h3 className="font-bold text-zinc-900 text-lg mb-6">Profile Settings</h3>

                <form
                  onSubmit={profileForm.handleSubmit(onUpdateProfile)}
                  className="space-y-4 max-w-md"
                >
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Display Name
                    </label>
                    <Input
                      {...profileForm.register("displayName")}
                      className="mt-1 h-11 rounded-xl"
                    />
                    {profileForm.formState.errors.displayName && (
                      <p className="text-xs text-red-500 mt-1">
                        {profileForm.formState.errors.displayName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Email Address
                    </label>
                    <Input
                      value={user.email}
                      disabled
                      className="mt-1 h-11 rounded-xl bg-zinc-50 text-zinc-500"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Email address is managed via authentication security.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <Input
                      {...profileForm.register("phone")}
                      placeholder="+1 (555) 000-0000"
                      className="mt-1 h-11 rounded-xl"
                    />
                  </div>

                  <Button type="submit" className="rounded-xl font-semibold">
                    Save Changes
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-zinc-500 font-medium">Loading account...</p>
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

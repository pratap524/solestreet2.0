"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Lock,
  Tag,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  X,
  PlusCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { products } from "@/data/products";
import type { ShoeSize } from "@/types";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    addItem,
    itemCount,
    subtotal,
    shipping,
    tax,
    discount,
    couponCode,
    total,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { wishlist, isInWishlist, toggleWishlist, count: wishlistCount } = useWishlist();

  const [promoInput, setPromoInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [clearCartConfirmOpen, setClearCartConfirmOpen] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setIsApplying(true);
    setPromoError(null);

    try {
      const ok = await applyCoupon(code);
      if (ok) {
        setPromoInput("");
      } else {
        setPromoError("Invalid promo code. Try SOLE20 (20% off) or WELCOME10 (10% off)");
      }
    } catch {
      setPromoError("Unable to apply promo code. Please try again.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleQuickApply = async (code: string) => {
    setPromoInput(code);
    setIsApplying(true);
    setPromoError(null);
    try {
      const ok = await applyCoupon(code);
      if (ok) {
        setPromoInput("");
      } else {
        setPromoError(`Code ${code} requires a higher cart subtotal.`);
      }
    } catch {
      setPromoError("Unable to apply promo code.");
    } finally {
      setIsApplying(false);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Filter wishlist products for the "Saved for Later" shelf
  const savedWishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // Quick move from wishlist to cart
  const handleMoveWishlistToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const defaultSize = (product.sizes?.[0]?.size || 9) as ShoeSize;
    const defaultColor = product.colors?.[0]?.name || product.selectedColor || "Standard";

    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0]?.url || "",
      size: defaultSize,
      color: defaultColor,
      quantity: 1,
      slug: product.slug,
    });
  };

  // Empty cart view
  if (items.length === 0) {
    const recommendedShoes = products.slice(0, 4);

    return (
      <div className="min-h-[80vh] bg-zinc-50/60 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Empty Cart Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-zinc-200/80 p-8 sm:p-14 text-center shadow-xs"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-zinc-100 animate-ping opacity-20" />
              <div className="relative w-full h-full rounded-3xl bg-zinc-50 flex items-center justify-center border border-zinc-200/80 shadow-inner">
                <ShoppingBag className="h-10 w-10 text-zinc-300 stroke-[1.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mb-2">
              Your Shopping Bag is Empty
            </h1>
            <p className="text-zinc-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Looks like you haven&apos;t added any sneakers yet. Discover the latest releases, performance runners, and iconic lifestyle drops.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl px-8 h-12 font-bold shadow-md cursor-pointer"
              >
                <Link href="/shop">
                  Start Shopping
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-xl px-8 h-12 font-bold text-zinc-700 hover:text-zinc-950 border-zinc-200 cursor-pointer"
              >
                <Link href="/wishlist">
                  <Heart className="h-4 w-4 mr-2 text-rose-500 fill-rose-500" />
                  View Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Trending Shoes Recommendations */}
          <div className="mt-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                  Trending Heat You Might Like
                </h2>
                <p className="text-xs text-zinc-500">
                  Popular drops among the SoleStreet community
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs font-bold">
                <Link href="/shop">View all drops →</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recommendedShoes.map((shoe) => (
                <Link
                  key={shoe.id}
                  href={`/product/${shoe.slug}`}
                  className="group bg-white rounded-2xl border border-zinc-200/80 p-3.5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 mb-3 border border-zinc-100">
                    <Image
                      src={shoe.images[0]?.url || "/placeholder.png"}
                      alt={shoe.name}
                      fill
                      sizes="200px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      {shoe.brand}
                    </span>
                    <h3 className="text-xs font-bold text-zinc-900 group-hover:text-zinc-600 truncate transition-colors">
                      {shoe.name}
                    </h3>
                    <p className="text-xs font-black text-zinc-900 mt-1">
                      {formatPrice(shoe.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Breadcrumbs & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-1">
              <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-zinc-900 font-semibold">Shopping Bag</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Shopping Bag
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Review your sneaker choices before proceeding to secure checkout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-3 py-1.5 text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200/80">
              {itemCount} {itemCount === 1 ? "Pair" : "Pairs"}
            </Badge>

            {/* Clear Bag Button with Confirmation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setClearCartConfirmOpen(true)}
              className="text-xs font-semibold text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Clear Bag
            </Button>
          </div>
        </div>

        {/* Clear Cart Confirmation Dialog */}
        <Dialog open={clearCartConfirmOpen} onOpenChange={setClearCartConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clear your shopping bag?</DialogTitle>
              <DialogDescription>
                This will remove all {itemCount} items from your shopping bag. You can also save items to your wishlist instead.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setClearCartConfirmOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  clearCart();
                  setClearCartConfirmOpen(false);
                }}
                className="rounded-xl text-xs font-bold"
              >
                Yes, Clear Bag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-xs divide-y divide-zinc-100 overflow-hidden">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const savedInWishlist = isInWishlist(item.productId);

                  return (
                    <motion.div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="p-5 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row gap-5">
                        {/* Product Thumbnail */}
                        <Link
                          href={`/product/${item.slug}`}
                          className="group relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80 shadow-2xs"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 96px, 128px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Item Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                  {item.brand}
                                </span>
                                <Link
                                  href={`/product/${item.slug}`}
                                  className="font-black text-base sm:text-lg text-zinc-900 hover:text-zinc-600 transition-colors block"
                                >
                                  {item.name}
                                </Link>
                              </div>

                              <div className="text-right">
                                <span className="text-base sm:text-lg font-black text-zinc-950">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                                {item.quantity > 1 && (
                                  <p className="text-xs text-zinc-400 font-medium">
                                    {formatPrice(item.price)} each
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Variant Chips */}
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-zinc-100 text-xs font-bold text-zinc-800 border border-zinc-200/80">
                                Size: US {item.size}
                              </span>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-xs font-medium text-zinc-700 border border-zinc-200/80">
                                <span className="w-2 h-2 rounded-full bg-zinc-800 shrink-0" />
                                {item.color}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
                                <CheckCircle2 className="h-3 w-3" /> In Stock • Ready to Ship
                              </span>
                            </div>
                          </div>

                          {/* Controls & Actions */}
                          <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-3 border-t border-zinc-100">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50 shadow-2xs">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.size,
                                    item.color,
                                    item.quantity - 1
                                  )
                                }
                                className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-l-xl transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-10 text-center text-xs font-extrabold text-zinc-900 select-none">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.size,
                                    item.color,
                                    item.quantity + 1
                                  )
                                }
                                className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-r-xl transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Secondary Actions: Wishlist & Remove */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  toggleWishlist(item.productId, item.name)
                                }
                                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors cursor-pointer border ${
                                  savedInWishlist
                                    ? "text-rose-600 bg-rose-50 border-rose-200"
                                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 border-zinc-200/80"
                                }`}
                              >
                                <Heart
                                  className={`h-3.5 w-3.5 ${
                                    savedInWishlist ? "fill-rose-500 text-rose-500" : ""
                                  }`}
                                />
                                <span>
                                  {savedInWishlist ? "Saved in Wishlist" : "Save for Later"}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(item.productId, item.size, item.color)
                                }
                                className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Back to Shop Link */}
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                asChild
                className="text-xs font-bold text-zinc-600 hover:text-zinc-950 rounded-xl"
              >
                <Link href="/shop">
                  <ArrowLeft className="h-3.5 w-3.5 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>

            {/* Saved in Wishlist Shelf (If user has items saved) */}
            {savedWishlistProducts.length > 0 && (
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 shadow-xs mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                    <h3 className="font-bold text-zinc-900 text-sm">
                      Saved in Your Wishlist ({savedWishlistProducts.length})
                    </h3>
                  </div>
                  <Link
                    href="/wishlist"
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedWishlistProducts.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-100 hover:border-zinc-200 transition-colors bg-zinc-50/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                          <Image
                            src={item.images[0]?.url || "/placeholder.png"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-zinc-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-zinc-500 font-semibold">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveWishlistToCart(item.id)}
                        className="rounded-xl text-xs font-bold text-zinc-800 hover:bg-zinc-900 hover:text-white shrink-0 cursor-pointer"
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1" />
                        Move to Bag
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-7 space-y-6 shadow-xs">
              <h2 className="text-lg font-black text-zinc-950 tracking-tight">
                Order Summary
              </h2>

              {/* Free Shipping Progress Meter */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  {hasFreeShipping ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1.5 text-xs">
                      <Sparkles className="h-4 w-4 text-emerald-600 animate-bounce" />
                      Free Standard Shipping Unlocked!
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs">
                      Add <span className="font-bold text-zinc-950">{formatPrice(amountNeeded)}</span> for <span className="font-bold text-emerald-600">FREE shipping</span>
                    </span>
                  )}
                  <span className="text-[11px] font-extrabold text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200/80">
                    {progressPercent}%
                  </span>
                </div>
                <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      hasFreeShipping
                        ? "bg-linear-to-r from-emerald-500 to-teal-500"
                        : "bg-linear-to-r from-amber-500 via-zinc-800 to-zinc-950"
                    }`}
                    style={{ width: `${Math.max(5, progressPercent)}%` }}
                  />
                </div>
              </div>

              {/* Promo Code Input & States */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Promo / Discount Code
                </label>

                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        if (promoError) setPromoError(null);
                      }}
                      placeholder="e.g. SOLE20 or WELCOME10"
                      className={`h-11 rounded-xl text-xs uppercase bg-zinc-50/80 ${
                        promoError ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                    />
                    <Button
                      type="submit"
                      disabled={isApplying || !promoInput.trim()}
                      className="h-11 px-5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      {isApplying ? "Applying..." : "Apply"}
                    </Button>
                  </div>

                  {/* Invalid Promo State */}
                  {promoError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0, x: [-6, 6, -4, 4, 0] }}
                      transition={{ duration: 0.3 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <span className="font-semibold block">{promoError}</span>
                      </div>
                    </motion.div>
                  )}
                </form>

                {/* Successful Promo State */}
                {couponCode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-emerald-950">
                          Coupon {couponCode} Applied!
                        </span>
                        <p className="text-[11px] text-emerald-700">
                          You saved {formatPrice(discount)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="p-1 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 transition-colors font-bold text-xs cursor-pointer"
                      aria-label="Remove coupon"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                )}

                {/* Quick Promo Suggestion Chips */}
                {!couponCode && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-zinc-400 font-medium">Available:</span>
                    <button
                      type="button"
                      onClick={() => handleQuickApply("SOLE20")}
                      className="text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      SOLE20 (20% OFF)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickApply("WELCOME10")}
                      className="text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      WELCOME10 (10% OFF)
                    </button>
                  </div>
                )}
              </div>

              <Separator className="bg-zinc-100" />

              {/* Price Calculation Breakdown */}
              <div className="space-y-2.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? "pair" : "pairs"})</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Savings</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Estimated Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/50">
                        FREE
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Sales Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <Separator className="my-2 bg-zinc-200" />

                <div className="flex justify-between items-baseline text-zinc-950">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-xl font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA */}
              <Button
                asChild
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-2xl h-14 text-sm font-bold shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Link href="/checkout">
                  <Lock className="h-4 w-4" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>

              {/* Security & Reassurance Signals */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-100 text-[11px] text-zinc-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted checkout with Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-zinc-600 shrink-0" />
                  <span>Free shipping on all orders over ₹{FREE_SHIPPING_THRESHOLD}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-zinc-600 shrink-0" />
                  <span>30-day effortless returns & exchanges</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

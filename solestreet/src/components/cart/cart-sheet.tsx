"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  ShieldCheck,
  Heart,
  X,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export function CartSheet() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
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

  const { isInWishlist, toggleWishlist, count: wishlistCount } = useWishlist();

  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;
    setIsApplyingPromo(true);
    setPromoError(null);

    try {
      const ok = await applyCoupon(cleanCode);
      if (ok) {
        setPromoInput("");
        setIsPromoOpen(false);
      } else {
        setPromoError("Invalid code. Try SOLE20 (20% off) or WELCOME10 (10% off)");
      }
    } catch {
      setPromoError("Unable to apply promo code. Please try again.");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleQuickPromo = async (code: string) => {
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const ok = await applyCoupon(code);
      if (ok) {
        setPromoInput("");
        setIsPromoOpen(false);
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l border-zinc-200/80 shadow-2xl z-50"
        side="right"
      >
        {/* Drawer Header */}
        <SheetHeader className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/70 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center border-2 border-white">
                  {itemCount}
                </span>
              )}
            </div>
            <div>
              <SheetTitle className="text-base font-black tracking-tight text-zinc-950">
                Your Shopping Bag
              </SheetTitle>
              <p className="text-[11px] text-zinc-500 font-medium">
                {itemCount === 0
                  ? "Bag is currently empty"
                  : `${itemCount} ${itemCount === 1 ? "pair" : "pairs"} selected`}
              </p>
            </div>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center overflow-y-auto">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative w-24 h-24 mb-5"
            >
              <div className="absolute inset-0 rounded-3xl bg-zinc-100/80 rotate-6" />
              <div className="relative w-full h-full rounded-3xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shadow-inner">
                <ShoppingBag className="h-10 w-10 text-zinc-300 stroke-[1.5]" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </motion.div>

            <h3 className="text-xl font-black text-zinc-950 tracking-tight mb-2">
              Your bag is empty
            </h3>
            <p className="text-xs text-zinc-500 mb-6 max-w-xs leading-relaxed">
              Explore the freshest sneaker drops, running icons, and streetwear silhouettes.
            </p>

            <div className="flex flex-col gap-2.5 w-full max-w-xs">
              <Button
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl h-11 text-xs shadow-md transition-all cursor-pointer"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link href="/shop">
                  Start Shopping
                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                </Link>
              </Button>

              {wishlistCount > 0 ? (
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-10 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/wishlist">
                    <Heart className="h-3.5 w-3.5 mr-2 fill-rose-500 text-rose-500" />
                    View Saved Wishlist ({wishlistCount})
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full rounded-xl h-10 text-xs font-semibold text-zinc-700 hover:text-zinc-950 border-zinc-200"
                  onClick={() => setIsOpen(false)}
                  asChild
                >
                  <Link href="/shop?sort=bestselling">Browse Bestsellers</Link>
                </Button>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="mt-8 pt-6 border-t border-zinc-100 w-full max-w-xs">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                Popular Categories
              </p>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {[
                  { label: "Running", href: "/shop?category=running" },
                  { label: "Casual", href: "/shop?category=casual" },
                  { label: "Basketball", href: "/shop?category=basketball" },
                  { label: "Skate", href: "/shop?category=skateboarding" },
                ].map((cat) => (
                  <Link
                    key={cat.label}
                    href={cat.href}
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1 rounded-lg transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Free Shipping Progress Tracker */}
            <div className="px-5 py-3.5 bg-zinc-50/90 border-b border-zinc-100 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1.5">
                {hasFreeShipping ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5 text-[11px]">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
                    Unlocked FREE Standard Shipping!
                  </span>
                ) : (
                  <span className="text-zinc-600 text-[11px]">
                    Add <span className="font-extrabold text-zinc-950">{formatPrice(amountNeeded)}</span> more for <span className="font-bold text-emerald-600">FREE shipping</span>
                  </span>
                )}
                <span className="text-[10px] font-extrabold text-zinc-500 bg-white px-1.5 py-0.5 rounded border border-zinc-200/80">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-200/90 rounded-full overflow-hidden p-0.5">
                <motion.div
                  className={`h-full rounded-full transition-all duration-300 ${
                    hasFreeShipping
                      ? "bg-linear-to-r from-emerald-500 to-teal-500 shadow-xs"
                      : "bg-linear-to-r from-amber-500 via-zinc-800 to-zinc-950"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(6, progressPercent)}%` }}
                  transition={{ ease: "easeOut", duration: 0.4 }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-zinc-100">
              <AnimatePresence initial={false}>
                {items.map((item) => {
                  const savedInWishlist = isInWishlist(item.productId);

                  return (
                    <motion.div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      layout
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="py-3.5 first:pt-1 last:pb-2"
                    >
                      <div className="flex gap-3.5">
                        {/* Product Thumbnail */}
                        <Link
                          href={`/product/${item.slug}`}
                          className="group relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/80 shadow-2xs"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>

                        {/* Product Details & Variant */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
                                  {item.brand}
                                </span>
                                <Link
                                  href={`/product/${item.slug}`}
                                  className="text-xs font-bold text-zinc-900 hover:text-zinc-600 transition-colors line-clamp-1"
                                  onClick={() => setIsOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {/* Save to Wishlist Toggle */}
                                <button
                                  type="button"
                                  onClick={() => toggleWishlist(item.productId, item.name)}
                                  aria-label={savedInWishlist ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
                                  title={savedInWishlist ? "Saved in wishlist" : "Save for later"}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                    savedInWishlist
                                      ? "text-rose-500 bg-rose-50"
                                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                                  }`}
                                >
                                  <Heart
                                    className={`h-4 w-4 ${savedInWishlist ? "fill-current" : ""}`}
                                  />
                                </button>

                                {/* Remove Button */}
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.productId, item.size, item.color)}
                                  aria-label={`Remove ${item.name} size US ${item.size} from bag`}
                                  title="Remove item"
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Selected Variant Chips */}
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-zinc-100 text-[10px] font-bold text-zinc-800 border border-zinc-200/80">
                                US {item.size}
                              </span>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-100 text-[10px] font-medium text-zinc-600 border border-zinc-200/80 truncate max-w-[120px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0" />
                                {item.color}
                              </span>
                            </div>
                          </div>

                          {/* Quantity Controls & Line Price */}
                          <div className="flex items-center justify-between mt-2.5 pt-1">
                            <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 shadow-2xs">
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
                                className="h-8 w-8 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-l-md transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-zinc-900 select-none">
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
                                className="h-8 w-8 flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-r-md transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-black text-zinc-950">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-zinc-400 block font-medium">
                                  {formatPrice(item.price)} ea
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Footer Summary & Checkout */}
            <div className="border-t border-zinc-100 bg-white p-5 space-y-3 shrink-0 shadow-lg">
              {/* Promo Code Section */}
              <div>
                {couponCode ? (
                  /* Successful Promo State */
                  <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-800">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Tag className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Code <strong className="font-extrabold">{couponCode}</strong> applied</span>
                      <span className="text-emerald-700 font-black">
                        (-{formatPrice(discount)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-600 hover:text-emerald-950 hover:bg-emerald-100/60 p-1 rounded-md transition-colors font-bold text-xs"
                      aria-label="Remove coupon"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : isPromoOpen ? (
                  /* Promo Input Form */
                  <form onSubmit={handleApplyPromo} className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <Input
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          if (promoError) setPromoError(null);
                        }}
                        placeholder="Promo code (e.g. SOLE20)"
                        className={`h-9 rounded-xl text-xs uppercase bg-zinc-50 ${
                          promoError ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      <Button
                        type="submit"
                        disabled={isApplyingPromo || !promoInput.trim()}
                        size="sm"
                        className="h-9 px-3 rounded-xl bg-zinc-900 text-white font-bold text-xs hover:bg-zinc-800 shrink-0 cursor-pointer"
                      >
                        {isApplyingPromo ? "Applying..." : "Apply"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsPromoOpen(false);
                          setPromoError(null);
                        }}
                        className="h-9 px-2 text-zinc-500 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>

                    {/* Invalid Promo State */}
                    {promoError && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: [-6, 6, -4, 4, 0] }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200/60"
                      >
                        <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
                        <span>{promoError}</span>
                      </motion.div>
                    )}

                    {/* Quick Suggestions inside Promo Input */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] text-zinc-400">Try:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickPromo("SOLE20")}
                        className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded cursor-pointer hover:bg-amber-100"
                      >
                        SOLE20 (-20%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickPromo("WELCOME10")}
                        className="text-[10px] font-bold text-zinc-700 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded cursor-pointer hover:bg-zinc-200"
                      >
                        WELCOME10 (-10%)
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Promo Open Trigger */
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsPromoOpen(true)}
                      className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 font-semibold transition-colors cursor-pointer"
                    >
                      <Tag className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Have a promo code?</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPromo("SOLE20")}
                      className="text-[10px] text-amber-700 font-extrabold bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200/60 transition-colors cursor-pointer"
                    >
                      SOLE20 (20% OFF)
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span className="font-bold">-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Estimated Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200/50">
                        FREE
                      </span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Estimated Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>

                <Separator className="my-1.5 bg-zinc-200/80" />

                <div className="flex justify-between text-sm font-black text-zinc-950">
                  <span>Total</span>
                  <span className="text-base font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  className="w-full bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl h-11 text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  asChild
                >
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <Lock className="h-3.5 w-3.5" />
                    <span>Proceed to Checkout</span>
                    <span className="text-zinc-400">•</span>
                    <span>{formatPrice(total)}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full rounded-xl h-9 text-xs font-semibold text-zinc-700 hover:text-zinc-950 border-zinc-200 cursor-pointer"
                  asChild
                >
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    View Full Cart Page
                  </Link>
                </Button>
              </div>

              {/* Trust Reassurance */}
              <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-zinc-400 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" /> Stripe Secure
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-zinc-500" /> Fast Dispatch
                </span>
                <span>•</span>
                <span>30-Day Returns</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

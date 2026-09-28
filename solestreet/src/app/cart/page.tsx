"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Minus,
  Plus,
  X,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Truck,
  Shield,
  Lock,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
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

  const [promoInput, setPromoInput] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplying(true);
    try {
      const ok = await applyCoupon(promoInput);
      if (ok) setPromoInput("");
    } finally {
      setIsApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-zinc-400" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-2">
          Your bag is empty
        </h1>
        <p className="text-zinc-500 text-center max-w-md mb-8 text-sm">
          Looks like you haven&apos;t added any shoes yet. Start exploring to
          find your perfect pair.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-10"
        >
          <Link href="/shop">
            Start Shopping
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              Shopping Bag
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-red-600 text-xs font-semibold"
            onClick={clearCart}
          >
            Clear bag
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-0">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex gap-4 sm:gap-6 py-6 border-b border-zinc-100">
                    {/* Image */}
                    <Link
                      href={`/product/${item.slug}`}
                      className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-100"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                              {item.brand}
                            </p>
                            <Link
                              href={`/product/${item.slug}`}
                              className="font-bold text-base sm:text-lg text-zinc-900 hover:underline"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <p className="text-base sm:text-lg font-black text-zinc-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        <div className="mt-1 space-y-0.5 text-xs sm:text-sm text-zinc-500">
                          <p>
                            Color:{" "}
                            <span className="font-medium text-zinc-700">
                              {item.color}
                            </span>
                          </p>
                          <p>
                            Size:{" "}
                            <span className="font-medium text-zinc-700">
                              US {item.size}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Quantity & remove */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-zinc-200 rounded-xl bg-zinc-50">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity - 1
                              )
                            }
                            className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.color,
                                item.quantity + 1
                              )
                            }
                            className="p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.productId, item.size, item.color)
                          }
                          className="text-xs font-semibold text-zinc-400 hover:text-red-600 transition-colors flex items-center gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="pt-6">
              <Button variant="ghost" asChild className="text-zinc-600 hover:text-zinc-900">
                <Link href="/shop">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-zinc-50 rounded-2xl p-6 sm:p-8 space-y-6 border border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">
                Order Summary
              </h2>

              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <Input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code (e.g. SOLE20)"
                  className="rounded-xl h-10 bg-white uppercase text-xs"
                />
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isApplying}
                  className="rounded-xl h-10 px-5 shrink-0 text-xs font-semibold"
                >
                  Apply
                </Button>
              </form>

              {couponCode && (
                <div className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-xl text-xs text-emerald-800 font-medium border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Coupon {couponCode} applied (-{formatPrice(discount)})
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <Separator />

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-emerald-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Estimated Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-black text-zinc-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {shipping > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-zinc-500 bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                  Add{" "}
                  <span className="font-semibold text-amber-700">
                    {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                  </span>{" "}
                  more for free standard shipping
                </p>
              )}

              {/* Checkout button */}
              <Link href="/checkout" className="block">
                <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 text-sm font-bold shadow-sm">
                  <Lock className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </Link>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-4 pt-2">
                {[
                  { icon: Truck, label: `Free shipping $${FREE_SHIPPING_THRESHOLD}+` },
                  { icon: Shield, label: "256-bit Secure" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium"
                  >
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

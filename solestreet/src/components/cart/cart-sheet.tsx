"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";

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
    total,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-6 py-5 border-b border-zinc-100">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5" />
            Shopping Bag
            {itemCount > 0 && (
              <span className="text-sm font-normal text-zinc-500">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
              <ShoppingBag className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Your bag is empty
            </h3>
            <p className="text-sm text-zinc-500 mb-6 max-w-xs">
              Looks like you haven&apos;t added any shoes to your bag yet. Start
              shopping to find your perfect pair.
            </p>
            <Button
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-8"
              onClick={() => setIsOpen(false)}
              asChild
            >
              <Link href="/shop">
                Start Shopping
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex gap-4 py-4">
                      {/* Image */}
                      <Link
                        href={`/product/${item.slug}`}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-zinc-100 shrink-0"
                        onClick={() => setIsOpen(false)}
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </Link>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-zinc-500 font-medium">
                              {item.brand}
                            </p>
                            <Link
                              href={`/product/${item.slug}`}
                              className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 transition-colors line-clamp-1"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0 text-zinc-400 hover:text-zinc-900"
                            onClick={() =>
                              removeItem(item.productId, item.size, item.color)
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <p className="text-xs text-zinc-500 mt-1">
                          Size {item.size} · {item.color}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Quantity controls */}
                          <div className="flex items-center gap-1 bg-zinc-100 rounded-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-600 hover:text-zinc-900"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.size,
                                  item.color,
                                  item.quantity - 1
                                )
                              }
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold w-6 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-zinc-600 hover:text-zinc-900"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.size,
                                  item.color,
                                  item.quantity + 1
                                )
                              }
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <span className="text-sm font-bold text-zinc-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="bg-zinc-100" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Totals & checkout */}
            <div className="border-t border-zinc-100 px-6 py-5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <Separator className="bg-zinc-100" />
                <div className="flex justify-between text-base font-bold text-zinc-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-zinc-500 text-center">
                  Add{" "}
                  <span className="font-semibold text-zinc-700">
                    {formatPrice(150 - subtotal)}
                  </span>{" "}
                  more for free shipping
                </p>
              )}

              <Button
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl h-12 text-sm font-semibold"
                asChild
              >
                <Link href="/cart" onClick={() => setIsOpen(false)}>
                  View Bag & Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

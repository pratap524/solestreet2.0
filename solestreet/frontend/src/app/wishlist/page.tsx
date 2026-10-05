"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  Trash2,
  Sparkles,
  CheckCircle2,
  LogIn,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";
import type { Product, ShoeSize } from "@/types";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, count: wishlistCount } = useWishlist();
  const { addItem, setIsOpen: setCartOpen } = useCart();
  const { user } = useAuth();

  // Quick Add Modal state
  const [selectedProductForCart, setSelectedProductForCart] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ShoeSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  const handleOpenAddModal = (product: Product) => {
    setSelectedProductForCart(product);
    const availableSizes = product.sizes?.filter((s) => s.stock > 0) || [];
    setSelectedSize((availableSizes[0]?.size || 9) as ShoeSize);
    setSelectedColor(product.colors?.[0]?.name || product.selectedColor || "Standard");
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProductForCart || !selectedSize) return;

    addItem({
      productId: selectedProductForCart.id,
      name: selectedProductForCart.name,
      brand: selectedProductForCart.brand,
      price: selectedProductForCart.price,
      image: selectedProductForCart.images[0]?.url || "",
      size: selectedSize,
      color: selectedColor || "Standard",
      quantity: 1,
      slug: selectedProductForCart.slug,
    });

    toast.success(`Added ${selectedProductForCart.name} (US ${selectedSize}) to bag`);
    setSelectedProductForCart(null);
    setCartOpen(true);
  };

  const handleMoveAllToCart = () => {
    if (wishlistProducts.length === 0) return;
    let addedCount = 0;

    wishlistProducts.forEach((product) => {
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
      addedCount++;
    });

    toast.success(`Added ${addedCount} items to bag`);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-2">
          <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Wishlist</span>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  Your Wishlist
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                  {wishlistCount === 0
                    ? "No saved sneakers yet"
                    : `${wishlistCount} ${wishlistCount === 1 ? "sneaker" : "sneakers"} saved for your rotation`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {wishlistProducts.length > 0 && (
              <Button
                onClick={handleMoveAllToCart}
                className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold h-10 px-4 shadow-sm cursor-pointer"
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Move All to Bag
              </Button>
            )}

            {!user && (
              <Button
                asChild
                variant="outline"
                className="rounded-xl text-xs font-semibold border-zinc-200 hover:bg-zinc-100 h-10"
              >
                <Link href="/login?redirect=/wishlist">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Sign In to Sync
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Guest Warning / Value Banner */}
        {!user && wishlistProducts.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                These items are currently saved on this browser. <strong>Sign in</strong> to sync them across your phone, tablet, and laptop.
              </span>
            </div>
            <Link
              href="/login?redirect=/wishlist"
              className="font-bold text-amber-950 hover:underline shrink-0"
            >
              Sign In Now →
            </Link>
          </div>
        )}

        {/* Empty Wishlist State */}
        {wishlistProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-zinc-200/80 p-8 sm:p-14 text-center shadow-xs"
          >
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-rose-50 animate-ping opacity-25" />
              <div className="relative w-full h-full rounded-3xl bg-rose-50/60 border border-rose-100 flex items-center justify-center shadow-inner text-rose-500">
                <Heart className="h-10 w-10 stroke-[1.5] fill-rose-100 text-rose-400" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-600 shadow-xs">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-8 leading-relaxed">
              Never lose track of the heat you want. Click the heart icon on any sneaker to bookmark pairs for your next drop pickup.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl px-8 h-12 font-bold shadow-md cursor-pointer"
              >
                <Link href="/shop">
                  Explore Collections
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-xl px-8 h-12 font-semibold text-zinc-700 hover:text-zinc-950 border-zinc-200"
              >
                <Link href="/shop?sort=bestselling">Browse Bestsellers</Link>
              </Button>
            </div>

            {/* Category Discovery Pills */}
            <div className="mt-10 pt-8 border-t border-zinc-100 max-w-lg mx-auto">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">
                Discover By Category
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  { name: "Running", href: "/shop?category=running" },
                  { name: "Casual & Lifestyle", href: "/shop?category=casual" },
                  { name: "Basketball", href: "/shop?category=basketball" },
                  { name: "Skateboarding", href: "/shop?category=skateboarding" },
                  { name: "Hiking & Outdoor", href: "/shop?category=hiking" },
                ].map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Populated Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlistProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="group bg-white rounded-3xl border border-zinc-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail & Wishlist Remove Heart */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3.5 border border-zinc-100">
                      <Image
                        src={product.images[0]?.url || "/placeholder.png"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Brand Pill */}
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-zinc-200/80 text-zinc-800">
                        {product.brand}
                      </span>

                      {/* Remove From Wishlist Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id, product.name)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-rose-500 hover:bg-rose-50 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="h-4 w-4 fill-rose-500" />
                      </button>
                    </div>

                    {/* Shoe Details */}
                    <div>
                      <Link
                        href={`/product/${product.slug}`}
                        className="font-bold text-sm text-zinc-900 group-hover:text-zinc-600 transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-sm text-zinc-950">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-xs text-zinc-400 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50">
                          In Stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Add to Bag with Size Picker */}
                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                    <Button
                      onClick={() => handleOpenAddModal(product)}
                      className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold h-10 cursor-pointer"
                    >
                      <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                      Add to Bag
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleWishlist(product.id, product.name)}
                      className="rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 shrink-0 cursor-pointer"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Size Selection Dialog */}
        <Dialog
          open={!!selectedProductForCart}
          onOpenChange={(open) => !open && setSelectedProductForCart(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-black text-zinc-900">
                Choose Your Size
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500">
                Select your preferred shoe size and color to add {selectedProductForCart?.name} to your bag.
              </DialogDescription>
            </DialogHeader>

            {selectedProductForCart && (
              <div className="space-y-4 py-2">
                {/* Product Summary Preview */}
                <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-200/70">
                  <div className="relative w-14 h-14 rounded-xl bg-white overflow-hidden shrink-0 border border-zinc-200/60">
                    <Image
                      src={selectedProductForCart.images[0]?.url || "/placeholder.png"}
                      alt={selectedProductForCart.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">
                      {selectedProductForCart.name}
                    </h4>
                    <p className="text-xs font-black text-zinc-950 mt-0.5">
                      {formatPrice(selectedProductForCart.price)}
                    </p>
                  </div>
                </div>

                {/* Color Selection */}
                {selectedProductForCart.colors && selectedProductForCart.colors.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">
                      Color: <span className="font-semibold text-zinc-900">{selectedColor}</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedProductForCart.colors.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            selectedColor === c.name
                              ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                              : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/10"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2">
                    Select US Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProductForCart.sizes?.map((s) => {
                      const isSelected = selectedSize === s.size;
                      const isOutOfStock = s.stock === 0;

                      return (
                        <button
                          key={s.size}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedSize(s.size as ShoeSize)}
                          className={`py-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                            isOutOfStock
                              ? "border-zinc-100 bg-zinc-100 text-zinc-300 cursor-not-allowed line-through"
                              : isSelected
                              ? "border-zinc-900 bg-zinc-950 text-white shadow-sm ring-2 ring-zinc-900"
                              : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400"
                          }`}
                        >
                          US {s.size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3">
                  <Button
                    onClick={handleConfirmAddToCart}
                    className="w-full h-11 bg-zinc-950 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Confirm & Add to Bag
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

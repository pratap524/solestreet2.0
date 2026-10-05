"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingBag, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { useWishlist } from "@/context/wishlist-context";
import type { Product } from "@/types";
import { formatPrice, getDiscountPercentage } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  index?: number;
  showCategory?: boolean;
}

export function ProductCard({
  product,
  index = 0,
  showCategory = true,
}: ProductCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const inWishlist = isInWishlist(product.id);
  const discountPercent = hasDiscount
    ? getDiscountPercentage(product.price, product.compareAtPrice!)
    : 0;

  const hasMultipleImages = product.images && product.images.length > 1;
  const isOutOfStock =
    product.sizes && product.sizes.every((s) => s.stock === 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25) }}
      className="group relative flex flex-col h-full rounded-2xl transition-all duration-300"
    >
      {/* ── Image Container ────────────────────────────────────────── */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100/80 border border-zinc-200/70 shadow-2xs group-hover:shadow-md group-hover:border-zinc-300/80 transition-all duration-300">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full h-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 rounded-2xl"
          tabIndex={0}
          aria-label={`View details for ${product.name} by ${product.brand}`}
        >
          {/* Primary Image */}
          <Image
            src={product.images[0]?.url || "/placeholder-shoe.jpg"}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover object-center transition-all duration-500 ease-out ${
              hasMultipleImages
                ? "group-hover:opacity-0 group-hover:scale-105"
                : "group-hover:scale-105"
            }`}
          />

          {/* Secondary Hover Image (if available) */}
          {hasMultipleImages && (
            <Image
              src={product.images[1].url}
              alt={product.images[1].alt || `${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
            />
          )}
        </Link>

        {/* ── Badges Stack (Top-Left) ─────────────────────────────────── */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isOutOfStock ? (
            <Badge variant="secondary" className="bg-zinc-900/80 text-white backdrop-blur-md text-[10px] font-bold">
              SOLD OUT
            </Badge>
          ) : (
            <>
              {product.isNew && (
                <Badge variant="new" className="shadow-xs text-[10px] font-bold tracking-wider">
                  NEW
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="sale" className="shadow-xs text-[10px] font-bold">
                  -{discountPercent}%
                </Badge>
              )}
              {product.isBestseller && !product.isNew && (
                <Badge variant="bestseller" className="shadow-xs text-[10px] font-bold">
                  BESTSELLER
                </Badge>
              )}
            </>
          )}
        </div>

        {/* ── Wishlist Action Button (Top-Right) ──────────────────────── */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id, product.name);
          }}
          aria-label={
            inWishlist
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
          }
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-zinc-200/80 flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-white hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 transition-all duration-200"
        >
          <Heart
            className={`h-4 w-4 transition-all duration-200 ${
              inWishlist
                ? "fill-red-500 text-red-500 scale-110"
                : "text-zinc-600 group-hover/btn:text-zinc-900"
            }`}
          />
        </button>

        {/* ── Quick Action Overlay (Desktop Hover) ───────────────────── */}
        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-10 hidden sm:block">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/product/${product.slug}`);
            }}
            className="w-full bg-zinc-950/90 hover:bg-zinc-950 text-white backdrop-blur-md rounded-xl h-9 sm:h-10 text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Select Options</span>
            <ArrowRight className="h-3 w-3 opacity-60" />
          </button>
        </div>
      </div>

      {/* ── Product Information ────────────────────────────────────── */}
      <div className="pt-3 pb-1 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Category Label */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
            <span className="truncate">{product.brand}</span>
            {showCategory && product.category && (
              <span className="text-[10px] text-zinc-400 capitalize font-medium tracking-normal">
                {product.category}
              </span>
            )}
          </div>

          {/* Product Name */}
          <Link
            href={`/product/${product.slug}`}
            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded-sm"
          >
            <h3 className="font-bold text-zinc-950 text-sm sm:text-[15px] leading-snug group-hover:text-zinc-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="pt-1.5 flex items-center">
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          </div>
        </div>

        {/* Price & Colors Footer */}
        <div className="pt-2 flex items-center justify-between gap-2">
          {/* Price Stack */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-black text-zinc-950 text-sm sm:text-base tracking-tight">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-zinc-400 line-through font-normal">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Color Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div
              className="flex items-center gap-1 shrink-0"
              aria-label={`${product.colors.length} colors available`}
            >
              {product.colors.slice(0, 3).map((color) => (
                <span
                  key={color.name}
                  className="h-2.5 w-2.5 rounded-full border border-zinc-300/80 shadow-2xs"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
              {product.colors.length > 3 && (
                <span className="text-[10px] text-zinc-400 font-medium ml-0.5">
                  +{product.colors.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, StarHalf, ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/wishlist-context";
import type { Product } from "@/types";
import { formatPrice, getDiscountPercentage, getStarRating } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { full, half, empty } = getStarRating(product.rating);
  const hasDiscount = !!product.compareAtPrice;
  const inWishlist = isInWishlist(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <div className="group block relative">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3.5 border border-zinc-200/60 shadow-xs">
          <Link href={`/product/${product.slug}`} className="block w-full h-full">
            <Image
              src={product.images[0].url}
              alt={product.images[0].alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-108"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
            {product.isNew && (
              <Badge className="bg-zinc-950 text-white text-[10px] font-bold tracking-wider px-2.5 py-0.5 shadow-sm rounded-full">
                NEW
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white text-[10px] font-bold tracking-wider px-2.5 py-0.5 shadow-sm rounded-full">
                -{getDiscountPercentage(product.price, product.compareAtPrice!)}%
              </Badge>
            )}
            {product.isBestseller && !product.isNew && (
              <Badge className="bg-amber-500 text-zinc-950 text-[10px] font-bold tracking-wider px-2.5 py-0.5 shadow-sm rounded-full">
                BESTSELLER
              </Badge>
            )}
          </div>

          {/* Wishlist toggle button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id, product.name);
            }}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-zinc-200/50 flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                inWishlist ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
            <Button
              className="w-full bg-zinc-900/95 hover:bg-zinc-950 text-white backdrop-blur-md rounded-xl h-10 text-xs font-semibold shadow-md transition-all"
              onClick={(e) => {
                e.preventDefault();
                router.push(`/product/${product.slug}`);
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
              View Options
            </Button>
          </div>
        </div>

        {/* Info */}
        <Link href={`/product/${product.slug}`} className="block space-y-1.5 pt-1">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {product.brand}
          </p>
          <h3 className="font-semibold text-zinc-900 text-sm sm:text-base group-hover:text-zinc-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center">
              {Array.from({ length: full }).map((_, i) => (
                <Star
                  key={`full-${i}`}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
              {half && (
                <StarHalf className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              )}
              {Array.from({ length: empty }).map((_, i) => (
                <Star
                  key={`empty-${i}`}
                  className="h-3.5 w-3.5 text-zinc-300"
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-900">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-zinc-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          <div className="flex items-center gap-1.5 pt-1">
            {product.colors.map((color) => (
              <div
                key={color.name}
                className="h-3.5 w-3.5 rounded-full border border-zinc-200 shadow-2xs"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </Link>
      </div>
    </motion.div>
  );
}

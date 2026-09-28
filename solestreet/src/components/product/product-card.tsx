"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, StarHalf, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";
import { formatPrice, getDiscountPercentage, getStarRating } from "@/lib/format";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const router = useRouter();
  const { full, half, empty } = getStarRating(product.rating);
  const hasDiscount = !!product.compareAtPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        href={`/product/${product.slug}`}
        className="group block"
      >
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-4">
          <Image
            src={product.images[0].url}
            alt={product.images[0].alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-zinc-900 text-white hover:bg-zinc-900 text-xs font-semibold px-2.5 py-1">
                NEW
              </Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white hover:bg-red-500 text-xs font-semibold px-2.5 py-1">
                -{getDiscountPercentage(product.price, product.compareAtPrice!)}%
              </Badge>
            )}
            {product.isBestseller && !product.isNew && (
              <Badge className="bg-amber-500 text-white hover:bg-amber-500 text-xs font-semibold px-2.5 py-1">
                BESTSELLER
              </Badge>
            )}
          </div>

          {/* Quick add overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <Button
              className="w-full bg-zinc-900/90 hover:bg-zinc-900 text-white backdrop-blur-sm rounded-xl h-11 text-sm font-semibold"
              onClick={(e) => {
                e.preventDefault();
                // Navigate to product page for size selection
                router.push(`/product/${product.slug}`);
              }}
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              View Options
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
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
                className="h-4 w-4 rounded-full border border-zinc-200 shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full rounded-2xl">
      {/* Image container skeleton */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100/80 border border-zinc-200/70 p-3">
        <Skeleton className="w-full h-full rounded-xl" />
        {/* Wishlist button skeleton */}
        <Skeleton className="absolute top-3 right-3 w-9 h-9 rounded-full" />
      </div>

      {/* Info skeleton */}
      <div className="pt-3 pb-1 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-3 w-12 rounded-md" />
        </div>
        <Skeleton className="h-4 w-4/5 rounded-md" />
        <div className="flex items-center gap-1.5 pt-0.5">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-3 w-8 rounded-md" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24 rounded-md" />
          <div className="flex gap-1">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

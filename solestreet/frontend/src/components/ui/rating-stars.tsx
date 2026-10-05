"use client";

import * as React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStarRating } from "@/lib/format";

interface RatingStarsProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  reviewCount?: number;
  showCountText?: boolean;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-6 w-6",
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = "sm",
  interactive = false,
  onRatingChange,
  reviewCount,
  showCountText = true,
  className,
  ...props
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);
  const displayRating = hoverRating !== null ? hoverRating : rating;
  const { full, half, empty } = getStarRating(displayRating);

  const starSize = sizeMap[size];

  if (interactive) {
    return (
      <div
        className={cn("flex items-center gap-1", className)}
        onMouseLeave={() => setHoverRating(null)}
        {...props}
      >
        {Array.from({ length: maxRating }).map((_, i) => {
          const starValue = i + 1;
          const isFilled = displayRating >= starValue;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onRatingChange?.(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              className="p-0.5 rounded-sm hover:scale-115 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
              aria-label={`Rate ${starValue} of ${maxRating} stars`}
            >
              <Star
                className={cn(
                  starSize,
                  "transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400"
                    : "fill-zinc-100 text-zinc-300"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)} {...props}>
      <div className="flex items-center">
        {Array.from({ length: full }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(starSize, "fill-amber-400 text-amber-400")}
            aria-hidden="true"
          />
        ))}
        {half && (
          <StarHalf
            className={cn(starSize, "fill-amber-400 text-amber-400")}
            aria-hidden="true"
          />
        )}
        {Array.from({ length: empty }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(starSize, "text-zinc-300")}
            aria-hidden="true"
          />
        ))}
      </div>
      {typeof reviewCount === "number" && showCountText && (
        <span className="text-xs font-medium text-zinc-500">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

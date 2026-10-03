import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-950 text-white shadow-2xs hover:bg-zinc-800",
        secondary:
          "border-zinc-200/80 bg-zinc-100 text-zinc-800 hover:bg-zinc-200",
        destructive:
          "border-transparent bg-red-500 text-white shadow-2xs hover:bg-red-600",
        outline:
          "text-zinc-900 border-zinc-200 bg-transparent",
        sale:
          "border-transparent bg-red-500 text-white font-bold tracking-wider text-[10px] uppercase shadow-2xs",
        bestseller:
          "border-transparent bg-amber-400 text-zinc-950 font-bold tracking-wider text-[10px] uppercase shadow-2xs",
        new:
          "border-transparent bg-zinc-950 text-white font-bold tracking-wider text-[10px] uppercase shadow-2xs",
        success:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        warning:
          "border-amber-500/20 bg-amber-500/10 text-amber-700",
        info:
          "border-blue-500/20 bg-blue-500/10 text-blue-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

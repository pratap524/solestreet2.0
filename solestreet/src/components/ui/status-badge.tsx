import * as React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "unfulfilled"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "paid"
  | "pending"
  | "failed"
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "active"
  | "inactive"
  | "expired"
  | "admin"
  | "customer";

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  dot?: boolean;
}

const statusStyles: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  unfulfilled: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  processing: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500 animate-pulse",
  },
  shipped: {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
  },
  delivered: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  cancelled: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },
  refunded: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-700 dark:text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-500",
  },
  paid: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  pending: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
  },
  failed: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },
  "in-stock": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  "low-stock": {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500 animate-pulse",
  },
  "out-of-stock": {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-500",
  },
  active: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  inactive: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-400",
  },
  expired: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-400",
  },
  admin: {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
  },
  customer: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-700 dark:text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-400",
  },
};

export function StatusBadge({
  status,
  dot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const normalized = (status || "unfulfilled").toLowerCase().replace(/\s+/g, "-");
  const style = statusStyles[normalized] || statusStyles.unfulfilled;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border capitalize",
        style.bg,
        style.text,
        style.border,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.dot)}
          aria-hidden="true"
        />
      )}
      {status}
    </span>
  );
}

import * as React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryLabel,
  secondaryHref,
  onSecondaryAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white border border-zinc-200/70 shadow-xs",
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 flex items-center justify-center mb-5 text-zinc-400">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 stroke-[1.5]" />
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {actionLabel && actionHref && (
          <Button asChild size="lg" className="rounded-xl px-7 font-bold">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button size="lg" className="rounded-xl px-7 font-bold" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
        {secondaryLabel && secondaryHref && (
          <Button asChild variant="outline" size="lg" className="rounded-xl px-7">
            <Link href={secondaryHref}>{secondaryLabel}</Link>
          </Button>
        )}
        {secondaryLabel && onSecondaryAction && !secondaryHref && (
          <Button variant="outline" size="lg" className="rounded-xl px-7" onClick={onSecondaryAction}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

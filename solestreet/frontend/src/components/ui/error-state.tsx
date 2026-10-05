import * as React from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  actionLabel?: string;
  actionHref?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred while processing your request. Please try again or return to the store.",
  onRetry,
  actionLabel,
  actionHref = "/",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-3xl bg-white border border-red-200/80 shadow-xs",
        className
      )}
      {...props}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-50 border border-red-200/50 flex items-center justify-center mb-5 text-red-500">
        <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 stroke-[1.5]" />
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-sm text-zinc-500 max-w-md leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onRetry && (
          <Button size="lg" className="rounded-xl px-7 font-bold gap-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        )}
        <Button asChild variant="outline" size="lg" className="rounded-xl px-7">
          <Link href={actionHref}>{actionLabel || "Return to Home"}</Link>
        </Button>
      </div>
    </div>
  );
}

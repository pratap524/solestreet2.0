import * as React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  showHomeIcon?: boolean;
}

export function Breadcrumbs({
  items,
  showHomeIcon = true,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)} {...props}>
      <ol className="flex items-center flex-wrap gap-1.5 text-xs text-zinc-500 font-medium">
        {showHomeIcon && (
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="text-zinc-500 hover:text-zinc-950 transition-colors p-1 rounded-md hover:bg-zinc-100"
              aria-label="Home"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>
          </li>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;

          return (
            <li key={index} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3 text-zinc-400 shrink-0" aria-hidden="true" />
              {isLast || !item.href ? (
                <span
                  className="font-bold text-zinc-950 truncate max-w-[200px] sm:max-w-xs"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-zinc-950 transition-colors truncate max-w-[160px] sm:max-w-xs"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

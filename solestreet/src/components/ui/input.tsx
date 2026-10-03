import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 transition-all duration-150 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-semibold placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-1 focus-visible:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50 shadow-2xs",
          error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

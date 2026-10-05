"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error("Application Error Boundary caught an exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center shadow-lg">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Something went wrong
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">
          {error.message || "An unexpected error occurred while rendering this page. Our team has been notified."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-full py-2.5 px-5"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-full border-neutral-300 dark:border-neutral-700 py-2.5 px-5"
          >
            <Link href="/">
              <Home className="h-4 w-4" /> Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

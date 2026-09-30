"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.length >= 2
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Search Shoes</DialogTitle>
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for shoes, brands, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm sm:text-base placeholder:text-zinc-400 bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md hover:bg-zinc-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-5 py-8 text-center text-sm text-zinc-500">
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-zinc-500">
                No results found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="p-3">
                <p className="px-2 py-1.5 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors"
                      onClick={() => onOpenChange(false)}
                    >
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 shrink-0">
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-500 font-medium">
                          {product.brand}
                        </p>
                        <p className="text-sm font-semibold text-zinc-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm font-bold text-zinc-700">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

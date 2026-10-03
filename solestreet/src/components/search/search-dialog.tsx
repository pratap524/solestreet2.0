"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowUpRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { RatingStars } from "@/components/ui/rating-stars";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/format";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim().length >= 2
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
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-3xl border border-zinc-200/90 bg-white shadow-2xl [&>button]:hidden">
        <DialogTitle className="sr-only">Search Sneakers & Drops</DialogTitle>
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <Search className="h-5 w-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by model, brand, or category (e.g. Nike, Running)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 outline-none text-sm sm:text-base font-medium placeholder:text-zinc-400 bg-transparent text-zinc-900"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-lg hover:bg-zinc-200/60 transition-colors text-zinc-400 hover:text-zinc-700 cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim().length < 2 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-zinc-900 mb-1">
                Explore The Collection
              </p>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Type at least 2 characters to search across our complete inventory of rare sneakers and running shoes.
              </p>

              {/* Popular Search Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
                {["Running", "Air Max", "Jordan", "New Balance", "Basketball"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-base font-bold text-zinc-900 mb-1">
                No matching sneakers found
              </p>
              <p className="text-xs text-zinc-400">
                We couldn&apos;t find anything for &ldquo;{query}&rdquo;. Try another brand or category.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {results.length} Silhouette{results.length !== 1 ? "s" : ""} Found
              </p>
              <AnimatePresence>
                {results.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.2) }}
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-100/80 transition-all"
                      onClick={() => onOpenChange(false)}
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200/70">
                        <Image
                          src={product.images[0].url}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            {product.brand}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200/60 text-zinc-600 font-semibold capitalize">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-zinc-600 transition-colors mt-0.5">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-black text-zinc-950">
                            {formatPrice(product.price)}
                          </span>
                          <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
                        </div>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-zinc-200/50 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center text-zinc-400 transition-all shrink-0">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

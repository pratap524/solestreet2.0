"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon, Filter, X, ArrowUpDown } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { ShoeCategory, ShoeGender, SortOption, Product } from "@/types";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<ShoeCategory | "all">("all");
  const [selectedGender, setSelectedGender] = useState<ShoeGender | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [maxPrice, setMaxPrice] = useState<number>(300);

  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      // Search term matching
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false;
      }

      // Gender filter
      if (selectedGender !== "all" && product.gender !== selectedGender && product.gender !== "unisex") {
        return false;
      }

      // Price filter
      if (product.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a: Product, b: Product) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "bestselling":
          return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
        case "newest":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [query, selectedCategory, selectedGender, maxPrice, sortBy]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Search Input */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-sm border border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, brand, category, or keyword..."
              className="pl-12 pr-10 py-6 text-base rounded-xl border-neutral-300 dark:border-neutral-700 focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {query && (
            <p className="text-center text-sm text-neutral-500 mt-3">
              Showing results for <span className="font-semibold text-neutral-900 dark:text-neutral-100">"{query}"</span> — {filteredProducts.length} items found
            </p>
          )}
        </div>

        {/* Filter Controls & Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </h3>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedGender("all");
                    setMaxPrice(300);
                  }}
                  className="text-xs text-neutral-500 hover:text-black dark:hover:text-white underline"
                >
                  Reset all
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ShoeCategory | "all")}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-sm text-neutral-900 dark:text-neutral-100"
                >
                  <option value="all">All Categories</option>
                  <option value="running">Running</option>
                  <option value="casual">Casual</option>
                  <option value="basketball">Basketball</option>
                  <option value="skateboarding">Skateboarding</option>
                  <option value="hiking">Hiking</option>
                  <option value="training">Training</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as ShoeGender | "all")}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-sm text-neutral-900 dark:text-neutral-100"
                >
                  <option value="all">All Genders</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
                  <span>Max Price</span>
                  <span className="text-neutral-900 dark:text-neutral-100">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-black dark:accent-white"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2 flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2 text-sm text-neutral-900 dark:text-neutral-100"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="bestselling">Best Sellers</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-12 text-center border border-neutral-200 dark:border-neutral-800">
                <SearchIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  No matching sneakers found
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
                  Try adjusting your keywords, expanding your price range, or clearing filters.
                </p>
                <Button
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory("all");
                    setSelectedGender("all");
                    setMaxPrice(300);
                  }}
                  className="rounded-full px-6"
                >
                  Clear Filters & Search
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8 text-center">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

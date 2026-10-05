"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { Search as SearchIcon, Filter, X, ArrowUpDown, Sparkles } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
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
    return products
      .filter((product: Product) => {
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
      })
      .sort((a: Product, b: Product) => {
        switch (sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          case "bestselling":
            return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "newest":
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [query, selectedCategory, selectedGender, maxPrice, sortBy]);

  const handleClear = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedGender("all");
    setMaxPrice(300);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Search", href: "/search" }, { label: query ? `"${query}"` : "All" }]} />
        </div>

        {/* Header Search Input */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-zinc-200/80 mb-8">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, brand, category, or keyword..."
              className="pl-12 pr-10 h-14 text-base rounded-2xl border-zinc-200 focus-visible:ring-zinc-950"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                aria-label="Clear search input"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {query && (
            <p className="text-center text-xs sm:text-sm text-zinc-500 mt-3 font-medium">
              Showing results for <span className="font-bold text-zinc-950">&ldquo;{query}&rdquo;</span> —{" "}
              <span className="font-bold text-zinc-950">{filteredProducts.length}</span> items found
            </p>
          )}
        </div>

        {/* Filter Controls & Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/80 shadow-xs space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="font-bold text-zinc-950 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Filter className="h-4 w-4 text-zinc-500" /> Filters
                </h3>
                <button
                  onClick={handleClear}
                  className="text-xs text-zinc-500 hover:text-zinc-950 underline font-semibold cursor-pointer"
                >
                  Reset all
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ShoeCategory | "all")}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
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
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as ShoeGender | "all")}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
                >
                  <option value="all">All Genders</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
                  <span>Max Price</span>
                  <span className="text-zinc-950 font-black">{formatPrice(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="300"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-zinc-950 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2 flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" /> Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-xl border border-zinc-200 bg-white p-2.5 text-xs font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
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
              <EmptyState
                icon={Sparkles}
                title="No matching sneakers found"
                description="Try adjusting your keywords, expanding your price range, or clearing filters."
                actionLabel="Reset Search & Filters"
                onAction={handleClear}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product: Product, i: number) => (
                  <ProductCard key={product.id} product={product} index={i} />
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
    <Suspense fallback={<div className="min-h-screen p-8 text-center text-zinc-500">Loading search results...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}

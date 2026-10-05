"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  Grid2X2,
  Grid3X3,
  X,
  Search,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import {
  products as allProducts,
  getAllBrands,
  categoryLabels,
} from "@/data/products";
import { formatPrice } from "@/lib/format";
import type { ShoeSize, Product } from "@/types";

const sortOptions = [
  { value: "default", label: "Featured" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "bestselling", label: "Top Bestselling" },
  { value: "rating", label: "Customer Rating" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
];

const genderOptions = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const availableSizes: ShoeSize[] = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-950 flex items-center justify-between">
        <span>{title}</span>
      </h4>
      {children}
    </div>
  );
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlCategory = searchParams.get("category") || "";
  const urlGender = searchParams.get("gender") || "";
  const urlSort = searchParams.get("sort") || "default";
  const urlBrand = searchParams.get("brand") || "";
  const urlQuery = searchParams.get("q") || "";

  const [category, setCategory] = useState(urlCategory);
  const [gender, setGender] = useState(urlGender);
  const [sort, setSort] = useState(urlSort);
  const [brand, setBrand] = useState(urlBrand);
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [selectedSize, setSelectedSize] = useState<ShoeSize | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  // Sync state when URL params change
  useEffect(() => {
    setCategory(urlCategory);
    setGender(urlGender);
    setSort(urlSort);
    setBrand(urlBrand);
    setSearchQuery(urlQuery);
  }, [urlCategory, urlGender, urlSort, urlBrand, urlQuery]);

  const brands = useMemo(() => getAllBrands(), []);

  // Multi-dimensional filtering logic
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((product: Product) => {
        // Keyword Search Filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            product.name.toLowerCase().includes(q) ||
            product.brand.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q) ||
            product.description.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Category Filter
        if (category && product.category !== category) {
          return false;
        }

        // Gender Filter
        if (gender && product.gender !== gender && product.gender !== "unisex") {
          return false;
        }

        // Brand Filter
        if (brand && product.brand !== brand) {
          return false;
        }

        // Size Filter
        if (selectedSize !== null) {
          const hasSizeInStock = product.sizes.some(
            (s) => s.size === selectedSize && s.stock > 0
          );
          if (!hasSizeInStock) return false;
        }

        // Max Price Filter
        if (product.price > maxPrice) {
          return false;
        }

        return true;
      })
      .sort((a: Product, b: Product) => {
        switch (sort) {
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
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "default":
          default:
            return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        }
      });
  }, [category, gender, brand, searchQuery, selectedSize, maxPrice, sort]);

  const activeFilterCount = [
    category,
    gender,
    brand,
    searchQuery,
    selectedSize !== null,
    maxPrice < 300,
  ].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setCategory("");
    setGender("");
    setBrand("");
    setSearchQuery("");
    setSelectedSize(null);
    setMaxPrice(300);
    setSort("default");
    router.push("/shop");
  }, [router]);

  // Dynamic breadcrumb hierarchy
  const breadcrumbItems = useMemo(() => {
    const items = [{ label: "Shop", href: "/shop" }];
    if (category) {
      items.push({ label: categoryLabels[category] || category, href: `/shop?category=${category}` });
    }
    if (gender) {
      items.push({
        label: `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s`,
        href: `/shop?gender=${gender}`,
      });
    }
    if (brand) {
      items.push({ label: brand, href: `/shop?brand=${brand}` });
    }
    return items;
  }, [category, gender, brand]);

  // Sidebar & Sheet Filter Content
  const filterContent = (
    <div className="space-y-6">
      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const isSelected = category === key;
            return (
              <Button
                key={key}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`rounded-xl text-xs h-8 px-3 font-semibold transition-all ${
                  isSelected ? "bg-zinc-950 text-white shadow-xs" : "text-zinc-700 hover:text-zinc-950"
                }`}
                onClick={() => setCategory(isSelected ? "" : key)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      </FilterSection>

      <Separator className="bg-zinc-200/80" />

      {/* Gender */}
      <FilterSection title="Gender">
        <div className="flex flex-wrap gap-1.5">
          {genderOptions.map((opt) => {
            const isSelected = gender === opt.value;
            return (
              <Button
                key={opt.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`rounded-xl text-xs h-8 px-3 font-semibold transition-all ${
                  isSelected ? "bg-zinc-950 text-white shadow-xs" : "text-zinc-700 hover:text-zinc-950"
                }`}
                onClick={() => setGender(isSelected ? "" : opt.value)}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
      </FilterSection>

      <Separator className="bg-zinc-200/80" />

      {/* Size Grid */}
      <FilterSection title="Shoe Size (US)">
        <div className="grid grid-cols-4 gap-1.5">
          {availableSizes.map((size) => {
            const isSelected = selectedSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(isSelected ? null : size)}
                className={`h-8 rounded-lg text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                  isSelected
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-xs"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-400 hover:text-zinc-950"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <Separator className="bg-zinc-200/80" />

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="flex flex-wrap gap-1.5">
          {brands.map((b) => {
            const isSelected = brand === b;
            return (
              <Button
                key={b}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className={`rounded-xl text-xs h-8 px-3 font-semibold transition-all ${
                  isSelected ? "bg-zinc-950 text-white shadow-xs" : "text-zinc-700 hover:text-zinc-950"
                }`}
                onClick={() => setBrand(isSelected ? "" : b)}
              >
                {b}
              </Button>
            );
          })}
        </div>
      </FilterSection>

      <Separator className="bg-zinc-200/80" />

      {/* Price Slider */}
      <FilterSection title="Max Price">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-950">
            <span className="text-zinc-500">Budget Limit:</span>
            <span className="text-sm font-black">{formatPrice(maxPrice)}</span>
          </div>
          <input
            type="range"
            min="60"
            max="300"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-zinc-950 h-2 bg-zinc-200 rounded-lg cursor-pointer"
            aria-label="Filter by maximum price"
          />
          <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
            <span>{formatPrice(60)}</span>
            <span>{formatPrice(300)}+</span>
          </div>
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <>
          <Separator className="bg-zinc-200/80" />
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-600 hover:text-red-600 w-full font-bold text-xs flex items-center justify-center gap-1.5"
            onClick={clearFilters}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Page Header Bar */}
      <div className="bg-white border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight uppercase">
                {category
                  ? categoryLabels[category] || "Collection"
                  : gender
                  ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Footwear`
                  : brand
                  ? `${brand} Collection`
                  : "All Footwear"}
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 font-medium">
                Showing <span className="font-bold text-zinc-900">{filteredProducts.length}</span> curated silhouettes
              </p>
            </div>

            {/* Quick Search In Catalog */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 rounded-xl text-xs bg-zinc-50 border-zinc-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  aria-label="Clear catalog search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="font-black text-zinc-950 text-sm uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <Badge className="bg-zinc-950 text-white text-[10px] font-bold px-2 py-0.5">
                    {activeFilterCount} Active
                  </Badge>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Main Catalog View */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Mobile Filter Sheet Trigger */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 px-4">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="ml-2 h-5 w-5 rounded-full bg-zinc-950 text-white text-[10px] font-black flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-84 p-0 flex flex-col bg-white">
                    <SheetHeader className="p-6 border-b border-zinc-100 shrink-0">
                      <SheetTitle className="font-black text-lg uppercase tracking-tight">Refine Footwear</SheetTitle>
                    </SheetHeader>
                    <div className="p-6 flex-1 overflow-y-auto">{filterContent}</div>
                    <div className="p-4 border-t border-zinc-100 bg-white shrink-0">
                      <Button
                        className="w-full rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-12 text-sm"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        View {filteredProducts.length} Product{filteredProducts.length === 1 ? "" : "s"}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Active Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {category && (
                    <Badge
                      variant="secondary"
                      className="rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold cursor-pointer hover:bg-zinc-200"
                      onClick={() => setCategory("")}
                    >
                      {categoryLabels[category]}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {gender && (
                    <Badge
                      variant="secondary"
                      className="rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold cursor-pointer hover:bg-zinc-200"
                      onClick={() => setGender("")}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {brand && (
                    <Badge
                      variant="secondary"
                      className="rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold cursor-pointer hover:bg-zinc-200"
                      onClick={() => setBrand("")}
                    >
                      {brand}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {selectedSize !== null && (
                    <Badge
                      variant="secondary"
                      className="rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold cursor-pointer hover:bg-zinc-200"
                      onClick={() => setSelectedSize(null)}
                    >
                      Size US {selectedSize}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {maxPrice < 300 && (
                    <Badge
                      variant="secondary"
                      className="rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold cursor-pointer hover:bg-zinc-200"
                      onClick={() => setMaxPrice(300)}
                    >
                      Under {formatPrice(maxPrice)}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge
                      variant="secondary"
                      className="rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold cursor-pointer hover:bg-zinc-200"
                      onClick={() => setSearchQuery("")}
                    >
                      &ldquo;{searchQuery}&rdquo;
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right: Grid Toggle & Sorting */}
              <div className="flex items-center gap-2.5 ml-auto">
                {/* Desktop Grid Layout Switcher */}
                <div className="hidden md:flex items-center bg-zinc-200/60 rounded-xl p-1 border border-zinc-200">
                  <button
                    type="button"
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      gridCols === 3 ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-950"
                    }`}
                    onClick={() => setGridCols(3)}
                    aria-label="Display 3 columns grid"
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      gridCols === 4 ? "bg-white text-zinc-950 shadow-xs" : "text-zinc-500 hover:text-zinc-950"
                    }`}
                    onClick={() => setGridCols(4)}
                    aria-label="Display 4 columns grid"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                </div>

                {/* Sorting Select */}
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[190px] rounded-xl text-xs font-semibold h-10 bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Grid or Empty State */}
            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No silhouettes matched your criteria"
                description="Try broadening your price range, clearing specific sizes, or searching with alternative keywords."
                actionLabel="Reset All Filters"
                onAction={clearFilters}
              />
            ) : (
              <div
                className={`grid grid-cols-2 gap-4 sm:gap-6 ${
                  gridCols === 3
                    ? "md:grid-cols-3"
                    : "md:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {filteredProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafaf9]">
          <div className="bg-white border-b border-zinc-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <div className="h-4 w-32 bg-zinc-200 rounded-md animate-pulse mb-3" />
              <div className="h-10 w-64 bg-zinc-200 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProductGridSkeleton count={8} />
          </div>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  );
}

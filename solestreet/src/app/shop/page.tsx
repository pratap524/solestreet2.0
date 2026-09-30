"use client";

import { useState, useMemo, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  Grid2X2,
  Grid3X3,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/product/product-skeleton";
import {
  filterAndSortProducts,
  getAllBrands,
  categoryLabels,
} from "@/data/products";

const sortOptions = [
  { value: "default", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "bestselling", label: "Bestselling" },
  { value: "name-asc", label: "Name: A to Z" },
];

const genderOptions = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-1">
        {title}
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
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

  const [category, setCategory] = useState(urlCategory);
  const [gender, setGender] = useState(urlGender);
  const [sort, setSort] = useState(urlSort);
  const [brand, setBrand] = useState(urlBrand);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  // Sync local state when URL search params change (e.g., navbar navigation)
  useEffect(() => {
    setCategory(urlCategory);
    setGender(urlGender);
    setSort(urlSort);
    setBrand(urlBrand);
  }, [urlCategory, urlGender, urlSort, urlBrand]);

  const brands = useMemo(() => getAllBrands(), []);

  const products = useMemo(() => {
    return filterAndSortProducts(
      {
        category: category || undefined,
        gender: gender || undefined,
        brand: brand || undefined,
      },
      sort === "default" ? undefined : sort
    );
  }, [category, gender, sort, brand]);

  const activeFilterCount = [category, gender, brand].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setCategory("");
    setGender("");
    setBrand("");
    setSort("default");
    router.push("/shop");
  }, [router]);

  const filterContent = (
    <div className="space-y-6">
      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={category === key ? "default" : "outline"}
              size="sm"
              className={`rounded-full text-xs h-8 ${
                category === key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              onClick={() => setCategory(category === key ? "" : key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Gender */}
      <FilterSection title="Gender">
        <div className="flex flex-wrap gap-2">
          {genderOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={gender === opt.value ? "default" : "outline"}
              size="sm"
              className={`rounded-full text-xs h-8 ${
                gender === opt.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              onClick={() => setGender(gender === opt.value ? "" : opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Brand */}
      <FilterSection title="Brand">
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <Button
              key={b}
              variant={brand === b ? "default" : "outline"}
              size="sm"
              className={`rounded-full text-xs h-8 ${
                brand === b
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
              onClick={() => setBrand(brand === b ? "" : b)}
            >
              {b}
            </Button>
          ))}
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <>
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-zinc-900 w-full"
            onClick={clearFilters}
          >
            <X className="h-4 w-4 mr-1" />
            Clear all filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <div className="bg-zinc-50 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            {category
              ? categoryLabels[category] || "Shop"
              : gender
              ? `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Shoes`
              : "All Shoes"}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-900">Filters</h3>
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {activeFilterCount} active
                  </Badge>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                {/* Mobile filter trigger */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-1 bg-zinc-900 text-white text-xs h-5 w-5 p-0 flex items-center justify-center">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0 flex flex-col">
                    <SheetHeader className="p-6 border-b border-zinc-100 shrink-0">
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="p-6 flex-1 overflow-y-auto">{filterContent}</div>
                    <div className="p-4 border-t border-zinc-100 bg-white shrink-0">
                      <Button
                        className="w-full rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold h-11"
                        onClick={() => setMobileFiltersOpen(false)}
                      >
                        View {products.length} Product{products.length === 1 ? "" : "s"}
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Active filter pills */}
                <div className="hidden sm:flex items-center gap-2">
                  {category && (
                    <Badge
                      variant="secondary"
                      className="rounded-full cursor-pointer hover:bg-zinc-200"
                      onClick={() => setCategory("")}
                    >
                      {categoryLabels[category]}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {gender && (
                    <Badge
                      variant="secondary"
                      className="rounded-full cursor-pointer hover:bg-zinc-200"
                      onClick={() => setGender("")}
                    >
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {brand && (
                    <Badge
                      variant="secondary"
                      className="rounded-full cursor-pointer hover:bg-zinc-200"
                      onClick={() => setBrand("")}
                    >
                      {brand}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Grid toggle */}
                <div className="hidden md:flex items-center bg-zinc-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${
                      gridCols === 3 ? "bg-white shadow-sm" : ""
                    }`}
                    onClick={() => setGridCols(3)}
                    aria-label="3 columns"
                  >
                    <Grid2X2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${
                      gridCols === 4 ? "bg-white shadow-sm" : ""
                    }`}
                    onClick={() => setGridCols(4)}
                    aria-label="4 columns"
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Sort */}
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[180px] rounded-xl text-sm h-9">
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

            {/* Product grid */}
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-zinc-500 mb-6">
                  Try adjusting your filters to find what you&apos;re looking for.
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 gap-4 sm:gap-6 ${
                  gridCols === 3
                    ? "md:grid-cols-3"
                    : "md:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {products.map((product, i) => (
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
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="bg-zinc-50 border-b border-zinc-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="h-10 w-48 bg-zinc-200 rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-zinc-200 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    }>
      <ShopPageContent />
    </Suspense>
  );
}

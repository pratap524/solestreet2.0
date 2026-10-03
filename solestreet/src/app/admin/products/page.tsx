"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Copy,
  ExternalLink,
  Filter,
  ArrowUpDown,
  Check,
  RefreshCw,
  Package,
  Tag,
  DollarSign,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Image as ImageIcon,
  SlidersHorizontal,
  ArrowDownRight,
  TrendingDown,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/admin-data";
import { formatPrice, slugify } from "@/lib/format";
import { toast } from "sonner";
import type {
  Product,
  ShoeCategory,
  ShoeGender,
  ShoeSize,
  SizeStock,
  ProductImage,
  ShoeColor,
} from "@/types";

const PAGE_SIZE = 10;

const CATEGORIES: { value: ShoeCategory; label: string }[] = [
  { value: "running", label: "Running" },
  { value: "casual", label: "Casual" },
  { value: "basketball", label: "Basketball" },
  { value: "skateboarding", label: "Skateboarding" },
  { value: "hiking", label: "Hiking" },
  { value: "training", label: "Training" },
];

const GENDERS: { value: ShoeGender; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const STANDARD_SIZES: ShoeSize[] = [
  7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13, 14,
];

function getDefaultSizes(): SizeStock[] {
  return STANDARD_SIZES.map((sz) => ({
    size: sz,
    stock: sz >= 8.5 && sz <= 11 ? 12 : 6,
  }));
}

function EmptyForm(): Omit<Product, "id" | "createdAt" | "updatedAt"> {
  return {
    name: "",
    slug: "",
    brand: "",
    description: "",
    longDescription: "",
    price: 0,
    compareAtPrice: undefined,
    category: "casual",
    gender: "unisex",
    colors: [{ name: "Core Black", hex: "#111111" }],
    selectedColor: "Core Black",
    sizes: getDefaultSizes(),
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        alt: "Sneaker Primary Angle",
      },
    ],
    features: ["Engineered Mesh Upper", "Responsive Air Cushioning"],
    rating: 4.8,
    reviewCount: 0,
    isFeatured: false,
    isNew: true,
    isBestseller: false,
  };
}

type SortField = "name" | "price" | "stock" | "brand";
type SortDirection = "asc" | "desc";
type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterStock, setFilterStock] = useState<StockFilter>("all");
  const [filterFlag, setFilterFlag] = useState<"all" | "featured" | "new" | "bestseller">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id" | "createdAt" | "updatedAt">>(EmptyForm());
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "sizes" | "images" | "details">("general");
  const [isSaving, setIsSaving] = useState(false);
  const [bulkSizeInput, setBulkSizeInput] = useState<string>("10");
  const [newFeatureInput, setNewFeatureInput] = useState("");

  // Delete State
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reload products
  const reloadProducts = useCallback(() => {
    setProducts(adminGetProducts());
  }, []);

  useEffect(() => {
    reloadProducts();
  }, [reloadProducts]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const total = products.length;
    let totalPairs = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const stock = p.sizes.reduce((acc, s) => acc + s.stock, 0);
      totalPairs += stock;
      const isOut = stock === 0 || p.sizes.every((s) => s.stock === 0);
      const isLow = !isOut && p.sizes.some((s) => s.stock <= 5);
      if (isOut) outOfStockCount++;
      else if (isLow) lowStockCount++;
    });

    const inStockCount = total - lowStockCount - outOfStockCount;

    return {
      total,
      totalPairs,
      inStockCount,
      lowStockCount,
      outOfStockCount,
    };
  }, [products]);

  // Filtering & Sorting
  const filtered = useMemo(() => {
    let result = [...products];

    // Search query across name, brand, slug, features
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.features?.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Category Filter
    if (filterCat !== "all") {
      result = result.filter((p) => p.category === filterCat);
    }

    // Gender Filter
    if (filterGender !== "all") {
      result = result.filter((p) => p.gender === filterGender);
    }

    // Stock Filter
    if (filterStock !== "all") {
      result = result.filter((p) => {
        const total = p.sizes.reduce((acc, s) => acc + s.stock, 0);
        const isOut = total === 0 || p.sizes.every((s) => s.stock === 0);
        const isLow = !isOut && p.sizes.some((s) => s.stock <= 5);

        if (filterStock === "out-of-stock") return isOut;
        if (filterStock === "low-stock") return isLow;
        if (filterStock === "in-stock") return !isOut && !isLow;
        return true;
      });
    }

    // Merchandising Flag Filter
    if (filterFlag !== "all") {
      if (filterFlag === "featured") result = result.filter((p) => p.isFeatured);
      if (filterFlag === "new") result = result.filter((p) => p.isNew);
      if (filterFlag === "bestseller") result = result.filter((p) => p.isBestseller);
    }

    // Sort
    result.sort((a, b) => {
      let comp = 0;
      if (sortField === "name") {
        comp = a.name.localeCompare(b.name);
      } else if (sortField === "brand") {
        comp = a.brand.localeCompare(b.brand);
      } else if (sortField === "price") {
        comp = a.price - b.price;
      } else if (sortField === "stock") {
        const stockA = a.sizes.reduce((sum, s) => sum + s.stock, 0);
        const stockB = b.sizes.reduce((sum, s) => sum + s.stock, 0);
        comp = stockA - stockB;
      }
      return sortDir === "asc" ? comp : -comp;
    });

    return result;
  }, [products, search, filterCat, filterGender, filterStock, filterFlag, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetFilters = () => {
    setSearch("");
    setFilterCat("all");
    setFilterGender("all");
    setFilterStock("all");
    setFilterFlag("all");
    setPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    filterCat !== "all" ||
    filterGender !== "all" ||
    filterStock !== "all" ||
    filterFlag !== "all";

  // CRUD Handlers
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setForm(EmptyForm());
    setActiveTab("general");
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    // Ensure all standard sizes are present in form
    const existingSizesMap = new Map(product.sizes.map((s) => [s.size, s.stock]));
    const unifiedSizes: SizeStock[] = STANDARD_SIZES.map((sz) => ({
      size: sz,
      stock: existingSizesMap.get(sz) ?? 0,
    }));

    setForm({
      ...product,
      sizes: unifiedSizes,
      colors: product.colors?.length ? product.colors : [{ name: "Core Black", hex: "#111111" }],
      features: product.features || [],
    });
    setActiveTab("general");
    setDialogOpen(true);
  };

  const handleDuplicate = (product: Product) => {
    const copyName = `${product.name} (Copy)`;
    const newSlug = slugify(copyName) + `-${Date.now().toString(36).slice(-4)}`;
    const { id: _id, createdAt: _created, updatedAt: _updated, ...rest } = product;
    const copyData: Omit<Product, "id" | "createdAt" | "updatedAt"> = {
      ...rest,
      name: copyName,
      slug: newSlug,
      isNew: true,
    };
    adminCreateProduct(copyData);
    reloadProducts();
    toast.success(`Duplicated "${product.name}" as "${copyName}"`);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!form.name.trim()) {
      toast.error("Product name is required.");
      setActiveTab("general");
      return;
    }
    if (!form.brand.trim()) {
      toast.error("Brand name is required.");
      setActiveTab("general");
      return;
    }
    if (form.price <= 0) {
      toast.error("Price must be greater than $0.00.");
      setActiveTab("pricing");
      return;
    }
    if (form.compareAtPrice && form.compareAtPrice <= form.price) {
      toast.warning("Compare-at price is lower or equal to retail price. Discount will not show.");
    }
    const validImages = form.images.filter((img) => img.url.trim().length > 0);
    if (validImages.length === 0) {
      toast.error("At least one valid image URL is required.");
      setActiveTab("images");
      return;
    }

    setIsSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const cleanedImages = validImages.map((img, i) => ({
        url: img.url.trim(),
        alt: img.alt.trim() || `${form.name} - view ${i + 1}`,
      }));

      const preparedData = {
        ...form,
        name: form.name.trim(),
        brand: form.brand.trim(),
        slug,
        images: cleanedImages,
        description: form.description.trim(),
        longDescription: form.longDescription.trim(),
        features: form.features.filter((f) => f.trim().length > 0),
      };

      if (editingProduct) {
        adminUpdateProduct(editingProduct.id, preparedData);
        toast.success(`"${form.name}" updated successfully.`);
      } else {
        adminCreateProduct(preparedData);
        toast.success(`"${form.name}" created successfully.`);
      }

      reloadProducts();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteProduct) return;
    setIsDeleting(true);
    try {
      adminDeleteProduct(deleteProduct.id);
      reloadProducts();
      toast.success(`"${deleteProduct.name}" permanently deleted.`);
      setDeleteProduct(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Size bulk update
  const handleBulkSetSizes = () => {
    const val = parseInt(bulkSizeInput, 10);
    if (isNaN(val) || val < 0) {
      toast.error("Please enter a valid stock number.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => ({ ...s, stock: val })),
    }));
    toast.success(`All size stocks set to ${val}.`);
  };

  // Image helpers
  const handleAddImage = () => {
    setForm((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        {
          url: "",
          alt: `${prev.name} - image ${prev.images.length + 1}`,
        },
      ],
    }));
  };

  const handleRemoveImage = (index: number) => {
    if (form.images.length <= 1) {
      toast.error("A product must have at least one image.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleMakePrimaryImage = (index: number) => {
    if (index === 0) return;
    setForm((prev) => {
      const copy = [...prev.images];
      const [selected] = copy.splice(index, 1);
      copy.unshift(selected);
      return { ...prev, images: copy };
    });
    toast.success("Primary image updated.");
  };

  // Colorway helpers
  const handleAddColor = () => {
    setForm((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: "New Colorway", hex: "#3b82f6" }],
    }));
  };

  const handleRemoveColor = (index: number) => {
    if (form.colors.length <= 1) {
      toast.error("Product must have at least one colorway.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  // Feature tag helpers
  const handleAddFeature = () => {
    if (!newFeatureInput.trim()) return;
    if (form.features.includes(newFeatureInput.trim())) {
      toast.warning("Feature tag already added.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureInput.trim()],
    }));
    setNewFeatureInput("");
  };

  const handleRemoveFeature = (feat: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feat),
    }));
  };

  // Real-time calculations
  const totalStockForm = useMemo(() => {
    return form.sizes.reduce((sum, s) => sum + s.stock, 0);
  }, [form.sizes]);

  const discountPercentForm = useMemo(() => {
    if (!form.compareAtPrice || form.compareAtPrice <= form.price) return 0;
    return Math.round(((form.compareAtPrice - form.price) / form.compareAtPrice) * 100);
  }, [form.price, form.compareAtPrice]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Product Catalog
            </h1>
            <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-bold px-2 py-0.5 text-xs">
              {products.length} Models
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            Manage sneaker silhouettes, retail pricing, size-run inventory, and merchandising tags.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={reloadProducts}
            className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 h-10 px-3 text-xs font-semibold shadow-xs"
            title="Reload products"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={handleOpenCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-10 px-4 font-semibold text-xs sm:text-sm shadow-xs transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Sneaker
          </Button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Vault Pairs</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">
              {telemetry.totalPairs.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Across {telemetry.total} unique models</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
            <Package className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Healthy Stock</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
              {telemetry.inStockCount}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">All sizes optimal (&gt;5 pairs)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Low Stock Alert</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">
              {telemetry.lowStockCount}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">&le; 5 units in select sizes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Out of Stock</p>
            <h3 className="text-xl sm:text-2xl font-black text-red-600 mt-0.5">
              {telemetry.outOfStockCount}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Zero inventory remaining</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by shoe name, brand, SKU slug, features..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 pr-8 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-10 text-xs sm:text-sm focus-visible:ring-1 focus-visible:ring-zinc-900 focus-visible:bg-white"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Selects */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            {/* Category Select */}
            <select
              value={filterCat}
              onChange={(e) => {
                setFilterCat(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            {/* Gender Select */}
            <select
              value={filterGender}
              onChange={(e) => {
                setFilterGender(e.target.value);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All Genders</option>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>

            {/* Stock Status Select */}
            <select
              value={filterStock}
              onChange={(e) => {
                setFilterStock(e.target.value as StockFilter);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock (&gt;5)</option>
              <option value="low-stock">Low Stock Alert (&le;5)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>

            {/* Merchandising Badges Select */}
            <select
              value={filterFlag}
              onChange={(e) => {
                setFilterFlag(e.target.value as any);
                setPage(1);
              }}
              className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
            >
              <option value="all">All Badges</option>
              <option value="featured">Featured Only</option>
              <option value="new">New Arrivals Only</option>
              <option value="bestseller">Bestsellers Only</option>
            </select>
          </div>
        </div>

        {/* Filter Pills & Active Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-zinc-100 text-xs text-zinc-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-zinc-600">Showing {filtered.length} of {products.length} products</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-6 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-medium"
              >
                Clear all filters
              </Button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-zinc-400">Sort:</span>
            <button
              onClick={() => {
                setSortField("name");
                setSortDir(sortField === "name" && sortDir === "asc" ? "desc" : "asc");
              }}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                sortField === "name" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Name {sortField === "name" && (sortDir === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                setSortField("price");
                setSortDir(sortField === "price" && sortDir === "asc" ? "desc" : "asc");
              }}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                sortField === "price" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Price {sortField === "price" && (sortDir === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => {
                setSortField("stock");
                setSortDir(sortField === "stock" && sortDir === "asc" ? "desc" : "asc");
              }}
              className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                sortField === "stock" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Stock {sortField === "stock" && (sortDir === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-4 py-3.5">Product & SKU</th>
                <th className="px-4 py-3.5 hidden md:table-cell">Category / Gender</th>
                <th className="px-4 py-3.5">Pricing</th>
                <th className="px-4 py-3.5">Stock & Status</th>
                <th className="px-4 py-3.5 hidden lg:table-cell">Merchandising</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginated.map((product) => {
                const totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0);
                const isOutOfStock = totalStock === 0 || product.sizes.every((s) => s.stock === 0);
                const hasLowStock = !isOutOfStock && product.sizes.some((s) => s.stock <= 5);
                const statusLabel = isOutOfStock
                  ? "out-of-stock"
                  : hasLowStock
                  ? "low-stock"
                  : "in-stock";

                const discountPct =
                  product.compareAtPrice && product.compareAtPrice > product.price
                    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                    : 0;

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-zinc-50/80 transition-colors group"
                  >
                    {/* Sneaker Thumbnail, Name, Brand & Slug */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200/60 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-zinc-300" />
                          )}
                          {product.colors[0] && (
                            <span
                              className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-white shadow-xs"
                              style={{ backgroundColor: product.colors[0].hex }}
                              title={`Color: ${product.colors[0].name}`}
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-zinc-900 text-xs sm:text-sm truncate">
                              {product.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1 rounded">
                              {product.brand}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-zinc-400 font-mono truncate max-w-[150px] sm:max-w-[220px]">
                              /{product.slug}
                            </span>
                            <Link
                              href={`/product/${product.slug}`}
                              target="_blank"
                              className="text-zinc-400 hover:text-zinc-800 transition-colors p-0.5"
                              title="View on live store"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category & Gender */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex flex-col gap-1 items-start">
                        <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-semibold text-[10px] capitalize">
                          {product.category}
                        </Badge>
                        <span className="text-[11px] text-zinc-500 capitalize pl-0.5">
                          {product.gender}
                        </span>
                      </div>
                    </td>

                    {/* Pricing & Discounts */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-zinc-900 text-xs sm:text-sm">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-[11px] text-zinc-400 line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        {discountPct > 0 ? (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                            <TrendingDown className="h-3 w-3" />
                            <span>-{discountPct}% OFF</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 mt-0.5">Standard MSRP</span>
                        )}
                      </div>
                    </td>

                    {/* Stock & Status */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={statusLabel} />
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                          <span className="font-semibold text-zinc-900">{totalStock}</span>
                          <span>pairs</span>
                          <span className="text-zinc-300">•</span>
                          <span className="text-[10px] text-zinc-400">
                            {product.sizes.length} sizes
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Merchandising Flags */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {product.isFeatured && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                            Featured
                          </span>
                        )}
                        {product.isNew && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            New Arrival
                          </span>
                        )}
                        {product.isBestseller && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500 text-amber-500" />
                            Bestseller
                          </span>
                        )}
                        {!product.isFeatured && !product.isNew && !product.isBestseller && (
                          <span className="text-[11px] text-zinc-400 italic">None</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          onClick={() => handleOpenEdit(product)}
                          title="Edit product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                          onClick={() => handleDuplicate(product)}
                          title="Duplicate model"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => setDeleteProduct(product)}
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 px-4">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 mb-1">No products found</h4>
                      <p className="text-xs text-zinc-500 mb-4">
                        {hasActiveFilters
                          ? "No items match your active search and filter criteria. Try resetting them."
                          : "Your catalog is empty. Click below to add your first sneaker."}
                      </p>
                      {hasActiveFilters ? (
                        <Button
                          variant="outline"
                          onClick={resetFilters}
                          className="rounded-xl text-xs font-semibold h-8"
                        >
                          Reset Filters
                        </Button>
                      ) : (
                        <Button
                          onClick={handleOpenCreate}
                          className="bg-zinc-900 text-white rounded-xl text-xs font-semibold h-8"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Sneaker
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-zinc-50/50 border-t border-zinc-200">
            <p className="text-xs text-zinc-500">
              Showing{" "}
              <span className="font-semibold text-zinc-900">
                {(page - 1) * PAGE_SIZE + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-zinc-900">
                {Math.min(page * PAGE_SIZE, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-zinc-900">{filtered.length}</span> items
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-semibold transition-colors ${
                      page === p
                        ? "bg-zinc-900 text-white shadow-xs"
                        : "text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Comprehensive Product Create / Edit Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[96vw] max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white text-zinc-900 rounded-2xl border-zinc-200 shadow-2xl">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-zinc-50/50">
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-zinc-900">
                {editingProduct ? `Edit "${editingProduct.name}"` : "Add New Sneaker"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 mt-0.5">
                {editingProduct
                  ? "Update silhouette specifications, pricing rules, size inventory, and digital assets."
                  : "Create a new sneaker model and publish it immediately to the store catalog."}
              </DialogDescription>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center px-6 border-b border-zinc-200/80 bg-white overflow-x-auto shrink-0 gap-1">
            {[
              { id: "general", label: "General Info", icon: Package },
              { id: "pricing", label: "Pricing & Discounts", icon: DollarSign },
              { id: "sizes", label: "Size Inventory", icon: Layers, badge: `${totalStockForm} units` },
              { id: "images", label: "Media & Images", icon: ImageIcon, badge: `${form.images.length}` },
              { id: "details", label: "Tags & Features", icon: Tag },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-zinc-900 text-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TAB 1: General Info */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Air Max Pulse Drift"
                      value={form.name}
                      disabled={isSaving}
                      onChange={(e) => {
                        const newName = e.target.value;
                        setForm((prev) => ({
                          ...prev,
                          name: newName,
                          slug: editingProduct ? prev.slug : slugify(newName),
                        }));
                      }}
                      className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                      Brand <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Nike, Jordan, adidas"
                      value={form.brand}
                      disabled={isSaving}
                      onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                      className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-xs sm:text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                      URL Slug / SKU
                    </label>
                    <Input
                      placeholder="auto-generated-slug"
                      value={form.slug}
                      disabled={isSaving}
                      onChange={(e) => setForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                      className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Category</label>
                    <select
                      value={form.category}
                      disabled={isSaving}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, category: e.target.value as ShoeCategory }))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold focus:ring-1 focus:ring-zinc-900"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Gender</label>
                    <select
                      value={form.gender}
                      disabled={isSaving}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, gender: e.target.value as ShoeGender }))
                      }
                      className="w-full h-10 px-3 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-xs font-semibold focus:ring-1 focus:ring-zinc-900"
                    >
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                    Short Hook Description
                  </label>
                  <Input
                    placeholder="Crisp 1-line summary shown on preview cards..."
                    value={form.description}
                    disabled={isSaving}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                    Full Product Story & Specifications
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed craftsmanship narrative, technical upper details, cushion technology..."
                    value={form.longDescription}
                    disabled={isSaving}
                    onChange={(e) => setForm((prev) => ({ ...prev, longDescription: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-900 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-zinc-900 resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Pricing & Discounts */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                      Retail Price (USD) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="160.00"
                        value={form.price || ""}
                        disabled={isSaving}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            price: Math.max(0, parseFloat(e.target.value) || 0),
                          }))
                        }
                        className="pl-8 bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm font-bold"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Active customer purchase price.
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                      Compare-at Price (MSRP)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="200.00"
                        value={form.compareAtPrice || ""}
                        disabled={isSaving}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setForm((prev) => ({
                            ...prev,
                            compareAtPrice: isNaN(val) ? undefined : val,
                          }));
                        }}
                        className="pl-8 bg-white border-zinc-200 text-zinc-900 rounded-xl text-sm font-bold"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Original manufacturer price for strikethrough markdown.
                    </p>
                  </div>
                </div>

                {/* Real-time Discount & Savings Badge Calculator */}
                <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4 text-emerald-600" />
                    Live Discount Analysis
                  </h4>
                  {discountPercentForm > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-black text-xs px-2.5 py-0.5">
                            {discountPercentForm}% DISCOUNT APPLIED
                          </Badge>
                          <span className="text-xs font-semibold text-emerald-700">
                            Save {formatPrice((form.compareAtPrice || 0) - form.price)} per pair
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Shoppers will see an MSRP strikethrough badge of{" "}
                          <span className="line-through">{formatPrice(form.compareAtPrice || 0)}</span> down to{" "}
                          <span className="font-bold text-zinc-900">{formatPrice(form.price)}</span>.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500">
                      No markdown active. Set a Compare-at Price higher than ${form.price || "0"} to highlight promotional savings.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Inventory by Size */}
            {activeTab === "sizes" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">
                      Total In-Vault Stock: {totalStockForm} Pairs
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Manage real inventory quantity for each standard US sneaker size.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium text-zinc-500">Bulk set:</span>
                      <Input
                        type="number"
                        min="0"
                        value={bulkSizeInput}
                        onChange={(e) => setBulkSizeInput(e.target.value)}
                        className="w-16 h-8 text-xs font-bold bg-white text-center rounded-lg"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleBulkSetSizes}
                      className="h-8 text-xs font-semibold rounded-lg bg-white border-zinc-300"
                    >
                      Apply to All
                    </Button>
                  </div>
                </div>

                {/* Size Stock Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {form.sizes.map((item, index) => {
                    const isLow = item.stock > 0 && item.stock <= 5;
                    const isOut = item.stock === 0;

                    return (
                      <div
                        key={item.size}
                        className={`p-3 rounded-xl border transition-colors ${
                          isOut
                            ? "bg-red-50/50 border-red-200"
                            : isLow
                            ? "bg-amber-50/50 border-amber-200"
                            : "bg-white border-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black text-zinc-900">
                            US {item.size}
                          </span>
                          {isOut ? (
                            <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1 rounded">
                              OUT
                            </span>
                          ) : isLow ? (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                              LOW
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                              OK
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...form.sizes];
                              copy[index].stock = Math.max(0, copy[index].stock - 1);
                              setForm({ ...form, sizes: copy });
                            }}
                            className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm shrink-0"
                          >
                            -
                          </button>
                          <Input
                            type="number"
                            min="0"
                            value={item.stock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const copy = [...form.sizes];
                              copy[index].stock = isNaN(val) ? 0 : Math.max(0, val);
                              setForm({ ...form, sizes: copy });
                            }}
                            className="h-7 text-xs font-bold text-center bg-white border-zinc-200 p-0"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const copy = [...form.sizes];
                              copy[index].stock = copy[index].stock + 1;
                              setForm({ ...form, sizes: copy });
                            }}
                            className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 flex items-center justify-center font-bold text-sm shrink-0"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: Media & Image URLs */}
            {activeTab === "images" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Product Images</h4>
                    <p className="text-[11px] text-zinc-500">
                      Provide high-resolution image URLs. First image serves as the primary storefront hero.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddImage}
                    className="text-xs font-semibold rounded-xl border-zinc-200 bg-white"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add URL
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.images.map((img, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-zinc-200 bg-white flex flex-col sm:flex-row items-start sm:items-center gap-3"
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="w-16 h-16 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {img.url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img.url}
                            alt={img.alt || "preview"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).style.display = "none";
                            }}
                          />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-zinc-300" />
                        )}
                        {i === 0 && (
                          <span className="absolute top-1 left-1 bg-zinc-900 text-white text-[8px] font-black px-1 rounded shadow-xs">
                            HERO
                          </span>
                        )}
                      </div>

                      {/* Inputs */}
                      <div className="flex-1 w-full space-y-1.5">
                        <Input
                          placeholder="https://images.unsplash.com/..."
                          value={img.url}
                          disabled={isSaving}
                          onChange={(e) => {
                            const updated = [...form.images];
                            updated[i] = { ...updated[i], url: e.target.value };
                            setForm({ ...form, images: updated });
                          }}
                          className="bg-zinc-50 border-zinc-200 text-xs font-mono h-8"
                        />
                        <Input
                          placeholder="Alt tag / image angle description"
                          value={img.alt}
                          disabled={isSaving}
                          onChange={(e) => {
                            const updated = [...form.images];
                            updated[i] = { ...updated[i], alt: e.target.value };
                            setForm({ ...form, images: updated });
                          }}
                          className="bg-white border-zinc-200 text-[11px] h-7"
                        />
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        {i !== 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMakePrimaryImage(i)}
                            className="text-[11px] text-zinc-600 hover:text-zinc-900 h-8 px-2"
                          >
                            Set Hero
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={form.images.length <= 1}
                          onClick={() => handleRemoveImage(i)}
                          className="text-zinc-400 hover:text-red-600 h-8 w-8"
                          title="Remove image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Specs, Colorways & Merchandising Tags */}
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Merchandising Toggles */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 mb-2">Merchandising Flags</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        key: "isFeatured" as const,
                        label: "Featured Model",
                        desc: "Promote on homepage showcase carousel",
                      },
                      {
                        key: "isNew" as const,
                        label: "New Arrival",
                        desc: "Tag with green New badge",
                      },
                      {
                        key: "isBestseller" as const,
                        label: "Bestseller",
                        desc: "Display gold star rating badge",
                      },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          form[item.key]
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form[item.key]}
                          onChange={(e) => setForm({ ...form, [item.key]: e.target.checked })}
                          className="mt-0.5 rounded text-zinc-900 focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-bold">{item.label}</p>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              form[item.key] ? "text-zinc-300" : "text-zinc-400"
                            }`}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colorways */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-zinc-700">Colorways & Hex Swatches</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddColor}
                      className="text-xs font-semibold h-7 rounded-lg"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Color
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {form.colors.map((color, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => {
                            const copy = [...form.colors];
                            copy[i].hex = e.target.value;
                            setForm({ ...form, colors: copy });
                          }}
                          className="w-9 h-9 rounded-lg border border-zinc-200 cursor-pointer p-0.5 bg-white"
                          title="Choose swatch color"
                        />
                        <Input
                          placeholder="Colorway Name (e.g. Wolf Grey / Infrared)"
                          value={color.name}
                          onChange={(e) => {
                            const copy = [...form.colors];
                            copy[i].name = e.target.value;
                            setForm({ ...form, colors: copy });
                          }}
                          className="bg-white border-zinc-200 text-xs h-9 font-medium flex-1"
                        />
                        <Input
                          placeholder="#000000"
                          value={color.hex}
                          onChange={(e) => {
                            const copy = [...form.colors];
                            copy[i].hex = e.target.value;
                            setForm({ ...form, colors: copy });
                          }}
                          className="bg-zinc-50 border-zinc-200 text-xs font-mono h-9 w-24 text-center"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={form.colors.length <= 1}
                          onClick={() => handleRemoveColor(i)}
                          className="h-9 w-9 text-zinc-400 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Tags Chips */}
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 mb-1.5">Product Feature Chips</h4>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add key sneaker feature (e.g. Zoom Air Unit, Vibram Outsole)..."
                      value={newFeatureInput}
                      onChange={(e) => setNewFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      className="bg-white border-zinc-200 text-xs h-9"
                    />
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      className="bg-zinc-900 text-white rounded-xl text-xs font-semibold h-9 px-3"
                    >
                      Add Tag
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-zinc-50 border border-zinc-200">
                    {form.features.map((feat) => (
                      <span
                        key={feat}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-zinc-200 text-zinc-800 shadow-2xs"
                      >
                        {feat}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(feat)}
                          className="text-zinc-400 hover:text-rose-600 ml-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {form.features.length === 0 && (
                      <span className="text-xs text-zinc-400 italic">No feature tags added yet.</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <span>MSRP: {formatPrice(form.price)}</span>
              <span>•</span>
              <span>{totalStockForm} units total</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={isSaving}
                onClick={() => setDialogOpen(false)}
                className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 font-semibold text-xs h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-xs sm:text-sm h-10 px-5 shadow-xs"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingProduct ? "Save Changes" : "Create Sneaker"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteProduct} onOpenChange={() => !isDeleting && setDeleteProduct(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-black text-zinc-900">
              Permanently Delete Sneaker?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-1">
              This action cannot be undone. It will remove the sneaker from storefront discovery, order tracking references, and inventory stock pools.
            </DialogDescription>
          </DialogHeader>

          {deleteProduct && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-3 my-2">
              <div className="w-12 h-12 rounded-lg bg-zinc-200 overflow-hidden shrink-0">
                {deleteProduct.images[0]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={deleteProduct.images[0].url}
                    alt={deleteProduct.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-900 truncate">{deleteProduct.name}</p>
                <p className="text-[11px] text-zinc-500">
                  {deleteProduct.brand} • {formatPrice(deleteProduct.price)}
                </p>
                <p className="text-[10px] font-mono text-zinc-400">ID: {deleteProduct.id}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteProduct(null)}
              className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
            >
              Keep Product
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDeleteConfirm}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs h-10 shadow-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

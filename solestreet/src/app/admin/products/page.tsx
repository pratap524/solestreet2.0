"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import type { Product, ShoeCategory, ShoeGender } from "@/types";

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

function EmptyForm(): Omit<Product, "id" | "createdAt" | "updatedAt"> {
  return {
    name: "",
    slug: "",
    brand: "",
    description: "",
    longDescription: "",
    price: 0,
    category: "running",
    gender: "unisex",
    colors: [{ name: "Black", hex: "#000000" }],
    selectedColor: "Black",
    sizes: [
      { size: 8, stock: 10 },
      { size: 9, stock: 10 },
      { size: 10, stock: 10 },
      { size: 11, stock: 10 },
    ],
    images: [{ url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80", alt: "" }],
    features: [],
    rating: 0,
    reviewCount: 0,
    isFeatured: false,
    isNew: true,
    isBestseller: false,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EmptyForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setProducts(adminGetProducts());
  }, []);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }
    if (filterCat) {
      result = result.filter((p) => p.category === filterCat);
    }
    return result;
  }, [products, search, filterCat]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(EmptyForm());
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({ ...product });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.brand || form.price <= 0) {
      toast.error("Please fill in name, brand, and a valid price.");
      return;
    }
    const slug = form.slug || slugify(form.name);
    const imageAlt = form.images[0]?.alt || `${form.name} - product image`;
    const updatedForm = {
      ...form,
      slug,
      images: form.images.map((img, i) => ({
        ...img,
        alt: img.alt || (i === 0 ? imageAlt : `${form.name} - image ${i + 1}`),
      })),
    };

    if (editingProduct) {
      adminUpdateProduct(editingProduct.id, updatedForm);
      toast.success(`${form.name} updated successfully`);
    } else {
      adminCreateProduct(updatedForm);
      toast.success(`${form.name} created successfully`);
    }
    setProducts(adminGetProducts());
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    adminDeleteProduct(id);
    setProducts(adminGetProducts());
    setDeleteConfirm(null);
    toast.success("Product deleted");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Products</h1>
          <p className="text-sm text-zinc-500">{products.length} total products</p>
        </div>
        <Button onClick={openCreate} className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search & filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl h-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCat === "" ? "default" : "outline"}
            size="sm"
            className={`rounded-xl text-xs ${filterCat === "" ? "bg-white text-zinc-900" : "border-zinc-700 text-zinc-400 hover:text-white"}`}
            onClick={() => { setFilterCat(""); setPage(1); }}
          >
            All
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={filterCat === cat.value ? "default" : "outline"}
              size="sm"
              className={`rounded-xl text-xs ${filterCat === cat.value ? "bg-white text-zinc-900" : "border-zinc-700 text-zinc-400 hover:text-white"}`}
              onClick={() => { setFilterCat(filterCat === cat.value ? "" : cat.value); setPage(1); }}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Products table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden md:table-cell">Category</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden lg:table-cell">Stock</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-right text-xs font-semibold text-zinc-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((product) => {
                const totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0);
                const lowStock = product.sizes.some((s) => s.stock <= 5);
                return (
                  <tr key={product.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.images[0]?.url} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{product.name}</p>
                          <p className="text-[10px] text-zinc-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px] capitalize">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white text-xs">{formatPrice(product.price)}</p>
                      {product.compareAtPrice && (
                        <p className="text-[10px] text-zinc-500 line-through">{formatPrice(product.compareAtPrice)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white font-medium">{totalStock}</span>
                        {lowStock && <AlertTriangle className="h-3 w-3 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex gap-1.5 flex-wrap">
                        {product.isFeatured && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Featured</Badge>}
                        {product.isNew && <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">New</Badge>}
                        {product.isBestseller && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]"><Star className="h-2.5 w-2.5 mr-0.5" />Best</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white" onClick={() => openEdit(product)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400" onClick={() => setDeleteConfirm(product.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500 text-sm">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Brand *</label>
                <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Price *</label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Compare At Price</label>
                <Input type="number" step="0.01" value={form.compareAtPrice || ""} onChange={(e) => setForm({ ...form, compareAtPrice: parseFloat(e.target.value) || undefined })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ShoeCategory })}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm"
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as ShoeGender })}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm"
                >
                  {GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Short Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Long Description</label>
              <textarea
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm resize-none"
              />
            </div>

            {/* Images */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Product Images</label>
              {form.images.map((img, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <Input
                    value={img.url}
                    onChange={(e) => {
                      const updated = [...form.images];
                      updated[i] = { ...updated[i], url: e.target.value };
                      setForm({ ...form, images: updated });
                    }}
                    placeholder="Image URL"
                    className="bg-zinc-800 border-zinc-700 text-white rounded-xl flex-1"
                  />
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-zinc-500 hover:text-red-400 shrink-0"
                    onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                    disabled={form.images.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs border-zinc-700 text-zinc-400 hover:text-white rounded-xl"
                onClick={() => setForm({ ...form, images: [...form.images, { url: "", alt: "" }] })}
              >
                <Plus className="h-3 w-3 mr-1" /> Add Image
              </Button>
            </div>

            {/* Flags */}
            <div className="flex flex-wrap gap-4">
              {(["isFeatured", "isNew", "isBestseller"] as const).map((flag) => (
                <label key={flag} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[flag]}
                    onChange={(e) => setForm({ ...form, [flag]: e.target.checked })}
                    className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-blue-500"
                  />
                  <span className="text-xs text-zinc-300 capitalize">
                    {flag === "isFeatured" ? "Featured" : flag === "isNew" ? "New Arrival" : "Bestseller"}
                  </span>
                </label>
              ))}
            </div>

            <Button onClick={handleSave} className="w-full bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold">
              <Save className="h-4 w-4 mr-2" />
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300 rounded-xl" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Save, FolderTree, RefreshCw } from "lucide-react";
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
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "@/lib/admin-data";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadCategories = useCallback(() => {
    setCategories(adminGetCategories());
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      isActive: cat.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Category name is required.");
      return;
    }
    const slug = form.slug.trim() || slugify(form.name);
    if (editing) {
      adminUpdateCategory(editing.id, { ...form, slug });
      toast.success(`Category "${form.name}" updated successfully.`);
    } else {
      adminCreateCategory({
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        isActive: form.isActive,
      });
      toast.success(`Category "${form.name}" created successfully.`);
    }
    loadCategories();
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    adminDeleteCategory(id);
    loadCategories();
    setDeleteConfirm(null);
    toast.success("Category deleted.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Product Categories
            </h1>
            <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-bold px-2 py-0.5 text-xs">
              {categories.length} Taxonomies
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            Structure your footwear taxonomy across silhouette types, sports disciplines, and lifestyle collections.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadCategories}
            className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 h-10 px-3 text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={openCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-10 px-4 font-semibold text-xs sm:text-sm shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-zinc-300 transition-all shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-700 shrink-0">
                <FolderTree className="h-5 w-5" />
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                  onClick={() => openEdit(cat)}
                  title="Edit Category"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => setDeleteConfirm(cat.id)}
                  title="Delete Category"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-zinc-900">{cat.name}</h3>
              <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                {cat.description || "No description provided."}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs text-zinc-500">
              <StatusBadge status={cat.isActive ? "active" : "inactive"} />
              <span className="font-semibold text-zinc-700">{cat.productCount} models</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-900">
              {editing ? "Edit Category" : "Create Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Configure category naming, slug identifier, and visibility.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Category Name *</label>
              <Input
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: editing ? form.slug : slugify(e.target.value),
                  })
                }
                placeholder="e.g. Trail Running"
                className="bg-zinc-50 border-zinc-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">URL Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                className="bg-zinc-50 border-zinc-200 font-mono text-xs rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="Brief category summary..."
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-xs sm:text-sm resize-none focus:outline-hidden focus:ring-1 focus:ring-zinc-900"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl border border-zinc-200 bg-zinc-50">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-zinc-900 focus:ring-0"
              />
              <span className="text-xs font-bold text-zinc-900">Active & Discoverable</span>
            </label>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-xs h-10 shadow-xs"
              >
                {editing ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-900">Delete Category?</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-1">
              Are you sure you want to permanently delete this category taxonomy?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs h-10 shadow-xs"
            >
              Delete Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

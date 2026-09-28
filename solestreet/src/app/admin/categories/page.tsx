"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from "@/lib/admin-data";
import { slugify } from "@/lib/format";
import { toast } from "sonner";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { setCategories(adminGetCategories()); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", slug: "", description: "", isActive: true }); setDialogOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", isActive: cat.isActive }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name) { toast.error("Category name is required."); return; }
    const slug = form.slug || slugify(form.name);
    if (editing) {
      adminUpdateCategory(editing.id, { ...form, slug });
      toast.success(`${form.name} updated`);
    } else {
      adminCreateCategory({ name: form.name, slug, description: form.description, isActive: form.isActive });
      toast.success(`${form.name} created`);
    }
    setCategories(adminGetCategories());
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => { adminDeleteCategory(id); setCategories(adminGetCategories()); setDeleteConfirm(null); toast.success("Category deleted"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Categories</h1>
          <p className="text-sm text-zinc-500">{categories.length} categories</p>
        </div>
        <Button onClick={openCreate} className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold text-sm">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                <FolderTree className="h-5 w-5 text-zinc-400" />
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-white" onClick={() => openEdit(cat)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400" onClick={() => setDeleteConfirm(cat.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <h3 className="text-sm font-bold text-white">{cat.name}</h3>
            <p className="text-[10px] text-zinc-500 mt-1">{cat.description || "No description"}</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className={`text-[10px] ${cat.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                {cat.isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-[10px] text-zinc-500">{cat.productCount} products</span>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "Create Category"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Name *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Slug</label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm resize-none" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded bg-zinc-800 border-zinc-700" />
              <span className="text-xs text-zinc-300">Active</span>
            </label>
            <Button onClick={handleSave} className="w-full bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold">
              <Save className="h-4 w-4 mr-2" /> {editing ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Delete Category</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400">Are you sure? This cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300 rounded-xl" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

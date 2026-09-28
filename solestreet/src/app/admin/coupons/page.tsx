"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Save, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import type { Coupon } from "@/types";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({
    code: "", discountPercent: 0, discountAmount: 0, minSpend: 0,
    expiresAt: "2027-12-31T23:59:59Z", isActive: true, usageLimit: 0,
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { setCoupons(adminGetCoupons()); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: "", discountPercent: 0, discountAmount: 0, minSpend: 0, expiresAt: "2027-12-31T23:59:59Z", isActive: true, usageLimit: 0 });
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code, discountPercent: coupon.discountPercent || 0, discountAmount: coupon.discountAmount || 0,
      minSpend: coupon.minSpend || 0, expiresAt: coupon.expiresAt, isActive: coupon.isActive, usageLimit: coupon.usageLimit || 0,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.code) { toast.error("Coupon code is required"); return; }
    if (form.discountPercent <= 0 && form.discountAmount <= 0) { toast.error("Set a discount percentage or amount"); return; }
    const couponData = {
      code: form.code.toUpperCase(),
      ...(form.discountPercent > 0 && { discountPercent: form.discountPercent }),
      ...(form.discountAmount > 0 && { discountAmount: form.discountAmount }),
      ...(form.minSpend > 0 && { minSpend: form.minSpend }),
      ...(form.usageLimit > 0 && { usageLimit: form.usageLimit }),
      expiresAt: form.expiresAt,
      isActive: form.isActive,
    };
    if (editing) {
      adminUpdateCoupon(editing.id, couponData);
      toast.success(`Coupon ${form.code} updated`);
    } else {
      adminCreateCoupon(couponData as Omit<Coupon, "id" | "usageCount">);
      toast.success(`Coupon ${form.code} created`);
    }
    setCoupons(adminGetCoupons());
    setDialogOpen(false);
  };

  const toggleActive = (coupon: Coupon) => {
    adminUpdateCoupon(coupon.id, { isActive: !coupon.isActive });
    setCoupons(adminGetCoupons());
    toast.success(`Coupon ${coupon.code} ${coupon.isActive ? "deactivated" : "activated"}`);
  };

  const handleDelete = (id: string) => { adminDeleteCoupon(id); setCoupons(adminGetCoupons()); setDeleteConfirm(null); toast.success("Coupon deleted"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Coupons & Promotions</h1>
          <p className="text-sm text-zinc-500">{coupons.length} coupon codes</p>
        </div>
        <Button onClick={openCreate} className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold text-sm">
          <Plus className="h-4 w-4 mr-2" /> Create Coupon
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                  <Tag className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white tracking-wider">{coupon.code}</p>
                  <p className="text-[10px] text-zinc-500">
                    {coupon.discountPercent ? `${coupon.discountPercent}% off` : coupon.discountAmount ? `${formatPrice(coupon.discountAmount)} off` : "—"}
                  </p>
                </div>
              </div>
              <Badge className={`text-[10px] font-semibold ${coupon.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                {coupon.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="space-y-1 text-[10px] text-zinc-500 mb-4">
              {coupon.minSpend && <p>Min spend: {formatPrice(coupon.minSpend)}</p>}
              {coupon.usageLimit && <p>Usage limit: {coupon.usageLimit} (used: {coupon.usageCount})</p>}
              <p>Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="flex-1 text-zinc-400 hover:text-white text-xs h-8 rounded-lg" onClick={() => toggleActive(coupon)}>
                {coupon.isActive ? <ToggleRight className="h-3.5 w-3.5 mr-1" /> : <ToggleLeft className="h-3.5 w-3.5 mr-1" />}
                {coupon.isActive ? "Disable" : "Enable"}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white" onClick={() => openEdit(coupon)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-red-400" onClick={() => setDeleteConfirm(coupon.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Coupon Code *</label>
              <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER25" className="bg-zinc-800 border-zinc-700 text-white rounded-xl uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Discount %</label>
                <Input type="number" value={form.discountPercent || ""} onChange={(e) => setForm({ ...form, discountPercent: parseFloat(e.target.value) || 0, discountAmount: 0 })} placeholder="20" className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Fixed Amount $</label>
                <Input type="number" value={form.discountAmount || ""} onChange={(e) => setForm({ ...form, discountAmount: parseFloat(e.target.value) || 0, discountPercent: 0 })} placeholder="50" className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Min Order $</label>
                <Input type="number" value={form.minSpend || ""} onChange={(e) => setForm({ ...form, minSpend: parseFloat(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Usage Limit</label>
                <Input type="number" value={form.usageLimit || ""} onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Expiry Date</label>
              <Input type="date" value={form.expiresAt.split("T")[0]} onChange={(e) => setForm({ ...form, expiresAt: `${e.target.value}T23:59:59Z` })} className="bg-zinc-800 border-zinc-700 text-white rounded-xl" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded bg-zinc-800 border-zinc-700" />
              <span className="text-xs text-zinc-300">Active</span>
            </label>
            <Button onClick={handleSave} className="w-full bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold">
              <Save className="h-4 w-4 mr-2" /> {editing ? "Update Coupon" : "Create Coupon"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Delete Coupon</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400">Are you sure you want to delete this coupon?</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300 rounded-xl" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

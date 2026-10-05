"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  Tag,
  ToggleLeft,
  ToggleRight,
  Search,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Percent,
  DollarSign,
  TrendingUp,
  Clock,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  Layers,
  X,
  Loader2,
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
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { Coupon } from "@/types";

type DiscountType = "percent" | "fixed";
type StatusFilter = "all" | "active" | "inactive" | "expired";
type TypeFilter = "all" | "percent" | "fixed";

interface CouponFormData {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minSpend: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
}

const defaultExpiryDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
};

function emptyForm(): CouponFormData {
  return {
    code: "",
    discountType: "percent",
    discountValue: 15,
    minSpend: 0,
    usageLimit: 100,
    expiresAt: defaultExpiryDate(),
    isActive: true,
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Dialog & Form State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponFormData>(emptyForm());
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<Coupon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCoupons = useCallback(() => {
    setCoupons(adminGetCoupons());
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Telemetry KPIs
  const telemetry = useMemo(() => {
    const total = coupons.length;
    const now = new Date();
    let active = 0;
    let expired = 0;
    let totalRedeemed = 0;

    coupons.forEach((c) => {
      const isExpired = new Date(c.expiresAt) < now;
      if (isExpired) {
        expired++;
      } else if (c.isActive) {
        active++;
      }
      totalRedeemed += c.usageCount || 0;
    });

    return { total, active, expired, totalRedeemed };
  }, [coupons]);

  // Filtering
  const filtered = useMemo(() => {
    let result = [...coupons];
    const now = new Date();

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((c) => c.code.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => {
        const isExp = new Date(c.expiresAt) < now;
        if (statusFilter === "expired") return isExp;
        if (statusFilter === "active") return c.isActive && !isExp;
        if (statusFilter === "inactive") return !c.isActive && !isExp;
        return true;
      });
    }

    if (typeFilter !== "all") {
      result = result.filter((c) => {
        if (typeFilter === "percent") return (c.discountPercent || 0) > 0;
        if (typeFilter === "fixed") return (c.discountAmount || 0) > 0;
        return true;
      });
    }

    return result;
  }, [coupons, search, statusFilter, typeFilter]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openCreate = () => {
    setEditingCoupon(null);
    setForm(emptyForm());
    setFormErrors({});
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    const isFixed = (coupon.discountAmount || 0) > 0;
    setForm({
      code: coupon.code,
      discountType: isFixed ? "fixed" : "percent",
      discountValue: isFixed ? coupon.discountAmount || 0 : coupon.discountPercent || 0,
      minSpend: coupon.minSpend || 0,
      usageLimit: coupon.usageLimit || 0,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : defaultExpiryDate(),
      isActive: coupon.isActive,
    });
    setFormErrors({});
    setDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    const sanitizedCode = form.code.trim().toUpperCase();

    if (!sanitizedCode) {
      errors.code = "Coupon code is required.";
    } else if (!/^[A-Z0-9_-]{3,24}$/.test(sanitizedCode)) {
      errors.code = "Code must be 3-24 uppercase alphanumeric characters (hyphens allowed).";
    } else {
      // Check duplicate code if creating or changing code
      const duplicate = coupons.find(
        (c) => c.code.toUpperCase() === sanitizedCode && c.id !== editingCoupon?.id
      );
      if (duplicate) {
        errors.code = "A coupon with this code already exists.";
      }
    }

    if (form.discountValue <= 0) {
      errors.discountValue = "Discount value must be greater than zero.";
    } else if (form.discountType === "percent" && form.discountValue > 100) {
      errors.discountValue = "Percentage discount cannot exceed 100%.";
    }

    if (form.minSpend < 0) {
      errors.minSpend = "Minimum spend cannot be negative.";
    }

    if (form.usageLimit < 0) {
      errors.usageLimit = "Usage limit cannot be negative.";
    }

    if (!form.expiresAt) {
      errors.expiresAt = "Expiration date is required.";
    } else {
      const selectedExp = new Date(`${form.expiresAt}T23:59:59Z`);
      if (isNaN(selectedExp.getTime())) {
        errors.expiresAt = "Invalid date format.";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    setIsSaving(true);
    try {
      const sanitizedCode = form.code.trim().toUpperCase();
      const expiresAtIso = `${form.expiresAt}T23:59:59Z`;

      const payload = {
        code: sanitizedCode,
        ...(form.discountType === "percent"
          ? { discountPercent: Number(form.discountValue), discountAmount: undefined }
          : { discountAmount: Number(form.discountValue), discountPercent: undefined }),
        minSpend: form.minSpend > 0 ? Number(form.minSpend) : undefined,
        usageLimit: form.usageLimit > 0 ? Number(form.usageLimit) : undefined,
        expiresAt: expiresAtIso,
        isActive: form.isActive,
      };

      if (editingCoupon) {
        adminUpdateCoupon(editingCoupon.id, payload);
        toast.success(`Coupon "${sanitizedCode}" updated successfully.`);
      } else {
        adminCreateCoupon(payload as Omit<Coupon, "id" | "usageCount">);
        toast.success(`Coupon "${sanitizedCode}" created successfully.`);
      }

      loadCoupons();
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save coupon.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = (coupon: Coupon) => {
    const nextState = !coupon.isActive;
    adminUpdateCoupon(coupon.id, { isActive: nextState });
    loadCoupons();
    toast.success(
      `Coupon "${coupon.code}" ${nextState ? "activated" : "deactivated"}.`
    );
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      adminDeleteCoupon(deleteConfirm.id);
      loadCoupons();
      toast.success(`Coupon "${deleteConfirm.code}" permanently deleted.`);
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete coupon.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Coupons & Promotions
            </h1>
            <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-bold px-2 py-0.5 text-xs">
              {coupons.length} Active Codes
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            Create promotional discount codes, tier-based minimum spend requirements, and track redemption metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadCoupons}
            className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 h-10 px-3 text-xs font-semibold shadow-xs"
            title="Reload coupons"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={openCreate}
            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-10 px-4 font-semibold text-xs sm:text-sm shadow-xs transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Promos</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">
              {telemetry.total}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Configured campaign codes</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
            <Tag className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Active & Live</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
              {telemetry.active}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Claimable at storefront checkout</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Redemptions</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">
              {telemetry.totalRedeemed.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Lifetime applied orders</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Expired / Inactive</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-500 mt-0.5">
              {telemetry.expired + (telemetry.total - telemetry.active - telemetry.expired)}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Inactive or past expiry date</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search coupon code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-10 text-xs sm:text-sm font-mono uppercase"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Disabled Only</option>
            <option value="expired">Expired Only</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">All Discount Types</option>
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($)</option>
          </select>

          {(search || statusFilter !== "all" || typeFilter !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setTypeFilter("all");
              }}
              className="h-9 px-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Coupon Data Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Coupon Code</th>
                <th className="px-5 py-3.5">Discount Value</th>
                <th className="px-5 py-3.5">Min Order</th>
                <th className="px-5 py-3.5">Usage / Redemptions</th>
                <th className="px-5 py-3.5">Expiration</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((coupon) => {
                const now = new Date();
                const expDate = new Date(coupon.expiresAt);
                const isExpired = expDate < now;
                const daysUntilExp = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isExpiringSoon = !isExpired && daysUntilExp <= 7;

                const isPercent = (coupon.discountPercent || 0) > 0;
                const discountDisplay = isPercent
                  ? `${coupon.discountPercent}% OFF`
                  : `${formatPrice(coupon.discountAmount || 0)} OFF`;

                const usagePct = coupon.usageLimit
                  ? Math.min(100, Math.round(((coupon.usageCount || 0) / coupon.usageLimit) * 100))
                  : null;

                const statusLabel = isExpired
                  ? "expired"
                  : coupon.isActive
                  ? "active"
                  : "inactive";

                return (
                  <tr key={coupon.id} className="hover:bg-zinc-50/80 transition-colors group">
                    {/* Code */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-zinc-900 tracking-wider text-xs sm:text-sm bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200/80">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 rounded-md hover:bg-zinc-100"
                          title="Copy code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Discount Value */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                          {isPercent ? "%" : "$"}
                        </span>
                        <span className="font-bold text-zinc-900 text-xs sm:text-sm">
                          {discountDisplay}
                        </span>
                      </div>
                    </td>

                    {/* Minimum Order */}
                    <td className="px-5 py-4">
                      {coupon.minSpend && coupon.minSpend > 0 ? (
                        <span className="font-semibold text-zinc-800">
                          {formatPrice(coupon.minSpend)}
                        </span>
                      ) : (
                        <span className="text-zinc-400 italic text-xs">No minimum</span>
                      )}
                    </td>

                    {/* Usage / Redemptions */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 max-w-[130px]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-900">
                            {coupon.usageCount || 0}
                          </span>
                          <span className="text-zinc-400 text-[11px]">
                            {coupon.usageLimit ? `/ ${coupon.usageLimit}` : "used"}
                          </span>
                        </div>
                        {coupon.usageLimit ? (
                          <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usagePct && usagePct >= 90
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Unlimited limit</span>
                        )}
                      </div>
                    </td>

                    {/* Expiration */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold ${
                            isExpired
                              ? "text-red-600 line-through"
                              : isExpiringSoon
                              ? "text-amber-600 font-bold"
                              : "text-zinc-800"
                          }`}
                        >
                          {formatDate(coupon.expiresAt)}
                        </span>
                        {isExpiringSoon && (
                          <span className="text-[10px] text-amber-600 font-bold mt-0.5">
                            Expires in {daysUntilExp} {daysUntilExp === 1 ? "day" : "days"}!
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <StatusBadge status={statusLabel} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(coupon)}
                          disabled={isExpired}
                          className={`h-8 px-2 text-xs font-semibold rounded-lg ${
                            coupon.isActive
                              ? "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                          title={coupon.isActive ? "Deactivate promo" : "Activate promo"}
                        >
                          {coupon.isActive ? (
                            <>
                              <ToggleRight className="h-4 w-4 mr-1 text-emerald-600" />
                              <span className="hidden sm:inline">Active</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-1 text-zinc-400" />
                              <span className="hidden sm:inline">Disabled</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(coupon)}
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                          title="Edit coupon"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirm(coupon)}
                          className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                        <Tag className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 mb-1">No coupons found</h4>
                      <p className="text-xs text-zinc-500 mb-4">
                        {search || statusFilter !== "all" || typeFilter !== "all"
                          ? "No promotion matches your current search or status filter."
                          : "You have not created any promo codes yet."}
                      </p>
                      <Button
                        onClick={openCreate}
                        className="bg-zinc-900 text-white rounded-xl text-xs font-semibold h-9"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Create First Coupon
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Coupon Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[96vw] max-w-lg max-h-[92vh] flex flex-col p-0 overflow-hidden bg-white text-zinc-900 rounded-2xl border-zinc-200 shadow-2xl">
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div>
              <DialogTitle className="text-lg font-black tracking-tight text-zinc-900">
                {editingCoupon ? `Edit Coupon "${editingCoupon.code}"` : "Create New Coupon"}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 mt-0.5">
                Configure discount rules, spend requirements, limits, and expiration.
              </DialogDescription>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Coupon Code Input */}
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                Promo Code <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. HEATWAVE25"
                value={form.code}
                disabled={isSaving}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                  }))
                }
                className={`bg-zinc-50 border text-zinc-900 rounded-xl h-10 font-mono font-bold tracking-wider uppercase text-sm ${
                  formErrors.code ? "border-rose-400 focus-visible:ring-rose-500" : "border-zinc-200"
                }`}
              />
              {formErrors.code && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.code}
                </p>
              )}
            </div>

            {/* Discount Type Toggle */}
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                Discount Type & Value <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, discountType: "percent" }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    form.discountType === "percent"
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <Percent className="h-3.5 w-3.5" />
                  Percentage (%)
                </button>
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, discountType: "fixed" }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    form.discountType === "fixed"
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-xs"
                      : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  <DollarSign className="h-3.5 w-3.5" />
                  Fixed Amount ($)
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  {form.discountType === "percent" ? "%" : "$"}
                </span>
                <Input
                  type="number"
                  min="1"
                  max={form.discountType === "percent" ? "100" : undefined}
                  step={form.discountType === "percent" ? "1" : "0.5"}
                  placeholder={form.discountType === "percent" ? "20" : "50"}
                  value={form.discountValue || ""}
                  disabled={isSaving}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      discountValue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className={`pl-8 bg-white border text-zinc-900 rounded-xl h-10 font-bold text-sm ${
                    formErrors.discountValue
                      ? "border-rose-400 focus-visible:ring-rose-500"
                      : "border-zinc-200"
                  }`}
                />
              </div>
              {formErrors.discountValue && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.discountValue}
                </p>
              )}
            </div>

            {/* Min Order & Usage Limit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                  Minimum Order Spend ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    placeholder="0 = No minimum"
                    value={form.minSpend || ""}
                    disabled={isSaving}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        minSpend: Math.max(0, parseFloat(e.target.value) || 0),
                      }))
                    }
                    className="pl-8 bg-white border-zinc-200 text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Leave 0 for no minimum cart value.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                  Usage Limit (Redemptions)
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="0 = Unlimited"
                  value={form.usageLimit || ""}
                  disabled={isSaving}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      usageLimit: Math.max(0, parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className="bg-white border-zinc-200 text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold"
                />
                <p className="text-[10px] text-zinc-400 mt-1">Total allowed times across all users.</p>
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">
                Expiration Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                value={form.expiresAt}
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                className={`bg-white border text-zinc-900 rounded-xl text-xs sm:text-sm font-semibold ${
                  formErrors.expiresAt ? "border-rose-400" : "border-zinc-200"
                }`}
              />
              {formErrors.expiresAt && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.expiresAt}
                </p>
              )}
            </div>

            {/* Active Toggle Switch */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  disabled={isSaving}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded text-zinc-900 focus:ring-0"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900">Activate Immediately</p>
                  <p className="text-[11px] text-zinc-500">
                    When active, shoppers can enter this promo code during cart and checkout.
                  </p>
                </div>
              </label>
            </div>

            {/* Live Shopper Preview Card */}
            <div className="p-3.5 rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Shopper Checkout Banner Preview
              </p>
              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-zinc-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-zinc-900 text-xs bg-zinc-100 px-2 py-0.5 rounded">
                    {form.code.trim() || "COUPONCODE"}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {form.discountType === "percent"
                      ? `${form.discountValue || 0}% OFF`
                      : `${formatPrice(form.discountValue || 0)} OFF`}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-400">
                  {form.minSpend > 0 ? `Orders over ${formatPrice(form.minSpend)}` : "No min spend"}
                </span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-end gap-2 shrink-0">
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
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => !isDeleting && setDeleteConfirm(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-black text-zinc-900">
              Delete Coupon Code?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-1">
              Are you sure you want to permanently delete coupon{" "}
              <span className="font-mono font-bold text-zinc-900">
                "{deleteConfirm?.code}"
              </span>
              ? Customers will no longer be able to claim this promo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
            >
              Keep Coupon
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs h-10 shadow-xs"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Promo"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

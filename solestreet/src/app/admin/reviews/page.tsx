"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Filter,
  ExternalLink,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkles,
  LayoutGrid,
  List,
  RefreshCw,
  X,
  Loader2,
  Flag,
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
  adminGetReviews,
  adminUpdateReviewStatus,
  adminDeleteReview,
  adminGetProducts,
} from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { Review, ReviewStatus, Product } from "@/types";

const PAGE_SIZE = 8;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [page, setPage] = useState(1);

  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Data Loading
  const loadData = useCallback(() => {
    setReviews(adminGetReviews());
    setProducts(adminGetProducts());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Product Lookup Map
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => {
      map.set(p.id, p);
      map.set(p.slug, p);
    });
    return map;
  }, [products]);

  // Review helper for spam/flag detection
  const isSuspicious = (r: Review) => {
    const content = `${r.title} ${r.comment}`.toLowerCase();
    const hasSpamKeywords =
      content.includes("http") ||
      content.includes(".xyz") ||
      content.includes("telegram") ||
      content.includes("promo") ||
      content.includes("stolen") ||
      content.includes("sketchy");
    return (!r.isVerifiedPurchase && (hasSpamKeywords || r.rating <= 1)) || hasSpamKeywords;
  };

  // Telemetry KPIs
  const telemetry = useMemo(() => {
    const total = reviews.length;
    let pending = 0;
    let approved = 0;
    let hidden = 0;
    let flagged = 0;
    let totalScore = 0;

    reviews.forEach((r) => {
      if (r.status === "pending") pending++;
      else if (r.status === "approved") approved++;
      else if (r.status === "hidden") hidden++;

      if (isSuspicious(r) && r.status !== "approved") {
        flagged++;
      }
      totalScore += r.rating;
    });

    const avgRating = total > 0 ? (totalScore / total).toFixed(1) : "5.0";

    return { total, pending, approved, hidden, flagged, avgRating };
  }, [reviews]);

  // Filtering
  const filtered = useMemo(() => {
    let result = [...reviews];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((r) => {
        const prod = productMap.get(r.productId);
        const prodName = prod?.name?.toLowerCase() || "";
        return (
          r.userName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          prodName.includes(q)
        );
      });
    }

    if (filterStatus !== "all") {
      if (filterStatus === "flagged") {
        result = result.filter((r) => isSuspicious(r) || r.status === "hidden");
      } else {
        result = result.filter((r) => r.status === filterStatus);
      }
    }

    if (filterRating !== "all") {
      const rNum = parseInt(filterRating, 10);
      result = result.filter((r) => r.rating === rNum);
    }

    return result;
  }, [reviews, search, filterStatus, filterRating, productMap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Status Actions
  const handleApprove = (id: string, name: string) => {
    adminUpdateReviewStatus(id, "approved");
    loadData();
    toast.success(`Review by "${name}" approved and published to storefront.`);
  };

  const handleHide = (id: string, name: string) => {
    adminUpdateReviewStatus(id, "hidden");
    loadData();
    toast.info(`Review by "${name}" hidden from public view.`);
  };

  const handleFlagReview = (id: string, name: string) => {
    adminUpdateReviewStatus(id, "hidden");
    loadData();
    toast.warning(`Review by "${name}" flagged as suspicious and suppressed.`);
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      adminDeleteReview(deleteConfirm.id);
      loadData();
      toast.success("Review permanently deleted.");
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review.");
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
              Review Moderation
            </h1>
            <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-bold px-2 py-0.5 text-xs">
              {reviews.length} Feedbacks
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            Moderate customer reviews, verify authenticated purchases, suppress spam, and monitor footwear satisfaction.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 h-10 px-3 text-xs font-semibold shadow-xs"
            title="Reload reviews"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-1 shadow-xs">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "cards"
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
              title="Card feed view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table"
                  ? "bg-zinc-900 text-white shadow-2xs"
                  : "text-zinc-400 hover:text-zinc-700"
              }`}
              title="Dense table view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Average Rating</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900">
                {telemetry.avgRating}
              </h3>
              <div className="flex items-center text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">From {telemetry.total} verified feedback</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5 fill-amber-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Needs Review</p>
            <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5">
              {telemetry.pending}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Pending moderator sign-off</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Publicly Approved</p>
            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
              {telemetry.approved}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Live on sneaker detail pages</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Flagged / Suppressed</p>
            <h3 className="text-xl sm:text-2xl font-black text-red-600 mt-0.5">
              {telemetry.hidden + telemetry.flagged}
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Spam & policy violations</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search review, customer, shoe..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-10 text-xs sm:text-sm"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Status Tabs / Select */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">All Moderation Status</option>
            <option value="pending">Pending Only ({telemetry.pending})</option>
            <option value="approved">Approved Only</option>
            <option value="hidden">Hidden Only</option>
            <option value="flagged">Flagged / Spam Risks</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => {
              setFilterRating(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars ★★★★★</option>
            <option value="4">4 Stars ★★★★☆</option>
            <option value="3">3 Stars ★★★☆☆</option>
            <option value="2">2 Stars ★★☆☆☆</option>
            <option value="1">1 Star ★☆☆☆☆</option>
          </select>

          {(search || filterStatus !== "all" || filterRating !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilterStatus("all");
                setFilterRating("all");
                setPage(1);
              }}
              className="h-9 px-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Main Review Presentation: Cards View */}
      {viewMode === "cards" && (
        <div className="space-y-3.5">
          {paginated.map((review) => {
            const product = productMap.get(review.productId);
            const suspicious = isSuspicious(review);

            return (
              <div
                key={review.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all duration-200 hover:shadow-sm ${
                  suspicious && review.status !== "approved"
                    ? "border-rose-300 bg-rose-50/20"
                    : review.status === "pending"
                    ? "border-amber-200"
                    : "border-zinc-200/80"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Rating, Customer, Review Content */}
                  <div className="flex-1 space-y-2">
                    {/* Header line: Stars, Customer, Badges, Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-300"
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-black text-amber-800 ml-1">
                          {review.rating}.0
                        </span>
                      </div>

                      {/* Customer Name */}
                      <span className="text-xs font-bold text-zinc-900">
                        {review.userName}
                      </span>

                      {/* Verified Badge */}
                      {review.isVerifiedPurchase ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3 w-3" />
                          Verified Buyer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                          Unverified
                        </span>
                      )}

                      {/* Status Badge */}
                      <StatusBadge status={review.status} />

                      {/* Suspicious warning pill */}
                      {suspicious && review.status !== "approved" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Flagged Link / Spam
                        </span>
                      )}

                      <span className="text-[11px] text-zinc-400 ml-auto md:ml-0">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    {/* Review Title & Comment */}
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 leading-snug">
                        {review.title}
                      </h4>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        {review.comment}
                      </p>
                    </div>

                    {/* Referenced Product Attachment Pill */}
                    {product && (
                      <div className="pt-1.5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                          {product.images[0]?.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px]">
                              👟
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-zinc-800 truncate">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ({product.brand})
                            </span>
                          </div>
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
                          >
                            <span>View Product</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Moderation Actions */}
                  <div className="flex items-center md:flex-col gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 md:border-l border-zinc-100 pt-3 md:pt-0 md:pl-4">
                    {review.status !== "approved" && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(review.id, review.userName)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-8 px-3 font-semibold shadow-2xs"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                    )}

                    {review.status !== "hidden" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHide(review.id, review.userName)}
                        className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl text-xs h-8 px-3 font-semibold"
                      >
                        <EyeOff className="h-3.5 w-3.5 mr-1" />
                        Hide
                      </Button>
                    )}

                    {suspicious && review.status !== "hidden" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFlagReview(review.id, review.userName)}
                        className="text-rose-600 hover:bg-rose-50 rounded-xl text-xs h-8 px-3 font-semibold"
                      >
                        <Flag className="h-3.5 w-3.5 mr-1" />
                        Flag Spam
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(review)}
                      className="text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl h-8 w-8"
                      title="Permanently delete review"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {paginated.length === 0 && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-16 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-900 mb-1">No reviews to moderate</h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {search || filterStatus !== "all" || filterRating !== "all"
                  ? "No reviews match your selected filters. Try changing or clearing your search criteria."
                  : "All customer reviews are up to date and moderated."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Alternative Dense Table View */}
      {viewMode === "table" && (
        <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="px-5 py-3.5">Customer & Rating</th>
                  <th className="px-5 py-3.5">Feedback Content</th>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {paginated.map((review) => {
                  const product = productMap.get(review.productId);
                  const suspicious = isSuspicious(review);

                  return (
                    <tr key={review.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-900 text-xs sm:text-sm">
                              {review.userName}
                            </span>
                            {review.isVerifiedPurchase && (
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-zinc-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-sm">
                        <p className="font-bold text-zinc-900 text-xs truncate">
                          {review.title}
                        </p>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {review.comment}
                        </p>
                        {suspicious && review.status !== "approved" && (
                          <span className="inline-block mt-1 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 rounded">
                            Suspicious link / spam
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {product ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.images[0]?.url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-zinc-900 truncate max-w-[120px]">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-zinc-400">{product.brand}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">ID: {review.productId}</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-zinc-500">
                        {formatDate(review.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={review.status} />
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {review.status !== "approved" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(review.id, review.userName)}
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Approve review"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {review.status !== "hidden" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleHide(review.id, review.userName)}
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-lg"
                              title="Hide review"
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(review)}
                            className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
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
            <span className="font-semibold text-zinc-900">{filtered.length}</span> reviews
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => !isDeleting && setDeleteConfirm(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl shadow-xl p-6">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-black text-zinc-900">
              Permanently Delete Review?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-1">
              Are you sure you want to permanently remove this review from{" "}
              <span className="font-bold text-zinc-900">{deleteConfirm?.userName}</span>? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          {deleteConfirm && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-xs my-2">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: deleteConfirm.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
                <span className="font-bold text-zinc-900 ml-1">{deleteConfirm.title}</span>
              </div>
              <p className="text-zinc-600 line-clamp-2 italic">"{deleteConfirm.comment}"</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
            >
              Cancel
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
                "Delete Review"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

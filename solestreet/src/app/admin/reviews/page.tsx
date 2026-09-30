"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Star, Eye, EyeOff, Trash2, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminGetReviews, adminUpdateReviewStatus, adminDeleteReview } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { Review, ReviewStatus } from "@/types";

const PAGE_SIZE = 10;

const statusStyles: Record<ReviewStatus, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  hidden: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  deleted: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => { setReviews(adminGetReviews()); }, []);

  const filtered = useMemo(() => {
    let result = [...reviews];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.userName.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter((r) => r.status === filterStatus);
    return result;
  }, [reviews, search, filterStatus]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = (id: string, status: ReviewStatus) => {
    adminUpdateReviewStatus(id, status);
    setReviews(adminGetReviews());
    toast.success(`Review ${status}`);
  };

  const deleteReview = (id: string) => {
    adminDeleteReview(id);
    setReviews(adminGetReviews());
    toast.success("Review deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Review Moderation</h1>
        <p className="text-sm text-zinc-500">{reviews.length} total reviews</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Search reviews..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl h-10" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="space-y-3">
        {paginated.map((review) => (
          <div key={review.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-white">{review.userName}</span>
                  {review.isVerifiedPurchase && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">Verified</Badge>}
                  <Badge className={`text-[10px] font-semibold capitalize ${statusStyles[review.status] || statusStyles.pending}`}>
                    {review.status || "pending"}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-white mb-1">{review.title}</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{review.comment}</p>
                <p className="text-[10px] text-zinc-600 mt-2">{formatDate(review.createdAt)} · Product: {review.productId}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={() => updateStatus(review.id, "approved")} title="Approve">
                  <CheckCircle className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" onClick={() => updateStatus(review.id, "hidden")} title="Hide">
                  <EyeOff className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10" onClick={() => deleteReview(review.id)} title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {paginated.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
            <Eye className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No reviews to moderate</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

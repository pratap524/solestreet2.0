"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  ChevronLeft,
  Zap,
  MessageSquare,
  UserCheck,
  Maximize2,
  Ruler,
  Share2,
  Clock,
  Sparkles,
  Minus,
  Plus,
  ThumbsUp,
  Flame,
  PackageCheck,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RatingStars } from "@/components/ui/rating-stars";
import { ProductCard } from "@/components/product/product-card";
import { SizeGuideModal } from "@/components/product/size-guide-modal";
import { ImageLightboxModal } from "@/components/product/image-lightbox-modal";

import type { Product, ShoeSize, Review } from "@/types";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import {
  getProductReviews,
  addProductReview,
  checkInventory,
} from "@/lib/firebase/firestore";
import {
  formatPrice,
  getStarRating,
  formatDate,
  getDiscountPercentage,
} from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { products as allProducts } from "@/data/products";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  // Gallery state
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Variant & purchase state
  const [selectedColor, setSelectedColor] = useState(
    product.colors[0] || { name: "Default", hex: "#18181b" }
  );
  const [selectedSize, setSelectedSize] = useState<ShoeSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [reviewSort, setReviewSort] = useState<"newest" | "highest" | "lowest">("newest");
  const [helpfulReviews, setHelpfulReviews] = useState<Record<string, number>>({});

  // Mobile sticky CTA bar state
  const [showStickyBar, setShowStickyBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  // Pre-fill reviewer name when user logs in
  useEffect(() => {
    if (user?.displayName && !reviewerName) {
      setReviewerName(user.displayName);
    }
  }, [user, reviewerName]);

  // Load reviews from Firestore/Local
  useEffect(() => {
    async function loadReviews() {
      try {
        const fetched = await getProductReviews(product.id);
        setReviews(fetched);
      } catch {
        // Fallback gracefully
      }
    }
    loadReviews();
  }, [product.id]);

  // Handle intersection for mobile sticky add-to-bag bar
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When main CTA is NOT intersecting, show sticky bar
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Stock calculations
  const currentSizeStock = useMemo(() => {
    if (!selectedSize) return null;
    const match = product.sizes.find((s) => s.size === selectedSize);
    return match ? match.stock : 0;
  }, [product.sizes, selectedSize]);

  const isSoldOutTotal = useMemo(() => {
    return product.sizes.every((s) => s.stock === 0);
  }, [product.sizes]);

  // Discount calculations
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? getDiscountPercentage(product.price, product.compareAtPrice!)
    : 0;
  const savingsAmount = hasDiscount ? product.compareAtPrice! - product.price : 0;

  // Star ratings display
  const inWishlist = isInWishlist(product.id);
  const { full, half } = getStarRating(product.rating);

  // Dynamic delivery date calculation (3 to 5 business days)
  const estimatedDelivery = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() + 3);
    const end = new Date(today);
    end.setDate(today.getDate() + 5);

    const formatOpt: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    };
    return `${start.toLocaleDateString("en-US", formatOpt)} – ${end.toLocaleDateString(
      "en-US",
      formatOpt
    )}`;
  }, []);

  // Related products (matching category, excluding current)
  const relatedProducts = useMemo(() => {
    const filtered = allProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    if (filtered.length >= 4) return filtered.slice(0, 4);
    // Fill up with others if less than 4
    const others = allProducts.filter(
      (p) => p.id !== product.id && !filtered.some((f) => f.id === p.id)
    );
    return [...filtered, ...others].slice(0, 4);
  }, [product.category, product.id]);

  // Image navigation
  const prevImage = useCallback(() => {
    setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
  }, [product.images.length]);

  const nextImage = useCallback(() => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  }, [product.images.length]);

  // Desktop zoom lens coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  // Mobile touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (diff > 50) {
      // Swiped left -> next
      nextImage();
    } else if (diff < -50) {
      // Swiped right -> prev
      prevImage();
    }
    setTouchStartX(null);
  };

  // Reset quantity when size changes
  const handleSelectSize = (size: ShoeSize) => {
    setSelectedSize(size);
    setSizeError(false);
    setQuantity(1);
  };

  // Stepper handlers
  const handleDecrementQty = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrementQty = () => {
    const maxStock = currentSizeStock ?? 10;
    if (quantity < maxStock && quantity < 10) {
      setQuantity((q) => q + 1);
    } else {
      toast.warning(`Maximum available stock is ${maxStock}`);
    }
  };

  // Add to Bag with inventory validation
  const handleAddToCart = async () => {
    if (!selectedSize) {
      setSizeError(true);
      toast.error("Please select a shoe size", {
        description: "Choose your size before adding to your bag.",
      });
      return;
    }

    if (currentSizeStock === 0) {
      toast.error("Selected size is currently out of stock");
      return;
    }

    setIsAdding(true);

    try {
      // Validate inventory against Firestore/Local
      const inventoryCheck = await checkInventory([
        {
          productId: product.id,
          size: selectedSize,
          quantity,
        },
      ]);

      if (!inventoryCheck.valid) {
        toast.error("Stock Unavailable", {
          description:
            inventoryCheck.message || "Requested quantity exceeds available stock.",
        });
        setIsAdding(false);
        return;
      }

      addItem({
        productId: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug,
        price: product.price,
        image: product.images[0]?.url || "/placeholder-shoe.jpg",
        color: selectedColor.name,
        size: selectedSize,
        quantity,
      });

      toast.success("Added to Bag!", {
        description: `${product.name} (Size US ${selectedSize}) × ${quantity}`,
        action: {
          label: "View Bag",
          onClick: () => setIsOpen(true),
        },
      });
    } catch {
      toast.error("Failed to add to bag. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // Buy Now express checkout
  const handleBuyNow = async () => {
    if (!selectedSize) {
      setSizeError(true);
      toast.error("Please select a shoe size", {
        description: "Choose your size to proceed to instant checkout.",
      });
      return;
    }

    if (currentSizeStock === 0) {
      toast.error("Selected size is currently out of stock");
      return;
    }

    const inventoryCheck = await checkInventory([
      {
        productId: product.id,
        size: selectedSize,
        quantity,
      },
    ]);

    if (!inventoryCheck.valid) {
      toast.error("Stock Unavailable", {
        description:
          inventoryCheck.message || "Requested quantity exceeds available stock.",
      });
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      price: product.price,
      image: product.images[0]?.url || "/placeholder-shoe.jpg",
      color: selectedColor.name,
      size: selectedSize,
      quantity,
    });

    router.push("/checkout");
  };

  // Smooth scroll to reviews
  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Copy product link to share
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        description: "You can now share this sneaker with friends.",
      });
    }
  };

  // Helpful review vote
  const handleHelpful = (reviewId: string) => {
    setHelpfulReviews((prev) => ({
      ...prev,
      [reviewId]: (prev[reviewId] || 0) + 1,
    }));
    toast.success("Thank you for your feedback!");
  };

  // Submit review form
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      toast.error("Please fill in both the title and review comments.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const added = await addProductReview({
        productId: product.id,
        userId: user?.uid || "guest_collector",
        userName: reviewerName.trim() || user?.displayName || "Verified Sneakerhead",
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim(),
        isVerifiedPurchase: true,
        status: "approved",
      });

      setReviews((prev) => [added, ...prev]);
      setReviewModalOpen(false);
      setNewTitle("");
      setNewComment("");
      toast.success("Review published successfully!", {
        description: "Thank you for sharing your experience with the SoleStreet community.",
      });
    } catch {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Review statistics & breakdown
  const reviewBreakdown = useMemo(() => {
    const total = reviews.length;
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      counts[r.rating] = (counts[r.rating] || 0) + 1;
    });

    return {
      total,
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: counts[stars] || 0,
        percentage: total > 0 ? Math.round(((counts[stars] || 0) / total) * 100) : 0,
      })),
    };
  }, [reviews]);

  // Filtered & sorted reviews
  const displayedReviews = useMemo(() => {
    let result = [...reviews];
    if (selectedRatingFilter !== null) {
      result = result.filter((r) => r.rating === selectedRatingFilter);
    }

    if (reviewSort === "newest") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (reviewSort === "highest") {
      result.sort((a, b) => b.rating - a.rating);
    } else if (reviewSort === "lowest") {
      result.sort((a, b) => a.rating - b.rating);
    }

    return result;
  }, [reviews, selectedRatingFilter, reviewSort]);

  return (
    <div className="bg-white min-h-screen">
      {/* ── Breadcrumb Navigation ────────────────────────────────────── */}
      <div className="border-b border-zinc-200/60 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs sm:text-sm text-zinc-500 overflow-x-auto whitespace-nowrap scrollbar-none"
          >
            <Link href="/" className="hover:text-zinc-950 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <Link href="/shop" className="hover:text-zinc-950 transition-colors">
              Shop
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <Link
              href={`/shop?category=${product.category}`}
              className="hover:text-zinc-950 transition-colors capitalize"
            >
              {product.category}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-900 font-semibold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Main Two-Column Layout ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* ── LEFT COLUMN: Product Image Gallery (Sticky on desktop) ─── */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
            {/* Main Stage with Zoom Lens */}
            <div
              className="relative aspect-4/3 sm:aspect-square w-full rounded-3xl overflow-hidden bg-zinc-100 border border-zinc-200/80 shadow-2xs group cursor-zoom-in select-none"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Product Image with Zoom Transform */}
              <div
                className="w-full h-full relative transition-transform duration-200 ease-out"
                style={{
                  transform: isZoomed ? "scale(2.0)" : "scale(1)",
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }}
              >
                <Image
                  src={
                    product.images[selectedImage]?.url ||
                    product.images[0]?.url ||
                    "/placeholder-shoe.jpg"
                  }
                  alt={product.images[selectedImage]?.alt || product.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 55vw"
                  className="object-cover object-center pointer-events-none"
                />
              </div>

              {/* Status Badges Stack */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                {isSoldOutTotal ? (
                  <Badge variant="secondary" className="bg-zinc-950 text-white font-bold text-xs px-3 py-1">
                    SOLD OUT
                  </Badge>
                ) : (
                  <>
                    {product.isNew && (
                      <Badge variant="new" className="shadow-xs font-bold text-xs px-3 py-1 tracking-wider">
                        NEW RELEASE
                      </Badge>
                    )}
                    {hasDiscount && (
                      <Badge variant="sale" className="shadow-xs font-bold text-xs px-3 py-1">
                        -{discountPercent}% OFF
                      </Badge>
                    )}
                    {product.isBestseller && !product.isNew && (
                      <Badge variant="bestseller" className="shadow-xs font-bold text-xs px-3 py-1">
                        BESTSELLER
                      </Badge>
                    )}
                  </>
                )}
              </div>

              {/* Quick Actions (Top Right) */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-800 hover:text-zinc-950 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Expand to Fullscreen"
                  aria-label="View Fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Arrows (Prev / Next) */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-900 shadow-md backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-zinc-900 shadow-md backdrop-blur-md flex items-center justify-center opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image Counter Glass Pill */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold tracking-wider">
                  {selectedImage + 1} / {product.images.length}
                </div>
              </div>

              {/* Mobile Swipe Hint Indicator */}
              <div className="sm:hidden absolute bottom-4 left-4 z-10">
                <span className="text-[10px] font-semibold text-zinc-600 bg-white/80 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                  Swipe to view angles
                </span>
              </div>
            </div>

            {/* Mobile Pagination Dots */}
            {product.images.length > 1 && (
              <div className="flex sm:hidden justify-center items-center gap-1 pt-1">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className="p-2.5 min-h-[44px] min-w-[28px] flex items-center justify-center cursor-pointer"
                    aria-label={`View photo ${idx + 1} of ${product.images.length}`}
                  >
                    <span
                      className={`h-2 rounded-full transition-all block ${
                        selectedImage === idx
                          ? "w-6 bg-zinc-950"
                          : "w-2 bg-zinc-300 hover:bg-zinc-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop / Tablet Thumbnails Strip */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pt-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border-2 transition-all cursor-pointer ${
                      selectedImage === idx
                        ? "border-zinc-950 ring-2 ring-zinc-950/20 shadow-xs scale-102"
                        : "border-transparent opacity-70 hover:opacity-100 hover:border-zinc-300"
                    }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.name} angle ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust highlights below gallery on desktop */}
            <div className="hidden sm:grid grid-cols-3 gap-3 pt-4">
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-3">
                <Truck className="h-5 w-5 text-zinc-900 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-950">Fast Shipping</p>
                  <p className="text-zinc-500">Free over {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-zinc-900 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-950">30-Day Returns</p>
                  <p className="text-zinc-500">Hassle-free exchange</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/70 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-zinc-900 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-950">100% Authentic</p>
                  <p className="text-zinc-500">Verified & certified</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Product Information & Purchase CTAs ──────── */}
          <div className="lg:col-span-5 space-y-6">
            {/* Brand, Badges & Title */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    {product.brand}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs font-semibold text-zinc-500 capitalize">
                    {product.gender}&apos;s {product.category}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-zinc-400 hover:text-zinc-900 transition-colors p-1"
                  title="Share sneaker"
                  aria-label="Share sneaker"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating summary & Review anchor */}
              <div className="flex items-center flex-wrap gap-3 mt-3">
                <button
                  type="button"
                  onClick={scrollToReviews}
                  className="flex items-center gap-1.5 group cursor-pointer"
                >
                  <div className="flex text-amber-400">
                    {Array.from({ length: full }).map((_, i) => (
                      <Star key={`f-${i}`} className="h-4 w-4 fill-current" />
                    ))}
                    {half && <Star className="h-4 w-4 fill-current" />}
                  </div>
                  <span className="text-sm font-bold text-zinc-950 ml-1">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-medium text-zinc-500 underline group-hover:text-zinc-950 transition-colors">
                    ({reviews.length} reviews)
                  </span>
                </button>

                <span className="text-zinc-300">•</span>

                <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  <Sparkles className="h-3 w-3" />
                  <span>96% recommended</span>
                </div>
              </div>
            </div>

            {/* Price & Installments Display */}
            <div className="p-4 sm:p-5 rounded-3xl bg-zinc-50 border border-zinc-200/80 space-y-2">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-zinc-400 line-through font-semibold">
                      {formatPrice(product.compareAtPrice!)}
                    </span>
                    <Badge variant="sale" className="font-bold text-xs px-2.5 py-0.5">
                      Save {formatPrice(savingsAmount)} ({discountPercent}% OFF)
                    </Badge>
                  </>
                )}
              </div>

              {/* Installment breakdown */}
              <p className="text-xs text-zinc-500 flex items-center gap-1.5 pt-1">
                <span>or 4 interest-free payments of</span>
                <span className="font-bold text-zinc-800">
                  {formatPrice(product.price / 4)}
                </span>
                <span>with SolePay</span>
              </p>
            </div>

            <Separator />

            {/* Color Variant Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Color: <span className="font-semibold text-zinc-600 ml-1">{selectedColor.name}</span>
                </label>
                <span className="text-xs text-zinc-400">
                  {product.colors.length} {product.colors.length === 1 ? "Option" : "Options"}
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((color) => {
                  const isSelected = selectedColor.name === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`group px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-xs scale-102"
                          : "border-zinc-200 bg-white text-zinc-800 hover:border-zinc-400 hover:bg-zinc-50"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector & Size Guide */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                    Select Size (US)
                  </label>
                  {selectedSize && (
                    <span className="text-xs font-extrabold text-zinc-900">
                      — US {selectedSize}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              {/* Sizes Grid */}
              <div
                className={`grid grid-cols-4 sm:grid-cols-6 gap-2 p-1 rounded-2xl transition-all ${
                  sizeError ? "ring-2 ring-red-500/80 bg-red-50/20" : ""
                }`}
              >
                {product.sizes.map(({ size, stock }) => {
                  const isOutOfStock = stock === 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleSelectSize(size)}
                      className={`h-12 rounded-2xl text-xs font-bold border transition-all relative flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-md scale-102 z-10"
                          : isOutOfStock
                          ? "border-zinc-200 bg-zinc-100/60 text-zinc-300 line-through cursor-not-allowed pointer-events-none"
                          : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-950 hover:bg-zinc-50"
                      }`}
                      aria-label={`Size US ${size} ${isOutOfStock ? "(Out of stock)" : ""}`}
                    >
                      <span>{size}</span>
                      {stock > 0 && stock <= 3 && !isSelected && (
                        <span className="text-[9px] font-semibold text-amber-600 -mt-0.5">
                          {stock} left
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Size error message */}
              {sizeError && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Please select your size to proceed.
                </p>
              )}

              {/* Dynamic Stock Feedback */}
              <div className="pt-1">
                {selectedSize ? (
                  currentSizeStock === 0 ? (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Out of stock in size {selectedSize}. Please select another size.</span>
                    </div>
                  ) : currentSizeStock! <= 5 ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center justify-between text-amber-800 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Flame className="h-4 w-4 text-amber-600 fill-amber-500 animate-pulse" />
                          Low Stock Alert: Only {currentSizeStock} pairs remaining in size {selectedSize}!
                        </span>
                      </div>
                      {/* Mini stock progress bar */}
                      <div className="h-1.5 w-full bg-amber-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${(currentSizeStock! / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/70 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>In Stock ({currentSizeStock} available) • Ready for dispatch within 24h</span>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
                    Select a size to view real-time inventory and delivery availability.
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Selector & CTAs (Observed for mobile sticky bar) */}
            <div ref={ctaRef} className="space-y-3.5 pt-2">
              <div className="flex items-center gap-3">
                {/* Quantity Numeric Stepper */}
                <div className="flex items-center h-12 rounded-2xl border border-zinc-200 bg-white px-2 shadow-2xs">
                  <button
                    type="button"
                    onClick={handleDecrementQty}
                    disabled={quantity <= 1 || currentSizeStock === 0}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-zinc-950 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementQty}
                    disabled={
                      currentSizeStock === 0 ||
                      (currentSizeStock !== null && quantity >= currentSizeStock) ||
                      quantity >= 10
                    }
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Primary Add to Bag Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAdding || isSoldOutTotal || currentSizeStock === 0}
                  className="flex-1 h-12 rounded-2xl bg-zinc-950 hover:bg-zinc-900 text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {currentSizeStock === 0
                    ? "Out of Stock"
                    : `Add to Bag • ${formatPrice(product.price * quantity)}`}
                </Button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all cursor-pointer ${
                    inWishlist
                      ? "border-red-200 bg-red-50 text-red-500 shadow-2xs"
                      : "border-zinc-200 bg-white text-zinc-700 hover:text-red-500 hover:border-zinc-400"
                  }`}
                  aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`h-5 w-5 transition-transform active:scale-125 ${
                      inWishlist ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Instant Buy Now Button */}
              <Button
                onClick={handleBuyNow}
                disabled={isSoldOutTotal || currentSizeStock === 0}
                variant="outline"
                className="w-full h-12 rounded-2xl font-bold text-zinc-950 border-zinc-950 hover:bg-zinc-950 hover:text-white transition-all text-sm cursor-pointer"
              >
                Instant Buy Now
              </Button>
            </div>

            {/* Shipping & Delivery Promise Box */}
            <div className="p-4 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 space-y-3">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 text-zinc-900 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-950">Estimated Delivery:</span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {estimatedDelivery}
                    </span>
                  </div>
                  <p className="text-zinc-500 leading-relaxed">
                    {product.price >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-emerald-700 font-semibold">
                        This item qualifies for FREE Standard Ground Delivery.
                      </span>
                    ) : (
                      <span>
                        Standard ground shipping available. Free on orders over{" "}
                        {formatPrice(FREE_SHIPPING_THRESHOLD)}.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1 border-t border-zinc-200/60">
                <PackageCheck className="h-5 w-5 text-zinc-900 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-zinc-950">SoleStreet Guarantee: </span>
                  <span className="text-zinc-600">
                    Hand-inspected for 100% authenticity before delivery.
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* ── Accordion Sections: Details, Specs, Shipping, Care ──── */}
            <Accordion
              type="multiple"
              defaultValue={["features", "description"]}
              className="w-full"
            >
              {/* Features & Technology */}
              <AccordionItem value="features" className="border-b border-zinc-200">
                <AccordionTrigger className="text-sm font-bold text-zinc-950 hover:no-underline py-4">
                  Features & Engineering
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <ul className="space-y-2.5">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-600">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Full Description & Story */}
              <AccordionItem value="description" className="border-b border-zinc-200">
                <AccordionTrigger className="text-sm font-bold text-zinc-950 hover:no-underline py-4">
                  Product Story & Craftsmanship
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {product.longDescription || product.description}
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Technical Specifications */}
              <AccordionItem value="specs" className="border-b border-zinc-200">
                <AccordionTrigger className="text-sm font-bold text-zinc-950 hover:no-underline py-4">
                  Specifications & Details
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                    <div>
                      <span className="text-zinc-400 block font-medium">Brand</span>
                      <span className="font-bold text-zinc-900">{product.brand}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Category</span>
                      <span className="font-bold text-zinc-900 capitalize">{product.category}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Gender</span>
                      <span className="font-bold text-zinc-900 capitalize">{product.gender}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Item Code</span>
                      <span className="font-bold text-zinc-900">SS-{product.id.padStart(4, "0")}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Upper Material</span>
                      <span className="font-bold text-zinc-900">Engineered Breathable Mesh & Leather</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block font-medium">Midsole Cushion</span>
                      <span className="font-bold text-zinc-900">High-Rebound Responsive Foam</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Shipping & Returns Details */}
              <AccordionItem value="shipping" className="border-b border-zinc-200">
                <AccordionTrigger className="text-sm font-bold text-zinc-950 hover:no-underline py-4">
                  Shipping & Hassle-Free Returns
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-zinc-600 space-y-2 leading-relaxed">
                  <p>
                    <strong className="text-zinc-950">Standard Shipping:</strong> Free on orders over{" "}
                    {formatPrice(FREE_SHIPPING_THRESHOLD)}. Delivered within 3–5 business days with live tracking.
                  </p>
                  <p>
                    <strong className="text-zinc-950">Express Shipping:</strong> Next-day priority dispatch available at checkout.
                  </p>
                  <p>
                    <strong className="text-zinc-950">30-Day Free Returns:</strong> If you are not completely satisfied with your sneaker fit, return in original box within 30 days for a full refund or exchange.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Sneaker Care Guide */}
              <AccordionItem value="care" className="border-none">
                <AccordionTrigger className="text-sm font-bold text-zinc-950 hover:no-underline py-4">
                  Sneaker Care Guide
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-xs sm:text-sm text-zinc-600 space-y-2 leading-relaxed">
                  <p>
                    To maintain peak performance and preserve the upper material:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Wipe clean with a damp microfiber cloth and mild sneaker cleaner.</li>
                    <li>Avoid machine washing or submerging in water.</li>
                    <li>Air dry at room temperature away from direct heat or intense sunlight.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* ── CUSTOMER REVIEWS SECTION ────────────────────────────────── */}
        <section
          id="reviews"
          ref={reviewsRef}
          className="mt-16 pt-14 border-t border-zinc-200/80"
          aria-labelledby="reviews-heading"
        >
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                Community Feedback
              </span>
              <h2
                id="reviews-heading"
                className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1"
              >
                Customer Ratings & Reviews
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                Real feedback from verified buyers who tested the {product.name}.
              </p>
            </div>

            {/* Write a Review Modal Trigger */}
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
              <DialogTrigger asChild>
                <Button className="h-11 rounded-2xl bg-zinc-950 text-white hover:bg-zinc-800 font-bold text-xs sm:text-sm shadow-sm cursor-pointer shrink-0">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg p-6 sm:p-8 rounded-3xl">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-xl font-black text-zinc-950 tracking-tight">
                    Review {product.name}
                  </DialogTitle>
                  <p className="text-xs text-zinc-500">
                    Your insights help fellow sneakerheads choose the ideal pair.
                  </p>
                </DialogHeader>

                <form onSubmit={handleSubmitReview} className="space-y-4 mt-3">
                  {/* Rating Picker */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-1.5">
                      Your Rating *
                    </label>
                    <RatingStars
                      rating={newRating}
                      size="lg"
                      interactive
                      onRatingChange={(r) => setNewRating(r)}
                    />
                  </div>

                  {/* Reviewer Name */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-1">
                      Your Name
                    </label>
                    <Input
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      placeholder="e.g. Jordan M."
                      className="rounded-xl h-11 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Review Headline */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-1">
                      Review Title *
                    </label>
                    <Input
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Incredibly light and responsive on road runs"
                      className="rounded-xl h-11 text-xs sm:text-sm"
                    />
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-800 block mb-1">
                      Detailed Review *
                    </label>
                    <textarea
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Describe the fit, cushioning, breathability, and how it performs in daily wear..."
                      rows={4}
                      className="w-full rounded-2xl border border-zinc-200 p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full h-11 rounded-2xl bg-zinc-950 text-white font-bold hover:bg-zinc-800 cursor-pointer"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Verified Review"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Reviews Scorecard & Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8 rounded-3xl bg-zinc-50 border border-zinc-200/80 mb-8">
            {/* Left Scorecard */}
            <div className="md:col-span-4 flex flex-col justify-center items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-zinc-200 pb-6 md:pb-0 md:pr-8">
              <span className="text-5xl sm:text-6xl font-black text-zinc-950 tracking-tight">
                {product.rating.toFixed(1)}
              </span>
              <div className="flex text-amber-400 my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-current"
                        : "text-zinc-200 fill-zinc-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs font-bold text-zinc-900">
                Based on {reviews.length} verified ratings
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                96% of reviewers recommend this product
              </p>
            </div>

            {/* Right Distribution Bars */}
            <div className="md:col-span-8 flex flex-col justify-center space-y-2">
              {reviewBreakdown.breakdown.map((row) => (
                <button
                  key={row.stars}
                  type="button"
                  onClick={() =>
                    setSelectedRatingFilter(
                      selectedRatingFilter === row.stars ? null : row.stars
                    )
                  }
                  className="flex items-center gap-3 group text-xs cursor-pointer"
                >
                  <span className="w-12 text-left font-bold text-zinc-700 group-hover:text-zinc-950">
                    {row.stars} Stars
                  </span>
                  <div className="flex-1 h-2.5 bg-zinc-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        selectedRatingFilter === row.stars
                          ? "bg-zinc-950"
                          : "bg-amber-400 group-hover:bg-amber-500"
                      }`}
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-zinc-500 font-medium group-hover:text-zinc-900">
                    {row.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters & Sorting Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mr-1">
                Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedRatingFilter(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRatingFilter === null
                    ? "bg-zinc-950 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                All ({reviews.length})
              </button>
              {[5, 4, 3, 2, 1].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() =>
                    setSelectedRatingFilter(
                      selectedRatingFilter === stars ? null : stars
                    )
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedRatingFilter === stars
                      ? "bg-zinc-950 text-white shadow-xs"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {stars} Stars
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-zinc-500 uppercase tracking-wider">Sort:</span>
              <select
                value={reviewSort}
                onChange={(e) =>
                  setReviewSort(e.target.value as "newest" | "highest" | "lowest")
                }
                className="h-9 rounded-xl border border-zinc-200 bg-white px-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950"
              >
                <option value="newest">Most Recent</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {displayedReviews.length === 0 ? (
              <div className="text-center py-12 rounded-3xl bg-zinc-50 border border-zinc-200/70 p-6">
                <p className="text-sm font-bold text-zinc-800">
                  No reviews match your selected filter.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedRatingFilter(null)}
                  className="mt-3 rounded-xl text-xs"
                >
                  Reset Filter
                </Button>
              </div>
            ) : (
              displayedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 sm:p-6 rounded-3xl bg-zinc-50/80 border border-zinc-200/70 space-y-3 transition-all hover:border-zinc-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center">
                        {rev.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-xs sm:text-sm text-zinc-950 block">
                          {rev.userName}
                        </span>
                        {rev.isVerifiedPurchase && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Verified Buyer
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>

                  {/* Stars & Title */}
                  <div>
                    <div className="flex text-amber-400 mb-1">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base text-zinc-950">
                      {rev.title}
                    </h3>
                  </div>

                  {/* Body text */}
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                    {rev.comment}
                  </p>

                  {/* Review helpful footer */}
                  <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-200/60">
                    <span>Helpful review?</span>
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-950 font-semibold cursor-pointer transition-colors"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Yes ({helpfulReviews[rev.id] || 0})</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── RELATED PRODUCTS: You Might Also Like ───────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-14 border-t border-zinc-200/80">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
                  Recommended For You
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-1">
                  You Might Also Like
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  Similar styles and high-performance options from the {product.category} collection.
                </p>
              </div>

              <Link
                href={`/shop?category=${product.category}`}
                className="text-xs sm:text-sm font-bold text-zinc-900 hover:text-zinc-600 flex items-center gap-1 group"
              >
                <span>View All {product.category}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relProduct, idx) => (
                <ProductCard key={relProduct.id} product={relProduct} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── MOBILE STICKY ADD-TO-BAG BAR ─────────────────────────────── */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200/80 p-3.5 z-40 shadow-2xl flex items-center justify-between gap-3"
          >
            {/* Thumbnail & Product Info */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                <Image
                  src={product.images[0]?.url || "/placeholder-shoe.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-zinc-950 truncate">
                  {product.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-extrabold text-zinc-950">
                    {formatPrice(product.price)}
                  </span>
                  {selectedSize ? (
                    <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded-md">
                      US {selectedSize}
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-500 font-semibold">
                      Select size
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isSoldOutTotal || currentSizeStock === 0}
              className="h-11 px-5 rounded-2xl bg-zinc-950 text-white font-bold text-xs shrink-0 shadow-md cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4 mr-1.5" />
              {currentSizeStock === 0 ? "Out of Stock" : "Add to Bag"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALS: Size Guide & Fullscreen Lightbox ──────────────────── */}
      <SizeGuideModal
        open={sizeGuideOpen}
        onOpenChange={setSizeGuideOpen}
        brand={product.brand}
      />

      <ImageLightboxModal
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        images={product.images}
        currentIndex={selectedImage}
        onSelectIndex={setSelectedImage}
        productName={product.name}
      />
    </div>
  );
}

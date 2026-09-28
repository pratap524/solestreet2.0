"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  StarHalf,
  ShoppingBag,
  Heart,
  Truck,
  RotateCcw,
  Shield,
  Check,
  ChevronRight,
  Zap,
  MessageSquare,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Product, ShoeSize, Review } from "@/types";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/context/auth-context";
import { getProductReviews, addProductReview } from "@/lib/firebase/firestore";
import {
  formatPrice,
  getStarRating,
} from "@/lib/format";
import { ProductSection } from "@/components/home/product-section";
import { products as allProducts } from "@/data/products";

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<ShoeSize | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const quantity = 1;

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      try {
        const fetched = await getProductReviews(product.id);
        setReviews(fetched);
      } catch {
        // ignore
      }
    }
    loadReviews();
  }, [product.id]);

  const inWishlist = isInWishlist(product.id);
  const { full, half } = getStarRating(product.rating);

  // Selected size stock
  const currentSizeStock = selectedSize
    ? product.sizes.find((s) => s.size === selectedSize)?.stock ?? 0
    : null;

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      price: product.price,
      image: product.images[0].url,
      color: selectedColor.name,
      size: selectedSize,
      quantity,
    });

    toast.success("Added to bag!", {
      description: `${product.name} - Size ${selectedSize}`,
      action: {
        label: "View Bag",
        onClick: () => setIsOpen(true),
      },
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }

    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      slug: product.slug,
      price: product.price,
      image: product.images[0].url,
      color: selectedColor.name,
      size: selectedSize,
      quantity,
    });

    router.push("/checkout");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newComment.trim()) {
      toast.error("Please fill in both headline and review text.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const added = await addProductReview({
        productId: product.id,
        userId: user?.uid || "guest_reviewer",
        userName: user?.displayName || "Shoe Collector",
        rating: newRating,
        title: newTitle,
        comment: newComment,
        isVerifiedPurchase: true,
        status: "approved",
      });

      setReviews((prev) => [added, ...prev]);
      setReviewModalOpen(false);
      setNewTitle("");
      setNewComment("");
      toast.success("Thank you! Your review has been published.");
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:text-zinc-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/shop" className="hover:text-zinc-900 transition-colors">
            Shop
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href={`/shop?category=${product.category}`}
            className="hover:text-zinc-900 transition-colors"
          >
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-zinc-900 font-medium truncate">{product.name}</span>
        </nav>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100">
              <Image
                src={product.images[selectedImage]?.url || product.images[0].url}
                alt={product.images[selectedImage]?.alt || product.name}
                fill
                priority
                className="object-cover"
              />
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-zinc-900 text-white font-semibold text-xs px-3 py-1">
                  NEW RELEASE
                </Badge>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border-2 transition-all ${
                    selectedImage === idx ? "border-zinc-900 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt={img.alt} fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {product.brand}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1">
                {product.name}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-zinc-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-base text-zinc-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <div className="flex text-amber-500">
                    {Array.from({ length: full }).map((_, i) => (
                      <Star key={`f-${i}`} className="h-4 w-4 fill-current" />
                    ))}
                    {half && <StarHalf className="h-4 w-4 fill-current" />}
                  </div>
                  <span className="font-bold text-zinc-800 ml-1">{product.rating}</span>
                  <span className="text-zinc-400">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Colors */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 block mb-2">
                Color: <span className="font-normal text-zinc-900">{selectedColor.name}</span>
              </label>
              <div className="flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                      selectedColor.name === c.name
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-xs"
                        : "border-zinc-200 text-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10"
                      style={{ backgroundColor: c.hex }}
                    />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Select Size (US Men/Women)
                </label>
                {sizeError && (
                  <span className="text-xs font-bold text-red-500 animate-pulse">
                    Please select a size
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map(({ size, stock }) => {
                  const isOutOfStock = stock === 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`h-11 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
                          : isOutOfStock
                          ? "border-zinc-100 bg-zinc-50 text-zinc-300 line-through cursor-not-allowed"
                          : "border-zinc-200 text-zinc-800 hover:border-zinc-900"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Stock inventory badge */}
              {selectedSize && currentSizeStock !== null && (
                <div className="mt-3 text-xs">
                  {currentSizeStock <= 0 ? (
                    <span className="text-red-500 font-bold">Out of stock in size {selectedSize}</span>
                  ) : currentSizeStock <= 5 ? (
                    <span className="text-amber-600 font-bold flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                      Low Stock: Only {currentSizeStock} pairs left in size {selectedSize}!
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      In Stock (Ready to ship)
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions: Add to Cart, Buy Now, Wishlist */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 rounded-xl bg-zinc-900 text-white font-bold hover:bg-zinc-800 text-sm"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Add to Bag — {formatPrice(product.price * quantity)}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className={`h-12 w-12 rounded-xl shrink-0 ${
                    inWishlist ? "border-red-200 text-red-500 bg-red-50/50" : "border-zinc-200 text-zinc-700"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                </Button>
              </div>

              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="w-full h-12 rounded-xl font-bold text-zinc-900 border-zinc-900 hover:bg-zinc-900 hover:text-white transition-colors text-sm"
              >
                Instant Buy Now
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: "Free shipping\nover $150" },
                { icon: RotateCcw, label: "30-day\nreturns" },
                { icon: Shield, label: "100% Authentic\nGuaranteed" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-zinc-50 border border-zinc-100"
                >
                  <item.icon className="h-4 w-4 text-zinc-700 mb-1" />
                  <span className="text-[10px] text-zinc-600 whitespace-pre-line leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Accordion details */}
            <Accordion type="multiple" defaultValue={["features"]} className="w-full">
              <AccordionItem value="features">
                <AccordionTrigger className="text-sm font-semibold">
                  Features & Technology
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-zinc-600">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="description">
                <AccordionTrigger className="text-sm font-semibold">
                  Full Description
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    {product.longDescription}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <div className="mt-16 pt-12 border-t border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">Verified Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-bold text-zinc-800">{product.rating} out of 5</span>
                <span className="text-xs text-zinc-400">({reviews.length} ratings)</span>
              </div>
            </div>

            {/* Write a Review Modal */}
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl font-semibold">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Write a Review
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Write a Review for {product.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmitReview} className="space-y-4 mt-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 block mb-1">
                      Overall Rating
                    </label>
                    <div className="flex gap-1.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${star <= newRating ? "fill-current" : "text-zinc-200"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">Headline</label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Ultra comfortable for marathon training!"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">Your Review</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share what you liked, how it fits, and durability..."
                      className="mt-1 w-full h-24 rounded-md border border-zinc-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                  </div>

                  <Button type="submit" disabled={isSubmittingReview} className="w-full rounded-xl">
                    {isSubmittingReview ? "Submitting..." : "Publish Review"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900">{rev.userName}</span>
                    {rev.isVerifiedPurchase && (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px] font-bold">
                        <UserCheck className="h-3 w-3 mr-1" />
                        Verified Buyer
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex text-amber-500 mb-2">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>

                <h4 className="font-bold text-sm text-zinc-900 mb-1">{rev.title}</h4>
                <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-100 mt-12">
          <ProductSection
            title="You Might Also Like"
            subtitle="Similar styles from the same category"
            products={relatedProducts}
            viewAllHref={`/shop?category=${product.category}`}
          />
        </div>
      )}
    </div>
  );
}

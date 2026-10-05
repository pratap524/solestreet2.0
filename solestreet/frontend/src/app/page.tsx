import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner, TrustBanner } from "@/components/home/banners";
import { getFeaturedProducts, getNewArrivals, getBestsellers } from "@/data/products";

export const metadata: Metadata = {
  title: "SoleStreet — Premium Footwear for Every Step",
  description:
    "Discover the latest styles in running, casual, basketball, and outdoor shoes from the world's best brands. Free shipping on orders over ₹150.",
};

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 4);
  const newArrivals = getNewArrivals().slice(0, 4);
  const bestsellers = getBestsellers().slice(0, 4);

  return (
    <div className="bg-[#fafaf9] overflow-hidden">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Trust Indicators */}
      <TrustBanner />

      {/* 3. Featured Drops */}
      <ProductSection
        badge="Curated Selection"
        title="Featured Sneakers"
        subtitle="Hand-picked silhouettes and limited releases from our latest collection"
        products={featured}
        viewAllHref="/shop"
        viewAllLabel="View All"
      />

      {/* 4. Category Discovery Grid */}
      <CategoriesSection />

      {/* 5. New Arrivals */}
      <ProductSection
        badge="Fresh Drops"
        title="New Arrivals"
        subtitle="The latest performance innovations and streetwear silhouettes just landed"
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
        viewAllLabel="Explore All New"
      />

      {/* 6. Promotional Banner */}
      <PromoBanner />

      {/* 7. Bestsellers */}
      <ProductSection
        badge="Community Favorites"
        title="Top Bestsellers"
        subtitle="The most-wanted and highest-rated footwear chosen by our community"
        products={bestsellers}
        viewAllHref="/shop?sort=bestselling"
        viewAllLabel="See All Bestsellers"
      />
    </div>
  );
}

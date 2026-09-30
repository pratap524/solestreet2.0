import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProductSection } from "@/components/home/product-section";
import { PromoBanner, TrustBanner } from "@/components/home/banners";
import { getFeaturedProducts, getNewArrivals, getBestsellers } from "@/data/products";

export const metadata: Metadata = {
  title: "SoleStreet — Premium Footwear for Every Step",
  description:
    "Discover the latest styles in running, casual, basketball, and outdoor shoes from the world's best brands. Free shipping on orders over $150.",
};

export default function HomePage() {
  const featured = getFeaturedProducts().slice(0, 4);
  const newArrivals = getNewArrivals().slice(0, 4);
  const bestsellers = getBestsellers().slice(0, 4);

  return (
    <>
      <HeroSection />
      <TrustBanner />

      <ProductSection
        title="Featured"
        subtitle="Hand-picked selections from our latest collection"
        products={featured}
        viewAllHref="/shop"
        viewAllLabel="View All"
      />

      <CategoriesSection />

      <ProductSection
        title="New Arrivals"
        subtitle="Fresh drops just landed in store"
        products={newArrivals}
        viewAllHref="/shop?sort=newest"
        viewAllLabel="See All New"
      />

      <PromoBanner />

      <ProductSection
        title="Bestsellers"
        subtitle="The styles our customers love most"
        products={bestsellers}
        viewAllHref="/shop?sort=bestselling"
        viewAllLabel="See All Bestsellers"
      />
    </>
  );
}

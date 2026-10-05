import { MetadataRoute } from "next";
import { products } from "@/data/products";
import { Product } from "@/types";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://solestreet.com";

  // Static main pages
  const routes = [
    "",
    "/shop",
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/account",
    "/search",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic product pages
  const productRoutes = products.map((product: Product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt || product.createdAt || new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Dynamic category pages
  const categories = ["running", "casual", "basketball", "skateboarding", "hiking", "training"];
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/shop?category=${cat}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}

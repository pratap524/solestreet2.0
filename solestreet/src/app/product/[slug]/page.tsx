import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, products } from "@/data/products";
import { ProductDetail } from "./product-detail";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.name} - ${product.brand}`,
    description: product.description,
    openGraph: {
      title: `${product.name} - ${product.brand}`,
      description: product.description,
      images: [{ url: product.images[0].url, alt: product.images[0].alt }],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

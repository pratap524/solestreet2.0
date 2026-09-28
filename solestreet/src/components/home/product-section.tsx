"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = "View All",
}: ProductSectionProps) {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-zinc-500 text-sm sm:text-base max-w-md">
                {subtitle}
              </p>
            )}
          </motion.div>

          {viewAllHref && (
            <Button
              asChild
              variant="ghost"
              className="text-zinc-600 hover:text-zinc-900 hidden sm:flex"
            >
              <Link href={viewAllHref}>
                {viewAllLabel}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Mobile view all */}
        {viewAllHref && (
          <div className="mt-8 text-center sm:hidden">
            <Button
              asChild
              variant="outline"
              className="rounded-xl px-8"
            >
              <Link href={viewAllHref}>
                {viewAllLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

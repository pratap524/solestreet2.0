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
  badge?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function ProductSection({
  title,
  subtitle,
  badge,
  products,
  viewAllHref,
  viewAllLabel = "View Collection",
}: ProductSectionProps) {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            {badge && (
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">
                {badge}
              </span>
            )}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-zinc-500 text-sm sm:text-base max-w-lg leading-relaxed">
                {subtitle}
              </p>
            )}
          </motion.div>

          {viewAllHref && (
            <Button
              asChild
              variant="ghost"
              className="text-zinc-800 hover:text-zinc-950 font-bold hidden sm:flex items-center gap-1.5 group p-0 hover:bg-transparent"
            >
              <Link href={viewAllHref}>
                <span>{viewAllLabel}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* Mobile View All */}
        {viewAllHref && (
          <div className="mt-10 text-center sm:hidden">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-xl font-bold"
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

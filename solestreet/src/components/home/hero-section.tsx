"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-zinc-950">
      {/* Background image & gradient overlays */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1920&q=80"
          alt="Luxury athletic and streetwear sneaker on dark background"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-35 scale-102 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 w-full">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-amber-300 text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Autumn / Winter Drop 2026</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight uppercase"
          >
            Engineered For
            <br />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              The Streets
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-zinc-300 max-w-lg leading-relaxed font-normal"
          >
            Discover rare silhouettes and performance footwear from the world&apos;s most coveted brands. 100% verified authentic, delivered straight to your door.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            <Button
              asChild
              size="lg"
              variant="default"
              className="bg-white text-zinc-950 hover:bg-zinc-100 font-bold rounded-xl h-12 sm:h-14 px-8 text-base shadow-xl shadow-white/10"
            >
              <Link href="/shop">
                Shop Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 bg-white/5 text-white hover:bg-white/15 hover:text-white rounded-xl h-12 sm:h-14 px-8 text-base backdrop-blur-md"
            >
              <Link href="/shop?sort=newest">Explore New Drops</Link>
            </Button>
          </motion.div>

          {/* Stats Rail */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-14 flex gap-8 sm:gap-14 pt-8 border-t border-white/10"
          >
            {[
              { value: "50+", label: "Verified Brands" },
              { value: "100%", label: "Authenticity Guarantee" },
              { value: "Fast", label: "Doorstep Delivery" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-400 mt-1 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

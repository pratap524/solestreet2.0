"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, RotateCcw, Headphones } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="relative overflow-hidden bg-zinc-900 py-20 sm:py-28">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&q=80"
          alt="Premium basketball shoes"
          fill
          sizes="100vw"
          className="object-cover opacity-20"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-amber-400 text-sm font-semibold tracking-widest uppercase">
            Limited Time Offer
          </span>
          <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Up to 30% Off
          </h2>
          <p className="mt-4 text-zinc-400 text-base sm:text-lg max-w-lg mx-auto">
            Score big on select styles. Premium shoes at prices that make you
            feel like you won.
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="bg-amber-400 hover:bg-amber-500 text-zinc-900 font-bold rounded-xl h-13 px-8 text-base"
            >
              <Link href="/shop?sort=price-asc">
                Shop Sale
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function TrustBanner() {
  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $100",
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day return policy",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "256-bit SSL encryption",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Expert help anytime",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-zinc-50 border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 text-white mb-3">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-zinc-900 text-sm sm:text-base">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

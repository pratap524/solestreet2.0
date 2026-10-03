"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Award } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 py-16 sm:py-24 px-6 sm:px-12 text-center border border-zinc-800 shadow-2xl">
          {/* Background image & lighting */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&q=80"
              alt="SoleStreet Limited Edition Collection"
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
          </div>

          <div className="relative max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold tracking-widest uppercase mb-6">
                <span>Seasonal Exclusive</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase">
                Save 20% on Your First Order
              </h2>

              <p className="mt-4 text-zinc-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                Use code <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">SOLE20</span> at checkout to unlock savings across our complete catalogue.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-zinc-950 hover:bg-zinc-100 font-bold rounded-xl h-12 sm:h-14 px-8 text-base shadow-lg"
                >
                  <Link href="/shop">
                    Claim Discount
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-zinc-700 bg-zinc-900/60 text-white hover:bg-zinc-800 rounded-xl h-12 sm:h-14 px-8 text-base"
                >
                  <Link href="/shop?sort=price-asc">Browse Sale</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustBanner() {
  const features = [
    {
      icon: Truck,
      title: "Complimentary Delivery",
      description: "Free shipping unlocked on orders over ₹150",
    },
    {
      icon: Award,
      title: "100% Authentic Guaranteed",
      description: "Directly sourced and verified by footwear specialists",
    },
    {
      icon: RotateCcw,
      title: "30-Day Easy Returns",
      description: "Hassle-free exchange policy on all unworn pairs",
    },
    {
      icon: ShieldCheck,
      title: "Secure Encrypted Checkout",
      description: "End-to-end 256-bit encrypted card & Stripe payments",
    },
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#fafaf9] border-y border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="p-6 rounded-2xl bg-white border border-zinc-200/70 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-950 text-white flex items-center justify-center mb-4 shadow-sm">
                <feature.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-950 text-base mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

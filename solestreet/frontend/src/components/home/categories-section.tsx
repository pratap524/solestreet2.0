"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { categoryLabels } from "@/data/products";

const categories = [
  {
    key: "running",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    tagline: "Speed & Endurance",
  },
  {
    key: "casual",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
    tagline: "Everyday Classics",
  },
  {
    key: "basketball",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
    tagline: "Court Performance",
  },
  {
    key: "hiking",
    image: "https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=800&q=80",
    tagline: "All-Terrain Exploration",
  },
  {
    key: "skateboarding",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
    tagline: "Board Grip & Style",
  },
  {
    key: "training",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
    tagline: "Gym & High Intensity",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#fafaf9] border-t border-zinc-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 block mb-2">
              Curated Disciplines
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
              Shop by Category
            </h2>
          </div>
          <p className="text-zinc-500 text-sm sm:text-base max-w-md">
            Engineered silhouettes designed for specific demands, from high-mileage marathons to urban lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Link
                href={`/shop?category=${cat.key}`}
                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200/80 shadow-xs hover:shadow-lg transition-all duration-300"
              >
                <Image
                  src={cat.image}
                  alt={categoryLabels[cat.key] || cat.key}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108 opacity-85 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
                
                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
                  <div className="self-end">
                    <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-zinc-300 tracking-wider uppercase block mb-1">
                      {cat.tagline}
                    </span>
                    <h3 className="text-white font-black text-xl sm:text-2xl tracking-tight">
                      {categoryLabels[cat.key]}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

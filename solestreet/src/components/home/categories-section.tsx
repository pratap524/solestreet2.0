"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { categoryLabels } from "@/data/products";

const categories = [
  {
    key: "running",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    gradient: "from-red-500/90 to-orange-500/90",
  },
  {
    key: "casual",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&q=80",
    gradient: "from-blue-500/90 to-indigo-500/90",
  },
  {
    key: "basketball",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600&q=80",
    gradient: "from-amber-500/90 to-yellow-500/90",
  },
  {
    key: "hiking",
    image: "https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=600&q=80",
    gradient: "from-green-600/90 to-emerald-500/90",
  },
  {
    key: "skateboarding",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&q=80",
    gradient: "from-purple-500/90 to-pink-500/90",
  },
  {
    key: "training",
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=80",
    gradient: "from-zinc-700/90 to-zinc-900/90",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="mt-3 text-zinc-500 text-sm sm:text-base max-w-md mx-auto">
            Find the perfect shoes for every activity and occasion
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Link
                href={`/shop?category=${cat.key}`}
                className="group relative block aspect-[4/3] rounded-2xl overflow-hidden"
              >
                <Image
                  src={cat.image}
                  alt={categoryLabels[cat.key]}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-300`}
                />
                <div className="absolute inset-0 flex items-end p-4 sm:p-6">
                  <div>
                    <h3 className="text-white font-bold text-lg sm:text-xl">
                      {categoryLabels[cat.key]}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm mt-0.5">
                      Shop now →
                    </p>
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

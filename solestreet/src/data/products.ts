import { Product } from "@/types";

// High-quality shoe images from Unsplash
const SHOE_IMAGES = {
  running1: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  running2: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
  running3: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
  casual1: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80",
  casual2: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
  casual3: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80",
  basketball1: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
  basketball2: "https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=800&q=80",
  skate1: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800&q=80",
  skate2: "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&q=80",
  hiking1: "https://images.unsplash.com/photo-1520219306100-ec4afeeefe58?w=800&q=80",
  hiking2: "https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80",
  training1: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80",
  training2: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
  hero1: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1400&q=80",
  hero2: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1400&q=80",
};

const defaultSizes = [
  { size: 7 as const, stock: 12 },
  { size: 7.5 as const, stock: 8 },
  { size: 8 as const, stock: 15 },
  { size: 8.5 as const, stock: 10 },
  { size: 9 as const, stock: 20 },
  { size: 9.5 as const, stock: 14 },
  { size: 10 as const, stock: 18 },
  { size: 10.5 as const, stock: 9 },
  { size: 11 as const, stock: 11 },
  { size: 11.5 as const, stock: 6 },
  { size: 12 as const, stock: 7 },
  { size: 13 as const, stock: 4 },
];

export const products: Product[] = [
  {
    id: "1",
    name: "AirFlow Pro Runner",
    slug: "airflow-pro-runner",
    brand: "Nike",
    description:
      "Engineered for speed and comfort, the AirFlow Pro Runner delivers responsive cushioning and breathable support for your daily runs.",
    longDescription:
      "The AirFlow Pro Runner is designed for serious runners who demand peak performance. Featuring a revolutionary foam midsole that returns energy with every stride, a breathable Flyknit upper that adapts to your foot shape, and a durable rubber outsole with strategic traction patterns. Whether you're logging training miles or racing a 10K, these shoes deliver consistent cushioning and a smooth heel-to-toe transition.",
    price: 159.99,
    compareAtPrice: 189.99,
    category: "running",
    gender: "men",
    colors: [
      { name: "Infrared Red", hex: "#FF3B30" },
      { name: "Electric Blue", hex: "#007AFF" },
      { name: "Stealth Black", hex: "#1C1C1E" },
    ],
    selectedColor: "Infrared Red",
    sizes: defaultSizes,
    images: [
      { url: SHOE_IMAGES.running1, alt: "AirFlow Pro Runner - Infrared Red side view" },
      { url: SHOE_IMAGES.running2, alt: "AirFlow Pro Runner - top view" },
      { url: SHOE_IMAGES.running3, alt: "AirFlow Pro Runner - detail" },
    ],
    features: [
      "Responsive ZoomX foam midsole",
      "Breathable Flyknit upper",
      "Carbon fiber plate for propulsion",
      "Reflective elements for visibility",
      "Padded heel collar",
    ],
    rating: 4.8,
    reviewCount: 342,
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    createdAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "2",
    name: "CloudStep Casual",
    slug: "cloudstep-casual",
    brand: "Adidas",
    description:
      "The ultimate everyday sneaker combining premium comfort with versatile street style.",
    longDescription:
      "Step into effortless style with the CloudStep Casual. Built with Adidas Boost technology in the midsole for unmatched all-day comfort, and a premium leather and suede upper that only gets better with age. The classic silhouette pairs perfectly with everything from jeans to chinos, making it the ideal go-to shoe for work, weekends, and everything in between.",
    price: 119.99,
    category: "casual",
    gender: "unisex",
    colors: [
      { name: "Cloud White", hex: "#F5F5F7" },
      { name: "Core Black", hex: "#1C1C1E" },
      { name: "Olive Green", hex: "#556B2F" },
    ],
    selectedColor: "Cloud White",
    sizes: defaultSizes,
    images: [
      { url: SHOE_IMAGES.casual1, alt: "CloudStep Casual - Cloud White side view" },
      { url: SHOE_IMAGES.casual2, alt: "CloudStep Casual - lifestyle shot" },
      { url: SHOE_IMAGES.casual3, alt: "CloudStep Casual - detail" },
    ],
    features: [
      "Boost midsole cushioning",
      "Premium leather upper",
      "OrthoLite sockliner",
      "Rubber cupsole",
      "Eco-friendly materials",
    ],
    rating: 4.6,
    reviewCount: 518,
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    createdAt: "2026-07-15T00:00:00Z",
  },
  {
    id: "3",
    name: "Court Dominator High",
    slug: "court-dominator-high",
    brand: "Nike",
    description:
      "Built for explosive moves on the court, the Court Dominator High offers lockdown support and responsive cushioning.",
    longDescription:
      "Dominate every game with the Court Dominator High. This performance basketball shoe features Nike Zoom Air units in the forefoot and heel for responsive, court-feel cushioning. The high-top design with integrated ankle support keeps you locked in during aggressive cuts and jumps, while the herringbone-pattern outsole provides multi-directional traction. Built for ballers who won't settle for less.",
    price: 189.99,
    compareAtPrice: 219.99,
    category: "basketball",
    gender: "men",
    colors: [
      { name: "Championship Gold", hex: "#FFD700" },
      { name: "Midnight Navy", hex: "#191970" },
      { name: "Gym Red", hex: "#C62828" },
    ],
    selectedColor: "Championship Gold",
    sizes: [
      { size: 8 as const, stock: 10 },
      { size: 8.5 as const, stock: 8 },
      { size: 9 as const, stock: 15 },
      { size: 9.5 as const, stock: 12 },
      { size: 10 as const, stock: 18 },
      { size: 10.5 as const, stock: 9 },
      { size: 11 as const, stock: 14 },
      { size: 11.5 as const, stock: 7 },
      { size: 12 as const, stock: 10 },
      { size: 13 as const, stock: 5 },
      { size: 14 as const, stock: 3 },
    ],
    images: [
      { url: SHOE_IMAGES.basketball1, alt: "Court Dominator High - Championship Gold" },
      { url: SHOE_IMAGES.basketball2, alt: "Court Dominator High - detail" },
    ],
    features: [
      "Dual Zoom Air cushioning units",
      "Containment wires for lockdown fit",
      "High-top ankle support",
      "Herringbone traction pattern",
      "Lightweight Phylon midsole",
    ],
    rating: 4.7,
    reviewCount: 189,
    isFeatured: true,
    isNew: true,
    isBestseller: false,
    createdAt: "2026-08-20T00:00:00Z",
  },
  {
    id: "4",
    name: "GripKing Skate Pro",
    slug: "gripking-skate-pro",
    brand: "Vans",
    description:
      "Designed with skaters in mind, featuring vulcanized construction and superior board feel.",
    longDescription:
      "The GripKing Skate Pro is built for the demands of daily skateboarding. The vulcanized sole construction provides excellent board feel and flexibility, while the DURACAP reinforcement in high-wear areas ensures long-lasting durability. The PopCush energy-return sockliner absorbs heavy impacts from big tricks, and the waffle outsole pattern delivers consistent grip on any surface.",
    price: 84.99,
    category: "skateboarding",
    gender: "unisex",
    colors: [
      { name: "Checkerboard Black", hex: "#1C1C1E" },
      { name: "Navy White", hex: "#003366" },
      { name: "Marshmallow", hex: "#F5F0E8" },
    ],
    selectedColor: "Checkerboard Black",
    sizes: defaultSizes,
    images: [
      { url: SHOE_IMAGES.skate1, alt: "GripKing Skate Pro - Checkerboard Black" },
      { url: SHOE_IMAGES.skate2, alt: "GripKing Skate Pro - lifestyle" },
    ],
    features: [
      "Vulcanized sole construction",
      "DURACAP reinforcement",
      "PopCush energy-return sockliner",
      "Waffle grip outsole",
      "Canvas and suede upper",
    ],
    rating: 4.5,
    reviewCount: 623,
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "5",
    name: "TrailBlazer GTX",
    slug: "trailblazer-gtx",
    brand: "Salomon",
    description:
      "Waterproof hiking shoe with aggressive grip and all-day support for challenging trails.",
    longDescription:
      "Conquer any trail with the TrailBlazer GTX. This waterproof hiking shoe features a GORE-TEX membrane that keeps your feet dry in any conditions, while the Contagrip outsole provides reliable traction on wet rocks, mud, and loose terrain. The SensiFit cradle secures your foot for stability on uneven ground, and the OrthoLite sockliner delivers long-lasting cushioning for all-day comfort on extended hikes.",
    price: 149.99,
    category: "hiking",
    gender: "men",
    colors: [
      { name: "Forest Moss", hex: "#4A5D23" },
      { name: "Granite Grey", hex: "#6B6B6B" },
      { name: "Rust Orange", hex: "#C46210" },
    ],
    selectedColor: "Forest Moss",
    sizes: [
      { size: 7 as const, stock: 8 },
      { size: 8 as const, stock: 12 },
      { size: 8.5 as const, stock: 9 },
      { size: 9 as const, stock: 15 },
      { size: 9.5 as const, stock: 11 },
      { size: 10 as const, stock: 14 },
      { size: 10.5 as const, stock: 7 },
      { size: 11 as const, stock: 10 },
      { size: 12 as const, stock: 6 },
      { size: 13 as const, stock: 3 },
    ],
    images: [
      { url: SHOE_IMAGES.hiking1, alt: "TrailBlazer GTX - Forest Moss" },
      { url: SHOE_IMAGES.hiking2, alt: "TrailBlazer GTX - trail action" },
    ],
    features: [
      "GORE-TEX waterproof membrane",
      "Contagrip MA outsole",
      "SensiFit foot cradle",
      "OrthoLite sockliner",
      "Protective toe cap",
    ],
    rating: 4.9,
    reviewCount: 267,
    isFeatured: true,
    isNew: false,
    isBestseller: false,
    createdAt: "2026-05-10T00:00:00Z",
  },
  {
    id: "6",
    name: "FlexForce Trainer",
    slug: "flexforce-trainer",
    brand: "Under Armour",
    description:
      "Versatile training shoe built for gym workouts, HIIT sessions, and lightweight running.",
    longDescription:
      "The FlexForce Trainer is your ultimate gym companion. Designed for versatile training, it features a wide, flat base for stability during deadlifts and squats, a flexible forefoot for agile movements, and responsive Charged Cushioning that absorbs impact during plyometric exercises. The breathable mesh upper keeps your feet cool during intense sessions, and the rubber outsole provides excellent grip on gym floors.",
    price: 109.99,
    category: "training",
    gender: "unisex",
    colors: [
      { name: "Electric Purple", hex: "#6A0DAD" },
      { name: "Neon Volt", hex: "#CDDC39" },
      { name: "Stealth Grey", hex: "#4A4A4A" },
    ],
    selectedColor: "Electric Purple",
    sizes: defaultSizes,
    images: [
      { url: SHOE_IMAGES.training1, alt: "FlexForce Trainer - Electric Purple" },
      { url: SHOE_IMAGES.training2, alt: "FlexForce Trainer - detail" },
    ],
    features: [
      "Charged Cushioning midsole",
      "Wide, flat base for stability",
      "Flexible forefoot grooves",
      "Breathable mesh upper",
      "Durable rubber outsole",
    ],
    rating: 4.4,
    reviewCount: 412,
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    createdAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "7",
    name: "StreetLine Retro",
    slug: "streetline-retro",
    brand: "New Balance",
    description:
      "Classic heritage design meets modern comfort in this iconic retro-inspired sneaker.",
    longDescription:
      "The StreetLine Retro celebrates New Balance's rich heritage with a modern twist. Featuring the iconic 'N' logo, premium pigskin suede and mesh upper, and an ENCAP midsole that combines lightweight foam with a durable polyurethane rim for total support. This shoe transitions seamlessly from casual outings to city exploration, offering all-day comfort with timeless style.",
    price: 99.99,
    compareAtPrice: 129.99,
    category: "casual",
    gender: "men",
    colors: [
      { name: "Navy Silver", hex: "#1B2A49" },
      { name: "Burgundy Gold", hex: "#722F37" },
      { name: "Grey White", hex: "#9E9E9E" },
    ],
    selectedColor: "Navy Silver",
    sizes: defaultSizes,
    images: [
      { url: SHOE_IMAGES.casual2, alt: "StreetLine Retro - Navy Silver" },
      { url: SHOE_IMAGES.casual3, alt: "StreetLine Retro - on feet" },
    ],
    features: [
      "ENCAP midsole technology",
      "Premium pigskin suede upper",
      "Breathable mesh panels",
      "Rubber outsole",
      "Classic heritage design",
    ],
    rating: 4.7,
    reviewCount: 891,
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    createdAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "8",
    name: "SprintEdge Racer",
    slug: "sprintedge-racer",
    brand: "Asics",
    description:
      "Lightweight racing flat engineered for speed-focused runners chasing personal bests.",
    longDescription:
      "The SprintEdge Racer is a no-compromise racing shoe built for speed. Featuring Asics FlyteFoam Blast in the midsole for an incredibly lightweight yet responsive ride, a mono-sock upper construction that eliminates excess material, and a carbon-reinforced plate that promotes forward propulsion. At just 6.2 oz, these shoes are designed for runners who want to feel fast from the starting line to the finish.",
    price: 199.99,
    category: "running",
    gender: "unisex",
    colors: [
      { name: "Sunrise Coral", hex: "#FF6F61" },
      { name: "Aqua Blue", hex: "#00BCD4" },
      { name: "White Silver", hex: "#FAFAFA" },
    ],
    selectedColor: "Sunrise Coral",
    sizes: [
      { size: 6 as const, stock: 5 },
      { size: 6.5 as const, stock: 7 },
      { size: 7 as const, stock: 10 },
      { size: 7.5 as const, stock: 8 },
      { size: 8 as const, stock: 12 },
      { size: 8.5 as const, stock: 9 },
      { size: 9 as const, stock: 15 },
      { size: 9.5 as const, stock: 11 },
      { size: 10 as const, stock: 13 },
      { size: 10.5 as const, stock: 6 },
      { size: 11 as const, stock: 8 },
    ],
    images: [
      { url: SHOE_IMAGES.running2, alt: "SprintEdge Racer - Sunrise Coral" },
      { url: SHOE_IMAGES.running3, alt: "SprintEdge Racer - detail" },
    ],
    features: [
      "FlyteFoam Blast midsole",
      "Carbon-reinforced propulsion plate",
      "Mono-sock upper construction",
      "ASICSGRIP outsole",
      "Only 6.2 oz (176g)",
    ],
    rating: 4.6,
    reviewCount: 156,
    isFeatured: true,
    isNew: true,
    isBestseller: false,
    createdAt: "2026-09-15T00:00:00Z",
  },
  {
    id: "9",
    name: "Alpine Trekker Boot",
    slug: "alpine-trekker-boot",
    brand: "Merrell",
    description:
      "Rugged mid-cut hiking boot with Vibram soles and waterproof protection for serious terrain.",
    longDescription:
      "Take on the mountains with the Alpine Trekker Boot. This mid-cut hiking boot provides ankle support and protection on rugged terrain, with a Vibram TC5+ outsole for exceptional grip on any surface. The waterproof leather and mesh upper keeps your feet dry, while the Merrell Air Cushion in the heel absorbs shock on descents. Built for hikers who push boundaries.",
    price: 174.99,
    category: "hiking",
    gender: "men",
    colors: [
      { name: "Earth Brown", hex: "#6B4226" },
      { name: "Charcoal", hex: "#36454F" },
    ],
    selectedColor: "Earth Brown",
    sizes: [
      { size: 8 as const, stock: 9 },
      { size: 8.5 as const, stock: 7 },
      { size: 9 as const, stock: 12 },
      { size: 9.5 as const, stock: 10 },
      { size: 10 as const, stock: 15 },
      { size: 10.5 as const, stock: 8 },
      { size: 11 as const, stock: 11 },
      { size: 12 as const, stock: 5 },
      { size: 13 as const, stock: 3 },
    ],
    images: [
      { url: SHOE_IMAGES.hiking2, alt: "Alpine Trekker Boot - Earth Brown" },
      { url: SHOE_IMAGES.hiking1, alt: "Alpine Trekker Boot - trail" },
    ],
    features: [
      "Vibram TC5+ outsole",
      "Waterproof leather upper",
      "Merrell Air Cushion heel",
      "Mid-cut ankle support",
      "Protective rubber toe cap",
    ],
    rating: 4.8,
    reviewCount: 334,
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    createdAt: "2026-04-05T00:00:00Z",
  },
  {
    id: "10",
    name: "DunkForce Elite",
    slug: "dunkforce-elite",
    brand: "Jordan",
    description:
      "Premium basketball shoe with Air Jordan cushioning and iconic design for on and off the court.",
    longDescription:
      "The DunkForce Elite combines Air Jordan's legendary style with cutting-edge basketball technology. Featuring encapsulated Air-Sole units for responsive cushioning, a reinforced leather and synthetic upper for durability, and a solid rubber outsole with a multidirectional pattern for superior court traction. This shoe honors basketball's greatest legacy while delivering modern performance.",
    price: 224.99,
    category: "basketball",
    gender: "men",
    colors: [
      { name: "Bred Black Red", hex: "#B71C1C" },
      { name: "Royal Blue", hex: "#1565C0" },
      { name: "Shadow Grey", hex: "#616161" },
    ],
    selectedColor: "Bred Black Red",
    sizes: [
      { size: 8 as const, stock: 6 },
      { size: 9 as const, stock: 10 },
      { size: 9.5 as const, stock: 8 },
      { size: 10 as const, stock: 12 },
      { size: 10.5 as const, stock: 7 },
      { size: 11 as const, stock: 9 },
      { size: 11.5 as const, stock: 4 },
      { size: 12 as const, stock: 6 },
      { size: 13 as const, stock: 3 },
    ],
    images: [
      { url: SHOE_IMAGES.basketball2, alt: "DunkForce Elite - Bred Black Red" },
      { url: SHOE_IMAGES.basketball1, alt: "DunkForce Elite - on court" },
    ],
    features: [
      "Encapsulated Air-Sole units",
      "Premium leather upper",
      "Solid rubber outsole",
      "Multidirectional traction pattern",
      "Padded collar and tongue",
    ],
    rating: 4.9,
    reviewCount: 478,
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    createdAt: "2026-06-20T00:00:00Z",
  },
  {
    id: "11",
    name: "WaveRider 3000",
    slug: "waverider-3000",
    brand: "Mizuno",
    description:
      "Smooth-riding neutral running shoe with Mizuno Wave technology for balanced cushioning.",
    longDescription:
      "Experience the legendary smooth ride of the WaveRider 3000. Mizuno's signature Wave plate technology disperses impact energy across a broader area, providing a smooth and stable ride without sacrificing cushioning. The ENERZY foam midsole delivers soft, responsive comfort, and the engineered mesh upper provides breathable support mile after mile.",
    price: 139.99,
    category: "running",
    gender: "women",
    colors: [
      { name: "Lavender Mist", hex: "#E6E0F8" },
      { name: "Rose Pink", hex: "#E91E63" },
      { name: "Glacier White", hex: "#ECEFF1" },
    ],
    selectedColor: "Lavender Mist",
    sizes: [
      { size: 6 as const, stock: 10 },
      { size: 6.5 as const, stock: 12 },
      { size: 7 as const, stock: 15 },
      { size: 7.5 as const, stock: 11 },
      { size: 8 as const, stock: 14 },
      { size: 8.5 as const, stock: 9 },
      { size: 9 as const, stock: 13 },
      { size: 9.5 as const, stock: 7 },
      { size: 10 as const, stock: 8 },
    ],
    images: [
      { url: SHOE_IMAGES.running3, alt: "WaveRider 3000 - Lavender Mist" },
      { url: SHOE_IMAGES.running1, alt: "WaveRider 3000 - action shot" },
    ],
    features: [
      "Mizuno Wave plate technology",
      "ENERZY foam midsole",
      "Engineered mesh upper",
      "U4icX strobel lasting",
      "X10 carbon rubber outsole",
    ],
    rating: 4.5,
    reviewCount: 299,
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    createdAt: "2026-08-01T00:00:00Z",
  },
  {
    id: "12",
    name: "UrbanGlide Slip-On",
    slug: "urbanglide-slip-on",
    brand: "Puma",
    description:
      "Effortless slip-on design with premium cushioning for the modern urban explorer.",
    longDescription:
      "The UrbanGlide Slip-On redefines casual comfort. With its laceless slip-on design, premium knit upper that hugs your foot like a sock, and NRGY bead cushioning in the midsole, this shoe delivers all-day comfort without compromising on style. The TPU heel clip provides structure and support, while the rubber outsole ensures reliable traction on city streets.",
    price: 89.99,
    category: "casual",
    gender: "women",
    colors: [
      { name: "Blush Pink", hex: "#F8BBD0" },
      { name: "Sand Beige", hex: "#D7CCC8" },
      { name: "Midnight Black", hex: "#212121" },
    ],
    selectedColor: "Blush Pink",
    sizes: [
      { size: 6 as const, stock: 14 },
      { size: 6.5 as const, stock: 11 },
      { size: 7 as const, stock: 16 },
      { size: 7.5 as const, stock: 13 },
      { size: 8 as const, stock: 18 },
      { size: 8.5 as const, stock: 10 },
      { size: 9 as const, stock: 12 },
      { size: 9.5 as const, stock: 7 },
      { size: 10 as const, stock: 5 },
    ],
    images: [
      { url: SHOE_IMAGES.casual3, alt: "UrbanGlide Slip-On - Blush Pink" },
      { url: SHOE_IMAGES.casual1, alt: "UrbanGlide Slip-On - lifestyle" },
    ],
    features: [
      "Laceless slip-on design",
      "Premium knit upper",
      "NRGY bead cushioning",
      "TPU heel clip",
      "Flexible rubber outsole",
    ],
    rating: 4.3,
    reviewCount: 567,
    isFeatured: false,
    isNew: false,
    isBestseller: true,
    createdAt: "2026-02-14T00:00:00Z",
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isFeatured);
}

export function getNewArrivals(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getBestsellers(): Product[] {
  return products.filter((p) => p.isBestseller);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsByBrand(brand: string): Product[] {
  return products.filter((p) => p.brand === brand);
}

export function getAllBrands(): string[] {
  return [...new Set(products.map((p) => p.brand))].sort();
}

export function getAllCategories(): string[] {
  return [...new Set(products.map((p) => p.category))].sort();
}

export function filterAndSortProducts(
  filters: {
    category?: string;
    gender?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sizes?: number[];
    search?: string;
  },
  sort?: string
): Product[] {
  let filtered = [...products];

  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }
  if (filters.gender) {
    filtered = filtered.filter((p) => p.gender === filters.gender);
  }
  if (filters.brand) {
    filtered = filtered.filter((p) => p.brand === filters.brand);
  }
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }
  if (filters.sizes && filters.sizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.sizes.some(
        (s) => filters.sizes!.includes(s.size) && s.stock > 0
      )
    );
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
    );
  }

  // Sort
  switch (sort) {
    case "price-asc":
      filtered.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filtered.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case "name-asc":
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "bestselling":
      filtered.sort((a, b) => b.reviewCount - a.reviewCount);
      break;
    default:
      // Default: featured first, then newest
      filtered.sort((a, b) => {
        if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }

  return filtered;
}

export const categoryLabels: Record<string, string> = {
  running: "Running",
  casual: "Casual & Lifestyle",
  basketball: "Basketball",
  skateboarding: "Skateboarding",
  hiking: "Hiking & Outdoor",
  training: "Training & Gym",
};

export const categoryDescriptions: Record<string, string> = {
  running: "Performance running shoes engineered for speed, comfort, and endurance.",
  casual: "Everyday sneakers combining premium style with all-day comfort.",
  basketball: "Court-ready basketball shoes built for explosive performance.",
  skateboarding: "Durable skate shoes with superior board feel and grip.",
  hiking: "Trail-ready hiking shoes with waterproof protection and rugged traction.",
  training: "Versatile training shoes for gym workouts and cross-training.",
};

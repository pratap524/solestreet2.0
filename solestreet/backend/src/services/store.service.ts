import mongoose from "mongoose";
import { products as initialProducts } from "../data/products.js";
import { INITIAL_COUPONS } from "../data/coupons.js";
import { ProductModel } from "../models/product.model.js";
import { OrderModel } from "../models/order.model.js";
import { CouponModel } from "../models/coupon.model.js";
import { ReviewModel } from "../models/review.model.js";
import {
  Product,
  ProductFilters,
  SortOption,
  Order,
  OrderItem,
  Review,
  Coupon,
  ShoeSize,
} from "../types/index.js";

function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

// Global in-memory fallback state
let productsList: Product[] = [...initialProducts];
let couponsList: Coupon[] = [...INITIAL_COUPONS];
let ordersList: Order[] = [];
let reviewsList: Review[] = [
  {
    id: "rev_1",
    productId: "1",
    userId: "usr_demo1",
    userName: "Alex Johnson",
    rating: 5,
    title: "Best running shoes I've ever owned!",
    comment: "The cushioning is incredible and they feel feather-light. Logged over 100km already without any issues.",
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: "approved",
  },
  {
    id: "rev_2",
    productId: "1",
    userId: "usr_demo2",
    userName: "Sarah Miller",
    rating: 4,
    title: "Very comfortable, fits true to size",
    comment: "Great quality materials and stylish look. Took about 2 runs to break in properly.",
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: "approved",
  },
];

export const StoreService = {
  // ─── Products ──────────────────────────────────────────────
  async getProducts(filters?: ProductFilters, sort?: SortOption): Promise<Product[]> {
    if (isDbConnected()) {
      try {
        const query: any = {};
        if (filters?.category) query.category = filters.category;
        if (filters?.gender && filters.gender !== "unisex") {
          query.gender = { $in: [filters.gender, "unisex"] };
        }
        if (filters?.brand) {
          query.brand = new RegExp(`^${filters.brand}$`, "i");
        }
        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
          query.price = {};
          if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice;
          if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice;
        }
        if (filters?.sizes && filters.sizes.length > 0) {
          query.sizes = {
            $elemMatch: { size: { $in: filters.sizes }, stock: { $gt: 0 } },
          };
        }
        if (filters?.search) {
          const q = filters.search.trim();
          query.$or = [
            { name: { $regex: q, $options: "i" } },
            { brand: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
          ];
        }

        let sortOption: any = { createdAt: -1 };
        if (sort) {
          switch (sort) {
            case "price-asc":
              sortOption = { price: 1 };
              break;
            case "price-desc":
              sortOption = { price: -1 };
              break;
            case "rating":
              sortOption = { rating: -1 };
              break;
            case "bestselling":
              sortOption = { isBestseller: -1 };
              break;
            case "name-asc":
              sortOption = { name: 1 };
              break;
            case "newest":
            default:
              sortOption = { createdAt: -1 };
          }
        }

        const docs = await ProductModel.find(query).sort(sortOption).lean();
        return docs.map((d: any) => ({
          ...d,
          id: d.id,
          _id: undefined,
        })) as Product[];
      } catch (err) {
        console.error("MongoDB query error, falling back to in-memory:", err);
      }
    }

    // In-memory fallback
    let result = [...productsList];
    if (filters?.category) result = result.filter((p) => p.category === filters.category);
    if (filters?.gender && filters.gender !== "unisex") {
      result = result.filter((p) => p.gender === filters.gender || p.gender === "unisex");
    }
    if (filters?.brand) {
      result = result.filter((p) => p.brand.toLowerCase() === filters.brand?.toLowerCase());
    }
    if (filters?.minPrice !== undefined) result = result.filter((p) => p.price >= filters.minPrice!);
    if (filters?.maxPrice !== undefined) result = result.filter((p) => p.price <= filters.maxPrice!);
    if (filters?.sizes && filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes.some((s) => filters.sizes!.includes(s.size) && s.stock > 0)
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (sort) {
      switch (sort) {
        case "price-asc":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price-desc":
          result.sort((a, b) => b.price - a.price);
          break;
        case "rating":
          result.sort((a, b) => b.rating - a.rating);
          break;
        case "bestselling":
          result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
          break;
        case "name-asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "newest":
        default:
          result.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    }

    return result;
  },

  async getProductByIdOrSlug(identifier: string): Promise<Product | undefined> {
    if (isDbConnected()) {
      try {
        const doc = await ProductModel.findOne({
          $or: [{ id: identifier }, { slug: identifier }],
        }).lean();
        if (doc) {
          const item: any = doc;
          return { ...item, id: item.id, _id: undefined } as Product;
        }
      } catch (err) {
        console.error("MongoDB getProductByIdOrSlug error:", err);
      }
    }
    return productsList.find((p) => p.id === identifier || p.slug === identifier);
  },

  async createProduct(data: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: "prod_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        await ProductModel.create(newProduct);
      } catch (err) {
        console.error("MongoDB createProduct error:", err);
      }
    }
    productsList.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const updatedPayload = { ...updates, updatedAt: new Date().toISOString() };
    if (isDbConnected()) {
      try {
        const doc = await ProductModel.findOneAndUpdate({ id }, { $set: updatedPayload }, { new: true }).lean();
        if (doc) {
          const item: any = doc;
          return { ...item, id: item.id, _id: undefined } as Product;
        }
      } catch (err) {
        console.error("MongoDB updateProduct error:", err);
      }
    }

    const idx = productsList.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    productsList[idx] = { ...productsList[idx], ...updatedPayload };
    return productsList[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isDbConnected()) {
      try {
        const res = await ProductModel.deleteOne({ id });
        return res.deletedCount > 0;
      } catch (err) {
        console.error("MongoDB deleteProduct error:", err);
      }
    }
    const initialLen = productsList.length;
    productsList = productsList.filter((p) => p.id !== id);
    return productsList.length < initialLen;
  },

  async checkInventory(items: { productId: string; size: ShoeSize; quantity: number }[]): Promise<{
    valid: boolean;
    message?: string;
  }> {
    for (const item of items) {
      const product = await this.getProductByIdOrSlug(item.productId);
      if (!product) {
        return { valid: false, message: `Product ${item.productId} not found.` };
      }
      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (!sizeObj || sizeObj.stock < item.quantity) {
        return {
          valid: false,
          message: `Insufficient stock for ${product.name} (Size ${item.size}). Available: ${sizeObj ? sizeObj.stock : 0}`,
        };
      }
    }
    return { valid: true };
  },

  async decrementInventory(items: { productId: string; size: ShoeSize; quantity: number }[]) {
    for (const item of items) {
      const product = await this.getProductByIdOrSlug(item.productId);
      if (product) {
        const updatedSizes = product.sizes.map((s) => {
          if (s.size === item.size) {
            return { ...s, stock: Math.max(0, s.stock - item.quantity) };
          }
          return s;
        });
        await this.updateProduct(product.id, { sizes: updatedSizes });
      }
    }
  },

  // ─── Coupons ──────────────────────────────────────────────
  async getCoupons(): Promise<Coupon[]> {
    if (isDbConnected()) {
      try {
        const docs = await CouponModel.find().lean();
        return docs.map((d: any) => ({ ...d, id: d.id, _id: undefined })) as Coupon[];
      } catch (err) {
        console.error("MongoDB getCoupons error:", err);
      }
    }
    return couponsList;
  },

  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{ valid: boolean; discountAmount: number; message?: string }> {
    let coupon: Coupon | undefined;

    if (isDbConnected()) {
      try {
        const doc = await CouponModel.findOne({
          code: code.trim().toUpperCase(),
          isActive: true,
        }).lean();
        if (doc) {
          const item: any = doc;
          coupon = { ...item, id: item.id, _id: undefined } as Coupon;
        }
      } catch (err) {
        console.error("MongoDB validateCoupon error:", err);
      }
    }

    if (!coupon) {
      coupon = couponsList.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
      );
    }

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: "Invalid or inactive coupon code" };
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: "This coupon code has expired" };
    }
    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return {
        valid: false,
        discountAmount: 0,
        message: `Minimum order of ₹${coupon.minSpend} required for this coupon`,
      };
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = (subtotal * coupon.discountPercent) / 100;
    } else if (coupon.discountAmount) {
      discount = Math.min(subtotal, coupon.discountAmount);
    }

    return { valid: true, discountAmount: Math.round(discount * 100) / 100 };
  },

  async createCoupon(coupon: Omit<Coupon, "id" | "usageCount">): Promise<Coupon> {
    const newCoupon: Coupon = {
      ...coupon,
      id: "coupon_" + Date.now(),
      usageCount: 0,
    };

    if (isDbConnected()) {
      try {
        await CouponModel.create(newCoupon);
      } catch (err) {
        console.error("MongoDB createCoupon error:", err);
      }
    }

    couponsList.push(newCoupon);
    return newCoupon;
  },

  // ─── Orders ──────────────────────────────────────────────
  async getOrders(userId?: string): Promise<Order[]> {
    if (isDbConnected()) {
      try {
        const query = userId ? { userId } : {};
        const docs = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
        return docs.map((d: any) => ({ ...d, id: d.id, _id: undefined })) as Order[];
      } catch (err) {
        console.error("MongoDB getOrders error:", err);
      }
    }

    if (userId) {
      return ordersList.filter((o) => o.userId === userId);
    }
    return ordersList;
  },

  async getOrderById(id: string): Promise<Order | undefined> {
    if (isDbConnected()) {
      try {
        const doc = await OrderModel.findOne({ id }).lean();
        if (doc) {
          const item: any = doc;
          return { ...item, id: item.id, _id: undefined } as Order;
        }
      } catch (err) {
        console.error("MongoDB getOrderById error:", err);
      }
    }
    return ordersList.find((o) => o.id === id);
  },

  async createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: "ord_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDbConnected()) {
      try {
        await OrderModel.create(newOrder);
      } catch (err) {
        console.error("MongoDB createOrder error:", err);
      }
    }

    ordersList.unshift(newOrder);

    // Decrement stock
    await this.decrementInventory(
      newOrder.items.map((i) => ({
        productId: i.productId,
        size: i.size,
        quantity: i.quantity,
      }))
    );

    // Increment coupon usage
    if (newOrder.couponCode) {
      if (isDbConnected()) {
        try {
          await CouponModel.updateOne(
            { code: newOrder.couponCode.toUpperCase() },
            { $inc: { usageCount: 1 } }
          );
        } catch (err) {
          console.error("MongoDB update coupon usage error:", err);
        }
      }
      const c = couponsList.find(
        (item) => item.code.toUpperCase() === newOrder.couponCode?.toUpperCase()
      );
      if (c) c.usageCount = (c.usageCount || 0) + 1;
    }

    return newOrder;
  },

  async updateOrderStatus(
    id: string,
    updates: Partial<Pick<Order, "paymentStatus" | "fulfillmentStatus" | "trackingNumber" | "notes">>
  ): Promise<Order | null> {
    const payload = { ...updates, updatedAt: new Date().toISOString() };
    if (isDbConnected()) {
      try {
        const doc = await OrderModel.findOneAndUpdate({ id }, { $set: payload }, { new: true }).lean();
        if (doc) {
          const item: any = doc;
          return { ...item, id: item.id, _id: undefined } as Order;
        }
      } catch (err) {
        console.error("MongoDB updateOrderStatus error:", err);
      }
    }

    const order = ordersList.find((o) => o.id === id);
    if (!order) return null;
    Object.assign(order, payload);
    return order;
  },

  // ─── Reviews ──────────────────────────────────────────────
  async getReviews(productId?: string): Promise<Review[]> {
    if (isDbConnected()) {
      try {
        const query: any = { status: { $ne: "hidden" } };
        if (productId) query.productId = productId;
        const docs = await ReviewModel.find(query).sort({ createdAt: -1 }).lean();
        return docs.map((d: any) => ({ ...d, id: d.id, _id: undefined })) as Review[];
      } catch (err) {
        console.error("MongoDB getReviews error:", err);
      }
    }

    if (productId) {
      return reviewsList.filter((r) => r.productId === productId && r.status !== "hidden");
    }
    return reviewsList;
  },

  async addReview(data: Omit<Review, "id" | "createdAt" | "status">): Promise<Review> {
    const review: Review = {
      ...data,
      id: "rev_" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "approved",
    };

    if (isDbConnected()) {
      try {
        await ReviewModel.create(review);
      } catch (err) {
        console.error("MongoDB addReview error:", err);
      }
    }

    reviewsList.unshift(review);

    // Recalculate product rating & review count
    const prodReviews = await this.getReviews(review.productId);
    const approvedReviews = prodReviews.filter((r) => r.status === "approved");
    const avg =
      approvedReviews.length > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
        : 5;
    await this.updateProduct(review.productId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: approvedReviews.length,
    });

    return review;
  },

  async updateReviewStatus(id: string, status: "pending" | "approved" | "hidden"): Promise<Review | null> {
    if (isDbConnected()) {
      try {
        const doc = await ReviewModel.findOneAndUpdate(
          { id },
          { $set: { status, updatedAt: new Date().toISOString() } },
          { new: true }
        ).lean();
        if (doc) {
          const item: any = doc;
          return { ...item, id: item.id, _id: undefined } as Review;
        }
      } catch (err) {
        console.error("MongoDB updateReviewStatus error:", err);
      }
    }

    const rev = reviewsList.find((r) => r.id === id);
    if (!rev) return null;
    rev.status = status;
    return rev;
  },

  // ─── Admin Overview ─────────────────────────────────────────
  async getAdminStats() {
    const orders = await this.getOrders();
    const products = await this.getProducts();

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "succeeded")
      .reduce((sum, o) => sum + o.total, 0);

    const uniqueCustomers = new Set(orders.map((o) => o.customer.email)).size;

    let lowStockCount = 0;
    products.forEach((p) => {
      const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
      if (totalStock < 10) lowStockCount++;
    });

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: orders.length,
      totalCustomers: uniqueCustomers,
      totalProducts: products.length,
      lowStockProducts: lowStockCount,
      recentOrders: orders.slice(0, 5),
    };
  },
};

import mongoose from "mongoose";
import { config } from "./index.js";
import { ProductModel } from "../models/product.model.js";
import { CouponModel } from "../models/coupon.model.js";
import { products as initialProducts } from "../data/products.js";
import { INITIAL_COUPONS } from "../data/coupons.js";

export async function connectDB(): Promise<boolean> {
  const uri = config.mongodbUri;

  if (!config.isMongoConfigured()) {
    console.log("ℹ️  MongoDB: URI contains '<db_password>' placeholder or is not configured.");
    console.log("ℹ️  Running in mock/in-memory mode until valid password is provided in .env");
    return false;
  }

  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ Successfully connected to MongoDB Atlas!");

    // Seed products if collection is empty
    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      console.log("🌱 Seeding initial products to MongoDB...");
      await ProductModel.insertMany(initialProducts);
      console.log(`✅ Seeded ${initialProducts.length} products to MongoDB.`);
    }

    // Seed coupons if collection is empty
    const couponCount = await CouponModel.countDocuments();
    if (couponCount === 0) {
      console.log("🌱 Seeding initial coupons to MongoDB...");
      await CouponModel.insertMany(INITIAL_COUPONS);
      console.log(`✅ Seeded ${INITIAL_COUPONS.length} coupons to MongoDB.`);
    }

    return true;
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️  Falling back to in-memory store so server stays active.");
    return false;
  }
}

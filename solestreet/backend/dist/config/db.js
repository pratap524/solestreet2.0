"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const index_js_1 = require("./index.js");
const product_model_js_1 = require("../models/product.model.js");
const coupon_model_js_1 = require("../models/coupon.model.js");
const products_js_1 = require("../data/products.js");
const coupons_js_1 = require("../data/coupons.js");
async function connectDB() {
    const uri = index_js_1.config.mongodbUri;
    if (!index_js_1.config.isMongoConfigured()) {
        console.log("ℹ️  MongoDB: URI contains '<db_password>' placeholder or is not configured.");
        console.log("ℹ️  Running in mock/in-memory mode until valid password is provided in .env");
        return false;
    }
    try {
        console.log("⏳ Connecting to MongoDB Atlas...");
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 8000,
        });
        console.log("✅ Successfully connected to MongoDB Atlas!");
        // Seed products if collection is empty
        const productCount = await product_model_js_1.ProductModel.countDocuments();
        if (productCount === 0) {
            console.log("🌱 Seeding initial products to MongoDB...");
            await product_model_js_1.ProductModel.insertMany(products_js_1.products);
            console.log(`✅ Seeded ${products_js_1.products.length} products to MongoDB.`);
        }
        // Seed coupons if collection is empty
        const couponCount = await coupon_model_js_1.CouponModel.countDocuments();
        if (couponCount === 0) {
            console.log("🌱 Seeding initial coupons to MongoDB...");
            await coupon_model_js_1.CouponModel.insertMany(coupons_js_1.INITIAL_COUPONS);
            console.log(`✅ Seeded ${coupons_js_1.INITIAL_COUPONS.length} coupons to MongoDB.`);
        }
        return true;
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        console.log("⚠️  Falling back to in-memory store so server stays active.");
        return false;
    }
}

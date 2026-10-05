"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ColorSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    hex: { type: String, required: true },
}, { _id: false });
const SizeStockSchema = new mongoose_1.Schema({
    size: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
}, { _id: false });
const ProductImageSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    alt: { type: String, required: true },
}, { _id: false });
const ProductSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true, index: true },
    description: { type: String, required: true },
    longDescription: { type: String, default: "" },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    category: {
        type: String,
        enum: ["running", "casual", "basketball", "skateboarding", "hiking", "training"],
        required: true,
        index: true,
    },
    gender: {
        type: String,
        enum: ["men", "women", "unisex"],
        required: true,
        index: true,
    },
    colors: [ColorSchema],
    selectedColor: { type: String, default: "" },
    sizes: [SizeStockSchema],
    images: [ProductImageSchema],
    features: [{ type: String }],
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isNew: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
}, {
    timestamps: false,
    versionKey: false,
    suppressReservedKeysWarning: true,
});
exports.ProductModel = mongoose_1.default.models.Product || mongoose_1.default.model("Product", ProductSchema);

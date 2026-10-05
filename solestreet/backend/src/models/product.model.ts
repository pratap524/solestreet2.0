import mongoose, { Schema, Document } from "mongoose";
import { Product } from "../types/index.js";

export interface IProductDocument extends Omit<Product, "id">, Document {
  id: string;
}

const ColorSchema = new Schema(
  {
    name: { type: String, required: true },
    hex: { type: String, required: true },
  },
  { _id: false }
);

const SizeStockSchema = new Schema(
  {
    size: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
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
  },
  {
    timestamps: false,
    versionKey: false,
    suppressReservedKeysWarning: true,
  }
);

export const ProductModel =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);

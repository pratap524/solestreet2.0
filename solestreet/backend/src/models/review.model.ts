import mongoose, { Schema, Document } from "mongoose";
import { Review } from "../types/index.js";

export interface IReviewDocument extends Omit<Review, "id">, Document {
  id: string;
}

const ReviewSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userPhotoURL: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: "" },
    comment: { type: String, required: true },
    isVerifiedPurchase: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "hidden", "deleted"],
      default: "approved",
      index: true,
    },
    orderId: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReviewDocument>("Review", ReviewSchema);

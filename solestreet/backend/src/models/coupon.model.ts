import mongoose, { Schema, Document } from "mongoose";
import { Coupon } from "../types/index.js";

export interface ICouponDocument extends Omit<Coupon, "id">, Document {
  id: string;
}

const CouponSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, index: true },
    discountPercent: { type: Number },
    discountAmount: { type: Number },
    minSpend: { type: Number },
    expiresAt: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const CouponModel =
  mongoose.models.Coupon || mongoose.model<ICouponDocument>("Coupon", CouponSchema);

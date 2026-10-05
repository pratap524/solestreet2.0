import mongoose, { Schema, Document } from "mongoose";
import { Order } from "../types/index.js";

export interface IOrderDocument extends Omit<Order, "id">, Document {
  id: string;
}

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    id: { type: String, default: "" },
    fullName: { type: String, required: true },
    street: { type: String, required: true },
    apartment: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, index: true },
      phone: { type: String, required: true },
    },
    shippingAddress: { type: AddressSchema, required: true },
    billingAddress: { type: AddressSchema, required: true },
    items: [OrderItemSchema],
    shippingMethod: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      estimatedDays: { type: String, required: true },
      description: { type: String, required: true },
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    fulfillmentStatus: {
      type: String,
      enum: ["unfulfilled", "processing", "shipped", "delivered", "cancelled"],
      default: "processing",
      index: true,
    },
    trackingNumber: { type: String },
    stripePaymentIntentId: { type: String },
    stripeCheckoutSessionId: { type: String },
    notes: { type: String },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const OrderModel =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

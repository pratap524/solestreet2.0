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
exports.OrderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: Number, required: true },
    quantity: { type: Number, required: true },
}, { _id: false });
const AddressSchema = new mongoose_1.Schema({
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
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
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
}, {
    timestamps: false,
    versionKey: false,
});
exports.OrderModel = mongoose_1.default.models.Order || mongoose_1.default.model("Order", OrderSchema);

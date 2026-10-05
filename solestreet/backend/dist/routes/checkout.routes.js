"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const stripe_1 = __importDefault(require("stripe"));
const store_service_js_1 = require("../services/store.service.js");
const index_js_1 = require("../config/index.js");
const router = (0, express_1.Router)();
const stripe = index_js_1.config.stripe.secretKey
    ? new stripe_1.default(index_js_1.config.stripe.secretKey, { apiVersion: "2025-02-24.acacia" })
    : null;
const checkoutItemSchema = zod_1.z.object({
    productId: zod_1.z.string(),
    size: zod_1.z.number(),
    color: zod_1.z.string(),
    quantity: zod_1.z.number().int().min(1),
});
const checkoutRequestSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    customer: zod_1.z.object({
        name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(7),
    }),
    shippingAddress: zod_1.z.object({
        fullName: zod_1.z.string().min(2),
        street: zod_1.z.string().min(5),
        apartment: zod_1.z.string().optional(),
        city: zod_1.z.string().min(2),
        state: zod_1.z.string().min(2),
        zipCode: zod_1.z.string().min(4),
        country: zod_1.z.string().min(2),
        phone: zod_1.z.string().min(7),
    }),
    billingAddress: zod_1.z.object({
        fullName: zod_1.z.string().min(2),
        street: zod_1.z.string().min(5),
        apartment: zod_1.z.string().optional(),
        city: zod_1.z.string().min(2),
        state: zod_1.z.string().min(2),
        zipCode: zod_1.z.string().min(4),
        country: zod_1.z.string().min(2),
        phone: zod_1.z.string().min(7),
    }),
    shippingMethodId: zod_1.z.enum(["standard", "express"]),
    couponCode: zod_1.z.string().optional(),
    items: zod_1.z.array(checkoutItemSchema).min(1, "Cart cannot be empty"),
    paymentMethod: zod_1.z.enum(["stripe", "card"]),
});
// POST /api/checkout
router.post("/", async (req, res) => {
    try {
        const parsed = checkoutRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: "Invalid checkout request", details: parsed.error.issues });
            return;
        }
        const { userId, customer, shippingAddress, billingAddress, shippingMethodId, couponCode, items: rawItems, } = parsed.data;
        // 1. Inventory Check
        const inventoryCheck = await store_service_js_1.StoreService.checkInventory(rawItems.map((i) => ({
            productId: i.productId,
            size: i.size,
            quantity: i.quantity,
        })));
        if (!inventoryCheck.valid) {
            res.status(400).json({ error: inventoryCheck.message || "Some items are out of stock" });
            return;
        }
        // 2. Server-side Price Verification
        const verifiedItems = [];
        let subtotal = 0;
        for (const raw of rawItems) {
            const canonicalProduct = await store_service_js_1.StoreService.getProductByIdOrSlug(raw.productId);
            if (!canonicalProduct) {
                res.status(400).json({ error: `Product ID ${raw.productId} does not exist` });
                return;
            }
            const itemPrice = canonicalProduct.price;
            subtotal += itemPrice * raw.quantity;
            verifiedItems.push({
                productId: canonicalProduct.id,
                name: canonicalProduct.name,
                brand: canonicalProduct.brand,
                slug: canonicalProduct.slug,
                price: itemPrice,
                image: canonicalProduct.images[0]?.url || "",
                color: raw.color,
                size: raw.size,
                quantity: raw.quantity,
            });
        }
        // 3. Discount calculation
        let discount = 0;
        if (couponCode) {
            const couponRes = await store_service_js_1.StoreService.validateCoupon(couponCode, subtotal);
            if (couponRes.valid) {
                discount = couponRes.discountAmount;
            }
        }
        // 4. Shipping Calculation
        const shippingMethod = index_js_1.config.shippingMethods.find((m) => m.id === shippingMethodId) || index_js_1.config.shippingMethods[0];
        const isFreeStandard = subtotal >= index_js_1.config.freeShippingThreshold && shippingMethod.id === "standard";
        const shippingCost = isFreeStandard ? 0 : shippingMethod.price;
        // 5. Tax & Total
        const taxableAmount = Math.max(0, subtotal - discount);
        const tax = Math.round(taxableAmount * index_js_1.config.taxRate * 100) / 100;
        const total = Math.round((taxableAmount + shippingCost + tax) * 100) / 100;
        // 6. Create Order
        const order = await store_service_js_1.StoreService.createOrder({
            userId,
            customer,
            shippingAddress: { ...shippingAddress, id: "addr_ship" },
            billingAddress: { ...billingAddress, id: "addr_bill" },
            items: verifiedItems,
            shippingMethod,
            subtotal,
            shippingCost,
            tax,
            discount,
            couponCode: couponCode || undefined,
            total,
            paymentStatus: "succeeded",
            fulfillmentStatus: "processing",
            stripePaymentIntentId: "pi_mock_" + Math.random().toString(36).substring(2, 11),
        });
        res.json({
            success: true,
            orderId: order.id,
            order,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Internal error during checkout";
        res.status(500).json({ error: message });
    }
});
// POST /api/checkout/payment-intent
router.post("/payment-intent", async (req, res) => {
    try {
        const { items, shippingMethodId, couponCode } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: "Cart is empty" });
            return;
        }
        let subtotal = 0;
        for (const item of items) {
            const product = await store_service_js_1.StoreService.getProductByIdOrSlug(item.productId);
            if (!product) {
                res.status(400).json({ error: "Invalid product in cart" });
                return;
            }
            subtotal += product.price * item.quantity;
        }
        let discount = 0;
        if (couponCode) {
            const couponRes = await store_service_js_1.StoreService.validateCoupon(couponCode, subtotal);
            if (couponRes.valid) {
                discount = couponRes.discountAmount;
            }
        }
        const shippingMethod = index_js_1.config.shippingMethods.find((m) => m.id === shippingMethodId) || index_js_1.config.shippingMethods[0];
        const isFreeStandard = subtotal >= index_js_1.config.freeShippingThreshold && shippingMethod.id === "standard";
        const shippingCost = isFreeStandard ? 0 : shippingMethod.price;
        const taxable = Math.max(0, subtotal - discount);
        const tax = taxable * index_js_1.config.taxRate;
        const totalAmount = Math.max(1, Math.round((taxable + shippingCost + tax) * 100));
        if (stripe && index_js_1.config.stripe.isConfigured()) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: totalAmount,
                currency: "inr",
                automatic_payment_methods: { enabled: true },
                metadata: {
                    itemCount: items.length.toString(),
                    couponCode: couponCode || "none",
                },
            });
            res.json({
                clientSecret: paymentIntent.client_secret,
                amount: totalAmount,
            });
            return;
        }
        // Demo fallback
        res.json({
            clientSecret: "pi_mock_secret_" + Math.random().toString(36).substring(2, 11),
            amount: totalAmount,
            isDemo: true,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize payment";
        res.status(500).json({ error: message });
    }
});
exports.default = router;

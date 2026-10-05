"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const index_js_1 = require("../config/index.js");
const store_service_js_1 = require("../services/store.service.js");
const router = (0, express_1.Router)();
const stripe = index_js_1.config.stripe.secretKey
    ? new stripe_1.default(index_js_1.config.stripe.secretKey, { apiVersion: "2025-02-24.acacia" })
    : null;
router.post("/stripe", async (req, res) => {
    const signature = req.headers["stripe-signature"];
    let event;
    try {
        if (stripe && index_js_1.config.stripe.webhookSecret && signature) {
            event = stripe.webhooks.constructEvent(req.body, signature, index_js_1.config.stripe.webhookSecret);
        }
        else {
            // In dev mode / mock
            event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : "Webhook signature failed";
        res.status(400).json({ error: msg });
        return;
    }
    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata?.orderId;
                if (orderId) {
                    await store_service_js_1.StoreService.updateOrderStatus(orderId, {
                        paymentStatus: "succeeded",
                        fulfillmentStatus: "processing",
                    });
                }
                break;
            }
            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata?.orderId;
                if (orderId) {
                    await store_service_js_1.StoreService.updateOrderStatus(orderId, {
                        paymentStatus: "failed",
                    });
                }
                break;
            }
        }
        res.json({ received: true });
    }
    catch (err) {
        res.status(500).json({ error: "Webhook handler failed" });
    }
});
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_service_js_1 = require("../services/store.service.js");
const router = (0, express_1.Router)();
// GET /api/orders (supports ?userId=...)
router.get("/", async (req, res) => {
    try {
        const { userId } = req.query;
        const orders = await store_service_js_1.StoreService.getOrders(userId ? String(userId) : undefined);
        res.json({ success: true, count: orders.length, orders });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load orders";
        res.status(500).json({ error: message });
    }
});
// GET /api/orders/:id
router.get("/:id", async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const order = await store_service_js_1.StoreService.getOrderById(id);
        if (!order) {
            res.status(404).json({ error: `Order '${id}' not found` });
            return;
        }
        res.json({ success: true, order });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load order";
        res.status(500).json({ error: message });
    }
});
// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { paymentStatus, fulfillmentStatus, trackingNumber, notes } = req.body;
        const updated = await store_service_js_1.StoreService.updateOrderStatus(id, {
            paymentStatus,
            fulfillmentStatus,
            trackingNumber,
            notes,
        });
        if (!updated) {
            res.status(404).json({ error: `Order '${id}' not found` });
            return;
        }
        res.json({ success: true, order: updated });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update order status";
        res.status(500).json({ error: message });
    }
});
exports.default = router;

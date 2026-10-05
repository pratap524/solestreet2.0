"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_service_js_1 = require("../services/store.service.js");
const router = (0, express_1.Router)();
// POST /api/coupons/validate
router.post("/validate", async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        if (!code || typeof subtotal !== "number") {
            res.status(400).json({ valid: false, message: "Code and subtotal are required" });
            return;
        }
        const result = await store_service_js_1.StoreService.validateCoupon(String(code), subtotal);
        res.json(result);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to validate coupon";
        res.status(500).json({ valid: false, message });
    }
});
// GET /api/coupons
router.get("/", async (req, res) => {
    try {
        const coupons = await store_service_js_1.StoreService.getCoupons();
        res.json({ success: true, count: coupons.length, coupons });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to retrieve coupons";
        res.status(500).json({ error: message });
    }
});
// POST /api/coupons
router.post("/", async (req, res) => {
    try {
        const { code, discountPercent, discountAmount, minSpend, expiresAt, isActive, usageLimit } = req.body;
        if (!code || (!discountPercent && !discountAmount)) {
            res.status(400).json({ error: "Code and discount value are required" });
            return;
        }
        const coupon = await store_service_js_1.StoreService.createCoupon({
            code: String(code).toUpperCase(),
            discountPercent,
            discountAmount,
            minSpend,
            expiresAt: expiresAt || new Date(Date.now() + 365 * 86400000).toISOString(),
            isActive: isActive !== false,
            usageLimit,
        });
        res.status(201).json({ success: true, coupon });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create coupon";
        res.status(500).json({ error: message });
    }
});
exports.default = router;

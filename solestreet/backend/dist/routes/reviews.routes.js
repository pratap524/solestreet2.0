"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_service_js_1 = require("../services/store.service.js");
const router = (0, express_1.Router)();
// GET /api/reviews (all reviews or filter by ?productId=)
router.get("/", async (req, res) => {
    try {
        const { productId } = req.query;
        const reviews = await store_service_js_1.StoreService.getReviews(productId ? String(productId) : undefined);
        res.json({ success: true, count: reviews.length, reviews });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load reviews";
        res.status(500).json({ error: message });
    }
});
// GET /api/reviews/product/:productId
router.get("/product/:productId", async (req, res) => {
    try {
        const productId = Array.isArray(req.params.productId) ? req.params.productId[0] : req.params.productId;
        const reviews = await store_service_js_1.StoreService.getReviews(productId);
        res.json({ success: true, count: reviews.length, reviews });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load reviews";
        res.status(500).json({ error: message });
    }
});
// POST /api/reviews
router.post("/", async (req, res) => {
    try {
        const { productId, userId, userName, userAvatar, rating, title, comment, verifiedPurchase } = req.body;
        if (!productId || !userId || !userName || !rating || !comment) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        const review = await store_service_js_1.StoreService.addReview({
            productId: String(productId),
            userId: String(userId),
            userName: String(userName),
            userPhotoURL: userAvatar ? String(userAvatar) : undefined,
            rating: Math.min(5, Math.max(1, rating)),
            title: title ? String(title) : "",
            comment: String(comment),
            isVerifiedPurchase: Boolean(verifiedPurchase),
        });
        res.status(201).json({ success: true, review });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create review";
        res.status(500).json({ error: message });
    }
});
// PATCH /api/reviews/:id/status
router.patch("/:id/status", async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { status } = req.body;
        if (!["pending", "approved", "hidden"].includes(status)) {
            res.status(400).json({ error: "Invalid status" });
            return;
        }
        const review = await store_service_js_1.StoreService.updateReviewStatus(id, status);
        if (!review) {
            res.status(404).json({ error: "Review not found" });
            return;
        }
        res.json({ success: true, review });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update review";
        res.status(500).json({ error: message });
    }
});
exports.default = router;

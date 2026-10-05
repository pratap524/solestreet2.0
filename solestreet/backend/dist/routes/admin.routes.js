"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_service_js_1 = require("../services/store.service.js");
const router = (0, express_1.Router)();
// GET /api/admin/overview
router.get("/overview", async (req, res) => {
    try {
        const stats = await store_service_js_1.StoreService.getAdminStats();
        res.json({ success: true, stats });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load admin stats";
        res.status(500).json({ error: message });
    }
});
exports.default = router;

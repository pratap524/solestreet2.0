"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const store_service_js_1 = require("../services/store.service.js");
const router = (0, express_1.Router)();
// GET /api/products
router.get("/", async (req, res) => {
    try {
        const { category, gender, brand, minPrice, maxPrice, sizes, sort, search } = req.query;
        const parsedSizes = sizes
            ? (Array.isArray(sizes) ? sizes : [sizes]).map((s) => parseFloat(String(s)))
            : undefined;
        const products = await store_service_js_1.StoreService.getProducts({
            category: category,
            gender: gender,
            brand: brand ? String(brand) : undefined,
            minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
            maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
            sizes: parsedSizes,
            search: search ? String(search) : undefined,
        }, sort);
        res.json({
            success: true,
            count: products.length,
            products,
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Error retrieving products";
        res.status(500).json({ error: message });
    }
});
// GET /api/products/:identifier (id or slug)
router.get("/:identifier", async (req, res) => {
    try {
        const identifier = Array.isArray(req.params.identifier) ? req.params.identifier[0] : req.params.identifier;
        const product = await store_service_js_1.StoreService.getProductByIdOrSlug(identifier);
        if (!product) {
            res.status(404).json({ error: `Product '${identifier}' not found` });
            return;
        }
        res.json({ success: true, product });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Error retrieving product";
        res.status(500).json({ error: message });
    }
});
// POST /api/products (Admin create)
router.post("/", async (req, res) => {
    try {
        const data = req.body;
        if (!data.name || !data.price || !data.category) {
            res.status(400).json({ error: "Missing required fields: name, price, category" });
            return;
        }
        const created = await store_service_js_1.StoreService.createProduct(data);
        res.status(201).json({ success: true, product: created });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create product";
        res.status(500).json({ error: message });
    }
});
// PUT /api/products/:id (Admin update)
router.put("/:id", async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const updated = await store_service_js_1.StoreService.updateProduct(id, req.body);
        if (!updated) {
            res.status(404).json({ error: `Product with ID '${id}' not found` });
            return;
        }
        res.json({ success: true, product: updated });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update product";
        res.status(500).json({ error: message });
    }
});
// DELETE /api/products/:id (Admin delete)
router.delete("/:id", async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const deleted = await store_service_js_1.StoreService.deleteProduct(id);
        if (!deleted) {
            res.status(404).json({ error: `Product with ID '${id}' not found` });
            return;
        }
        res.json({ success: true, message: `Product '${id}' deleted successfully` });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete product";
        res.status(500).json({ error: message });
    }
});
exports.default = router;

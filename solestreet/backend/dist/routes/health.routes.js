"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.json({
        status: "ok",
        service: "SoleStreet REST API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});
exports.default = router;

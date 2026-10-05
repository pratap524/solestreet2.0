"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const index_js_1 = require("./config/index.js");
const db_js_1 = require("./config/db.js");
const health_routes_js_1 = __importDefault(require("./routes/health.routes.js"));
const products_routes_js_1 = __importDefault(require("./routes/products.routes.js"));
const checkout_routes_js_1 = __importDefault(require("./routes/checkout.routes.js"));
const orders_routes_js_1 = __importDefault(require("./routes/orders.routes.js"));
const coupons_routes_js_1 = __importDefault(require("./routes/coupons.routes.js"));
const reviews_routes_js_1 = __importDefault(require("./routes/reviews.routes.js"));
const admin_routes_js_1 = __importDefault(require("./routes/admin.routes.js"));
const webhooks_routes_js_1 = __importDefault(require("./routes/webhooks.routes.js"));
const app = (0, express_1.default)();
// ─── Middleware ─────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow localhost on any port, clientUrl, or requests without origin
        if (!origin || origin.includes("localhost") || origin === index_js_1.config.clientUrl) {
            callback(null, true);
        }
        else {
            callback(null, true); // Permissive CORS for dev
        }
    },
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Routes ─────────────────────────────────────────────────
app.use("/api/health", health_routes_js_1.default);
app.use("/api/products", products_routes_js_1.default);
app.use("/api/checkout", checkout_routes_js_1.default);
app.use("/api/orders", orders_routes_js_1.default);
app.use("/api/coupons", coupons_routes_js_1.default);
app.use("/api/reviews", reviews_routes_js_1.default);
app.use("/api/admin", admin_routes_js_1.default);
app.use("/api/webhooks", webhooks_routes_js_1.default);
// Root greeting
app.get("/", (req, res) => {
    res.json({
        name: "SoleStreet REST API Backend",
        version: "1.0.0",
        docs: "/api/health",
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: `Route ${req.method} ${req.originalUrl} not found`,
    });
});
// Error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
    });
});
// ─── Server Listener ────────────────────────────────────────
const PORT = index_js_1.config.port;
app.listen(PORT, async () => {
    console.log(`===============================================`);
    console.log(`🚀 SoleStreet Backend running on: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`👟 Products API: http://localhost:${PORT}/api/products`);
    console.log(`💳 Checkout API: http://localhost:${PORT}/api/checkout`);
    console.log(`===============================================`);
    // Connect to MongoDB Atlas
    await (0, db_js_1.connectDB)();
});
exports.default = app;

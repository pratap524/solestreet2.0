import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "./config/index.js";
import { connectDB } from "./config/db.js";

import healthRoutes from "./routes/health.routes.js";
import productsRoutes from "./routes/products.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import couponsRoutes from "./routes/coupons.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";

const app = express();

// ─── Middleware ─────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost on any port, clientUrl, or requests without origin
      if (!origin || origin.includes("localhost") || origin === config.clientUrl) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive CORS for dev
      }
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ─────────────────────────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/coupons", couponsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhooks", webhooksRoutes);

// Root greeting
app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "SoleStreet REST API Backend",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ─── Server Listener ────────────────────────────────────────
const PORT = config.port;
app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 SoleStreet Backend running on: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`👟 Products API: http://localhost:${PORT}/api/products`);
  console.log(`💳 Checkout API: http://localhost:${PORT}/api/checkout`);
  console.log(`===============================================`);

  // Connect to MongoDB Atlas
  await connectDB();
});

export default app;

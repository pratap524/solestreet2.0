import { Router, Request, Response } from "express";
import { StoreService } from "../services/store.service.js";

const router = Router();

// GET /api/orders (supports ?userId=...)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const orders = await StoreService.getOrders(userId ? String(userId) : undefined);
    res.json({ success: true, count: orders.length, orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load orders";
    res.status(500).json({ error: message });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await StoreService.getOrderById(id);

    if (!order) {
      res.status(404).json({ error: `Order '${id}' not found` });
      return;
    }

    res.json({ success: true, order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load order";
    res.status(500).json({ error: message });
  }
});

// PATCH /api/orders/:id/status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { paymentStatus, fulfillmentStatus, trackingNumber, notes } = req.body;

    const updated = await StoreService.updateOrderStatus(id, {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update order status";
    res.status(500).json({ error: message });
  }
});

export default router;

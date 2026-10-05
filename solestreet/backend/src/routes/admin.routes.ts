import { Router, Request, Response } from "express";
import { StoreService } from "../services/store.service.js";

const router = Router();

// GET /api/admin/overview
router.get("/overview", async (req: Request, res: Response) => {
  try {
    const stats = await StoreService.getAdminStats();
    res.json({ success: true, stats });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load admin stats";
    res.status(500).json({ error: message });
  }
});

export default router;

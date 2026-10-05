import { Router, Request, Response } from "express";
import Stripe from "stripe";
import { config } from "../config/index.js";
import { StoreService } from "../services/store.service.js";

const router = Router();

const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, { apiVersion: "2025-02-24.acacia" as any })
  : null;

router.post("/stripe", async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];
  let event: Stripe.Event | any;

  try {
    if (stripe && config.stripe.webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature as string,
        config.stripe.webhookSecret
      );
    } else {
      // In dev mode / mock
      event = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook signature failed";
    res.status(400).json({ error: msg });
    return;
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await StoreService.updateOrderStatus(orderId, {
            paymentStatus: "succeeded",
            fulfillmentStatus: "processing",
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await StoreService.updateOrderStatus(orderId, {
            paymentStatus: "failed",
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (err) {
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

export default router;

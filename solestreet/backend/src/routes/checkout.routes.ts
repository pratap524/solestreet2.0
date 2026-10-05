import { Router, Request, Response } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { StoreService } from "../services/store.service.js";
import { config } from "../config/index.js";
import { OrderItem, ShoeSize } from "../types/index.js";

const router = Router();

const stripe = config.stripe.secretKey
  ? new Stripe(config.stripe.secretKey, { apiVersion: "2025-02-24.acacia" as any })
  : null;

const checkoutItemSchema = z.object({
  productId: z.string(),
  size: z.number(),
  color: z.string(),
  quantity: z.number().int().min(1),
});

const checkoutRequestSchema = z.object({
  userId: z.string(),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(7),
  }),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    street: z.string().min(5),
    apartment: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(4),
    country: z.string().min(2),
    phone: z.string().min(7),
  }),
  billingAddress: z.object({
    fullName: z.string().min(2),
    street: z.string().min(5),
    apartment: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(4),
    country: z.string().min(2),
    phone: z.string().min(7),
  }),
  shippingMethodId: z.enum(["standard", "express"]),
  couponCode: z.string().optional(),
  items: z.array(checkoutItemSchema).min(1, "Cart cannot be empty"),
  paymentMethod: z.enum(["stripe", "card"]),
});

// POST /api/checkout
router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = checkoutRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Invalid checkout request", details: parsed.error.issues });
      return;
    }

    const {
      userId,
      customer,
      shippingAddress,
      billingAddress,
      shippingMethodId,
      couponCode,
      items: rawItems,
    } = parsed.data;

    // 1. Inventory Check
    const inventoryCheck = await StoreService.checkInventory(
      rawItems.map((i) => ({
        productId: i.productId,
        size: i.size as ShoeSize,
        quantity: i.quantity,
      }))
    );

    if (!inventoryCheck.valid) {
      res.status(400).json({ error: inventoryCheck.message || "Some items are out of stock" });
      return;
    }

    // 2. Server-side Price Verification
    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const raw of rawItems) {
      const canonicalProduct = await StoreService.getProductByIdOrSlug(raw.productId);
      if (!canonicalProduct) {
        res.status(400).json({ error: `Product ID ${raw.productId} does not exist` });
        return;
      }

      const itemPrice = canonicalProduct.price;
      subtotal += itemPrice * raw.quantity;

      verifiedItems.push({
        productId: canonicalProduct.id,
        name: canonicalProduct.name,
        brand: canonicalProduct.brand,
        slug: canonicalProduct.slug,
        price: itemPrice,
        image: canonicalProduct.images[0]?.url || "",
        color: raw.color,
        size: raw.size as ShoeSize,
        quantity: raw.quantity,
      });
    }

    // 3. Discount calculation
    let discount = 0;
    if (couponCode) {
      const couponRes = await StoreService.validateCoupon(couponCode, subtotal);
      if (couponRes.valid) {
        discount = couponRes.discountAmount;
      }
    }

    // 4. Shipping Calculation
    const shippingMethod =
      config.shippingMethods.find((m) => m.id === shippingMethodId) || config.shippingMethods[0];
    const isFreeStandard =
      subtotal >= config.freeShippingThreshold && shippingMethod.id === "standard";
    const shippingCost = isFreeStandard ? 0 : shippingMethod.price;

    // 5. Tax & Total
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * config.taxRate * 100) / 100;
    const total = Math.round((taxableAmount + shippingCost + tax) * 100) / 100;

    // 6. Create Order
    const order = await StoreService.createOrder({
      userId,
      customer,
      shippingAddress: { ...shippingAddress, id: "addr_ship" },
      billingAddress: { ...billingAddress, id: "addr_bill" },
      items: verifiedItems,
      shippingMethod,
      subtotal,
      shippingCost,
      tax,
      discount,
      couponCode: couponCode || undefined,
      total,
      paymentStatus: "succeeded",
      fulfillmentStatus: "processing",
      stripePaymentIntentId: "pi_mock_" + Math.random().toString(36).substring(2, 11),
    });

    res.json({
      success: true,
      orderId: order.id,
      order,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error during checkout";
    res.status(500).json({ error: message });
  }
});

// POST /api/checkout/payment-intent
router.post("/payment-intent", async (req: Request, res: Response) => {
  try {
    const { items, shippingMethodId, couponCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Cart is empty" });
      return;
    }

    let subtotal = 0;
    for (const item of items) {
      const product = await StoreService.getProductByIdOrSlug(item.productId);
      if (!product) {
        res.status(400).json({ error: "Invalid product in cart" });
        return;
      }
      subtotal += product.price * item.quantity;
    }

    let discount = 0;
    if (couponCode) {
      const couponRes = await StoreService.validateCoupon(couponCode, subtotal);
      if (couponRes.valid) {
        discount = couponRes.discountAmount;
      }
    }

    const shippingMethod =
      config.shippingMethods.find((m) => m.id === shippingMethodId) || config.shippingMethods[0];
    const isFreeStandard =
      subtotal >= config.freeShippingThreshold && shippingMethod.id === "standard";
    const shippingCost = isFreeStandard ? 0 : shippingMethod.price;

    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * config.taxRate;
    const totalAmount = Math.max(1, Math.round((taxable + shippingCost + tax) * 100));

    if (stripe && config.stripe.isConfigured()) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "inr",
        automatic_payment_methods: { enabled: true },
        metadata: {
          itemCount: items.length.toString(),
          couponCode: couponCode || "none",
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
      });
      return;
    }

    // Demo fallback
    res.json({
      clientSecret: "pi_mock_secret_" + Math.random().toString(36).substring(2, 11),
      amount: totalAmount,
      isDemo: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to initialize payment";
    res.status(500).json({ error: message });
  }
});

export default router;

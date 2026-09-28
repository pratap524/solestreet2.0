import { NextResponse } from "next/server";
import { z } from "zod";
import { getProductById, checkInventory, createOrderInDb, validateCoupon } from "@/lib/firebase/firestore";
import { SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/constants";
import type { OrderItem, ShoeSize } from "@/types";

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = checkoutRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout request", details: parsed.error.issues },
        { status: 400 }
      );
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
    const inventoryCheck = await checkInventory(
      rawItems.map((i) => ({
        productId: i.productId,
        size: i.size as ShoeSize,
        quantity: i.quantity,
      }))
    );

    if (!inventoryCheck.valid) {
      return NextResponse.json(
        { error: inventoryCheck.message || "Some items are out of stock" },
        { status: 400 }
      );
    }

    // 2. Server-Side Price Verification (Prevent client tampering)
    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const raw of rawItems) {
      const canonicalProduct = await getProductById(raw.productId);
      if (!canonicalProduct) {
        return NextResponse.json(
          { error: `Product ID ${raw.productId} does not exist` },
          { status: 400 }
        );
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
      const couponRes = await validateCoupon(couponCode, subtotal);
      if (couponRes.valid) {
        discount = couponRes.discountAmount;
      }
    }

    // 4. Shipping Calculation
    const shippingMethod =
      SHIPPING_METHODS.find((m) => m.id === shippingMethodId) || SHIPPING_METHODS[0];
    const isFreeStandard =
      subtotal >= FREE_SHIPPING_THRESHOLD && shippingMethod.id === "standard";
    const shippingCost = isFreeStandard ? 0 : shippingMethod.price;

    // 5. Tax & Total Calculation
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
    const total = Math.round((taxableAmount + shippingCost + tax) * 100) / 100;

    // 6. Create Order in DB & Decrement Stock
    const order = await createOrderInDb({
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

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order,
    });
  } catch (err: unknown) {
    console.error("Checkout API error:", err);
    return NextResponse.json(
      { error: "Internal server error during checkout processing" },
      { status: 500 }
    );
  }
}

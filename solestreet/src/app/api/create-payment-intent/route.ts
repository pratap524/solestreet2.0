import { NextResponse } from "next/server";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { getProductById, validateCoupon } from "@/lib/firebase/firestore";
import { SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const { items, shippingMethodId, couponCode } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 1. Calculate subtotal strictly on server
    let subtotal = 0;
    for (const item of items) {
      const product = await getProductById(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Invalid product in cart" }, { status: 400 });
      }
      subtotal += product.price * item.quantity;
    }

    // 2. Discount
    let discount = 0;
    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, subtotal);
      if (couponRes.valid) {
        discount = couponRes.discountAmount;
      }
    }

    // 3. Shipping
    const shippingMethod =
      SHIPPING_METHODS.find((m) => m.id === shippingMethodId) || SHIPPING_METHODS[0];
    const isFreeStandard =
      subtotal >= FREE_SHIPPING_THRESHOLD && shippingMethod.id === "standard";
    const shippingCost = isFreeStandard ? 0 : shippingMethod.price;

    // 4. Tax & Total in Cents for Stripe
    const taxable = Math.max(0, subtotal - discount);
    const tax = taxable * TAX_RATE;
    const totalAmount = Math.max(1, Math.round((taxable + shippingCost + tax) * 100));

    if (isStripeConfigured()) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: "inr",
        automatic_payment_methods: { enabled: true },
        metadata: {
          itemCount: items.length.toString(),
          couponCode: couponCode || "none",
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
      });
    }

    // Offline / Demo fallback
    return NextResponse.json({
      clientSecret: "pi_mock_secret_" + Math.random().toString(36).substring(2, 11),
      amount: totalAmount,
      isDemo: true,
    });
  } catch (err: unknown) {
    console.error("Create payment intent error:", err);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}

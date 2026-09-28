import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db, isFirebaseConfigured } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In dev without webhook secret
      event = JSON.parse(body);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("Stripe webhook verification error:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId && isFirebaseConfigured()) {
          await updateDoc(doc(db, "orders", orderId), {
            paymentStatus: "succeeded",
            fulfillmentStatus: "processing",
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId && isFirebaseConfigured()) {
          await updateDoc(doc(db, "orders", orderId), {
            paymentStatus: "failed",
            updatedAt: new Date().toISOString(),
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handling error:", err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_solestreet_secret_key", {
  apiVersion: "2025-02-24.acacia" as unknown as Stripe.LatestApiVersion,
  typescript: true,
});

export function isStripeConfigured(): boolean {
  return (
    !!process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("mock")
  );
}

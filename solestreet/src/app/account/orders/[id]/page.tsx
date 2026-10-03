"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  Printer,
  MapPin,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import { OrderProgress } from "@/components/account/order-progress";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/context/auth-context";
import { getOrderById } from "@/lib/firebase/firestore";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/types";
import { toast } from "sonner";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { isLoading: authLoading, user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedTracking, setCopiedTracking] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!resolvedParams.id) return;
      setIsLoading(true);
      try {
        const data = await getOrderById(resolvedParams.id);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [resolvedParams.id]);

  const copyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(true);
    toast.success("Tracking number copied to clipboard!");
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-semibold tracking-wide">
            Retrieving order manifest...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 py-16 px-4 flex items-center justify-center">
        <EmptyState
          icon={Package}
          title="Order Not Found"
          description={`We couldn't locate an order with reference #${resolvedParams.id}. Please verify your account history or contact concierge support.`}
          actionLabel="Return to Account"
          actionHref="/account?tab=orders"
          secondaryLabel="Shop Collection"
          secondaryHref="/shop"
          className="max-w-md w-full"
        />
      </div>
    );
  }

  const trackingNum = order.trackingNumber || `SS-${order.id.slice(-6).toUpperCase()}-FEDEX`;

  return (
    <div className="min-h-screen bg-zinc-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/account?tab=orders"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-950 transition-colors py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl text-xs font-bold border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs print:hidden"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Print Receipt
            </Button>
          </div>
        </div>

        {/* Main Order Card */}
        <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-zinc-100">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Official Order Manifest
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                #{order.id}
              </h1>
              <p className="text-xs text-zinc-500" suppressHydrationWarning>
                Placed on {formatDate(order.createdAt)} • {order.items.length} item
                {order.items.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={order.fulfillmentStatus} dot className="text-xs px-3 py-1" />
              <StatusBadge status={order.paymentStatus} dot={false} className="text-xs px-3 py-1" />
            </div>
          </div>

          {/* Stepper Progress */}
          <OrderProgress
            status={order.fulfillmentStatus}
            trackingNumber={trackingNum}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
            variant="detailed"
          />

          {/* Courier & Tracking Details Card */}
          <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center shrink-0 text-zinc-900 shadow-2xs">
                <Truck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-zinc-950">
                    {order.shippingMethod?.name || "Priority Insured Sneaker Express"}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Vault Certified
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  Estimated Delivery:{" "}
                  <strong className="text-zinc-800 font-semibold">
                    {order.shippingMethod?.estimatedDays || "3-5 Business Days"}
                  </strong>
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-600 font-mono pt-1">
                  <span>Tracking:</span>
                  <span className="font-bold text-zinc-900">{trackingNum}</span>
                  <button
                    onClick={() => copyTracking(trackingNum)}
                    className="p-1 text-zinc-400 hover:text-zinc-900 rounded-md transition-colors"
                    title="Copy tracking number"
                  >
                    {copiedTracking ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyTracking(trackingNum)}
                className="rounded-xl text-xs font-bold border-zinc-200 bg-white hover:bg-zinc-50 h-9"
              >
                {copiedTracking ? "Copied!" : "Copy Tracking"}
              </Button>
            </div>
          </div>

          {/* Ordered Sneakers List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Footwear & Items ({order.items.length})
              </h3>
              <span className="text-xs text-zinc-400 font-medium">Authenticity Guaranteed</span>
            </div>

            <div className="divide-y divide-zinc-100 border-y border-zinc-100">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-zinc-100 rounded-2xl overflow-hidden shrink-0 border border-zinc-200/80 shadow-2xs">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {item.brand}
                      </span>
                      <Link
                        href={`/product/${item.slug || item.productId}`}
                        className="font-bold text-sm sm:text-base text-zinc-950 hover:text-zinc-600 transition-colors block"
                      >
                        {item.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium">
                        <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          Size: US {item.size}
                        </span>
                        <span>•</span>
                        <span>Color: {item.color}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className="font-black text-sm sm:text-base text-zinc-950">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {formatPrice(item.price)} each
                      </span>
                    )}
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-xs font-bold text-zinc-600 hover:text-zinc-950 h-8 px-2.5 rounded-lg"
                    >
                      <Link href={`/product/${item.slug || item.productId}`}>
                        View Pair <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Billing Address Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Address */}
            <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-zinc-500" />
                Shipping Destination
              </div>
              <div className="text-xs text-zinc-600 leading-relaxed font-medium space-y-0.5">
                <p className="font-bold text-zinc-900 text-sm">{order.shippingAddress.fullName}</p>
                <p>
                  {order.shippingAddress.street}
                  {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}
                </p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-1 text-zinc-500">📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Billing / Payment Information */}
            <div className="rounded-2xl border border-zinc-200/90 bg-zinc-50/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase tracking-wider">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                Payment & Billing Details
              </div>
              <div className="text-xs text-zinc-600 leading-relaxed space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Payment Status:</span>
                  <StatusBadge status={order.paymentStatus} dot={false} className="text-[10px]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Payment Method:</span>
                  <span className="font-semibold text-zinc-900">Encrypted Card Payment</span>
                </div>
                {order.billingAddress && (
                  <div className="pt-2 border-t border-zinc-200/60 text-zinc-500">
                    <span className="font-bold text-zinc-700 block mb-0.5">Billing Address:</span>
                    <span>
                      {order.billingAddress.street}, {order.billingAddress.city},{" "}
                      {order.billingAddress.state} {order.billingAddress.zipCode}
                    </span>
                  </div>
                )}
                <div className="pt-2 flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Stripe PCI-DSS Level 1 Verified
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="rounded-2xl bg-zinc-50/80 border border-zinc-200/80 p-5 sm:p-6 space-y-3">
            <div className="flex justify-between text-xs text-zinc-600 font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-semibold">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-zinc-600 font-medium">
              <span>Shipping ({order.shippingMethod?.name || "Standard"})</span>
              <span>{order.shippingCost === 0 ? "FREE" : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-600 font-medium">
              <span>Estimated Sales Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <Separator className="my-2 bg-zinc-200" />
            <div className="flex justify-between items-baseline text-zinc-950">
              <span className="text-sm font-bold uppercase tracking-wider">Total Paid</span>
              <span className="text-xl sm:text-2xl font-black tracking-tight">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          {/* Help & Support Banner */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-500 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Questions regarding this order? Contact our dedicated collector support.</span>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold border-zinc-200 h-9 shrink-0"
            >
              <a href={`mailto:support@solestreet.com?subject=Inquiry regarding Order #${order.id}`}>
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

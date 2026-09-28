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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { getOrderById } from "@/lib/firebase/firestore";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!resolvedParams.id) return;
      setIsLoading(true);
      try {
        const data = await getOrderById(resolvedParams.id);
        setOrder(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [resolvedParams.id]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-zinc-200 max-w-md w-full">
          <Package className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-zinc-900">Order Not Found</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            We couldn&apos;t find an order with the ID #{resolvedParams.id}.
          </p>
          <Link href="/account">
            <Button className="w-full rounded-xl">Back to Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/account"
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="rounded-xl text-xs font-semibold border-zinc-200"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print Invoice
          </Button>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-10 shadow-xs space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
            <div>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Order Receipt
              </span>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight mt-0.5">
                #{order.id}
              </h1>
              <p className="text-xs text-zinc-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <div className="flex sm:flex-col items-start sm:items-end gap-2">
              <Badge
                className={`text-xs uppercase font-bold ${
                  order.fulfillmentStatus === "delivered"
                    ? "bg-emerald-600 text-white"
                    : order.fulfillmentStatus === "shipped"
                    ? "bg-blue-600 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {order.fulfillmentStatus}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs uppercase font-bold bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Payment: {order.paymentStatus}
              </Badge>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-4">
              Items Ordered ({order.items.length})
            </h3>
            <div className="divide-y divide-zinc-100 border-y border-zinc-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400">
                        {item.brand}
                      </span>
                      <h4 className="font-semibold text-sm text-zinc-900">{item.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Size: US {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-zinc-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Delivery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
            <div>
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                Shipping Address
              </h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.street}{" "}
                {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
                <br />
                {order.shippingAddress.country}
                <br />
                📞 {order.shippingAddress.phone}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-zinc-400" />
                Shipping Method & Tracking
              </h4>
              <p className="text-xs text-zinc-800 font-bold">
                {order.shippingMethod?.name || "Standard Ground Delivery"}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Estimated Delivery: {order.shippingMethod?.estimatedDays || "3-5 business days"}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-100/60 px-3 py-1.5 rounded-lg w-fit">
                <ShieldCheck className="h-3.5 w-3.5" />
                Insured & Tracked Delivery
              </div>
            </div>
          </div>

          {/* Summary Breakdown */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Shipping Fee</span>
              <span>{order.shippingCost === 0 ? "FREE" : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-600">
              <span>Estimated Sales Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-black text-zinc-900">
              <span>Total Paid</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

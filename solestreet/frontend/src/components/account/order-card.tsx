"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Truck, ExternalLink, ShieldCheck } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { OrderProgress } from "@/components/account/order-progress";
import { formatPrice, formatDate } from "@/lib/format";
import type { Order } from "@/types";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <div className="group rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-zinc-300 hover:shadow-sm transition-all">
      {/* Top Bar: Order ID, Date, Badges & Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-bold text-sm text-zinc-950">
              #{order.id}
            </span>
            <StatusBadge status={order.fulfillmentStatus} dot />
            <StatusBadge status={order.paymentStatus} dot={false} className="text-[10px]" />
          </div>
          <p className="text-xs text-zinc-500 font-medium" suppressHydrationWarning>
            Placed on {formatDate(order.createdAt)} • {order.items.length} item
            {order.items.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            Order Total
          </span>
          <span className="text-lg font-black text-zinc-950 tracking-tight">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      {/* Mini Progress Tracker */}
      <div className="py-4 border-b border-zinc-100">
        <OrderProgress
          status={order.fulfillmentStatus}
          variant="compact"
          trackingNumber={order.trackingNumber}
        />
      </div>

      {/* Items Preview List */}
      <div className="py-4 space-y-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-100/90 shadow-2xs">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Package className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block truncate">
                  {item.brand}
                </span>
                <Link
                  href={`/product/${item.slug || item.productId}`}
                  className="font-bold text-xs sm:text-sm text-zinc-900 hover:text-zinc-600 transition-colors truncate block"
                >
                  {item.name}
                </Link>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                  <span>Size: US {item.size}</span>
                  <span>•</span>
                  <span>Color: {item.color}</span>
                  <span>•</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-bold text-xs sm:text-sm text-zinc-900 block">
                {formatPrice(item.price * item.quantity)}
              </span>
              {item.quantity > 1 && (
                <span className="text-[10px] text-zinc-400 block">
                  {formatPrice(item.price)} ea
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer: Shipping & Actions */}
      <div className="pt-3.5 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-500">
          <Truck className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="font-medium truncate">
            {order.shippingMethod?.name || "Standard Ground Delivery"}
          </span>
          <span className="text-zinc-300">•</span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Insured
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl h-9 text-xs font-bold border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-800"
          >
            <Link href={`/account/orders/${order.id}`}>
              View Receipt & Tracking
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Check, Clock, PackageCheck, ShieldCheck, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FulfillmentStatus } from "@/types";

interface OrderProgressProps {
  status: FulfillmentStatus;
  createdAt?: string;
  updatedAt?: string;
  trackingNumber?: string;
  variant?: "detailed" | "compact";
  className?: string;
}

const STEPS = [
  {
    key: "placed",
    title: "Order Placed",
    shortTitle: "Placed",
    description: "Order verified and secured",
    icon: Clock,
  },
  {
    key: "processing",
    title: "Vault Authentication",
    shortTitle: "Processing",
    description: "Inspected & packaged in vault",
    icon: ShieldCheck,
  },
  {
    key: "shipped",
    title: "Shipped & In Transit",
    shortTitle: "Shipped",
    description: "En route with courier",
    icon: Truck,
  },
  {
    key: "delivered",
    title: "Delivered",
    shortTitle: "Delivered",
    description: "Delivered to destination",
    icon: PackageCheck,
  },
];

function getStepIndex(status: FulfillmentStatus): number {
  switch (status) {
    case "unfulfilled":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
    case "refunded":
      return -1;
    default:
      return 0;
  }
}

export function OrderProgress({
  status,
  createdAt,
  updatedAt,
  trackingNumber,
  variant = "detailed",
  className,
}: OrderProgressProps) {
  const currentStep = getStepIndex(status);
  const isCancelled = status === "cancelled" || status === "refunded";

  if (isCancelled) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-red-200/80 bg-red-50/60 p-4 sm:p-5 text-red-900 flex items-start gap-3.5",
          className
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
          <XCircle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-sm text-red-900 capitalize">
            Order {status === "refunded" ? "Refunded" : "Cancelled"}
          </p>
          <p className="text-xs text-red-700/90 leading-relaxed">
            {status === "refunded"
              ? "This order has been refunded back to your original payment method."
              : "This order was cancelled. If you have questions or need assistance, our client concierge is ready to help."}
          </p>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("space-y-2.5", className)}>
        {/* Progress bar line */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div key={step.key} className="space-y-1.5">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    isCompleted
                      ? "bg-emerald-600"
                      : isCurrent
                      ? "bg-zinc-900"
                      : "bg-zinc-200"
                  )}
                />
                <p
                  className={cn(
                    "text-[10px] sm:text-[11px] font-semibold truncate",
                    isCurrent
                      ? "text-zinc-950 font-bold"
                      : isCompleted
                      ? "text-emerald-700 font-medium"
                      : "text-zinc-400"
                  )}
                >
                  {step.shortTitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Detailed variant (used on Order Details page)
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
        <div>
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            Fulfillment Progress
          </span>
          <h3 className="text-base font-black text-zinc-900 mt-0.5">
            {status === "delivered"
              ? "Package Delivered Safely"
              : status === "shipped"
              ? "In Transit with Carrier"
              : status === "processing"
              ? "Authentication in Vault"
              : "Order Confirmed & Preparing"}
          </h3>
        </div>
        {trackingNumber && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Tracking Ref
            </span>
            <p className="font-mono text-xs font-bold text-zinc-900">{trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Stepper with connector lines */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;
            const isUpcoming = currentStep < idx;
            const StepIcon = step.icon;

            return (
              <div
                key={step.key}
                className={cn(
                  "relative flex md:flex-col items-center md:items-start gap-3.5 md:gap-3 p-3 md:p-3.5 rounded-xl transition-all",
                  isCurrent && "bg-zinc-50/80 border border-zinc-200/70"
                )}
              >
                {/* Icon node */}
                <div
                  className={cn(
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-xs",
                    isCompleted && "bg-emerald-600 text-white border border-emerald-600",
                    isCurrent && "bg-zinc-950 text-white ring-4 ring-zinc-100",
                    isUpcoming && "bg-zinc-100 text-zinc-400 border border-zinc-200/80"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>

                {/* Content text */}
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={cn(
                        "text-xs sm:text-sm font-bold tracking-tight",
                        isCurrent
                          ? "text-zinc-950"
                          : isCompleted
                          ? "text-zinc-800"
                          : "text-zinc-400"
                      )}
                    >
                      {step.title}
                    </p>
                    {isCurrent && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

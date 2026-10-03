"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  Tag,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Building,
  Phone,
  Mail,
  X,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/auth-context";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/format";
import { SHIPPING_METHODS, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { addressSchema, type AddressFormValues } from "@/lib/validations/checkout";
import { toast } from "sonner";
import type { Order } from "@/types";

type CheckoutStep = 1 | 2 | 3 | 4 | 5;

function CheckoutContent() {
  const { user } = useAuth();
  const {
    items,
    subtotal,
    shipping,
    tax,
    discount,
    couponCode,
    total,
    selectedShippingMethod,
    setShippingMethod,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeLoadingStep, setStripeLoadingStep] = useState(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Customer info form (Step 1)
  const [customerName, setCustomerName] = useState(user?.displayName || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerErrors, setCustomerErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  // Sync customer details when user auth state loads
  useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user, customerName, customerEmail, customerPhone]);

  // Shipping Address Form (Step 2)
  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      street: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: user?.phone || "",
      isDefault: true,
    },
  });

  const [useSavedAddress, setUseSavedAddress] = useState(
    Boolean(user?.addresses && user.addresses.length > 0)
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    user?.addresses?.[0]?.id || null
  );

  // Credit Card state (Step 4 simulation / element)
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  // Step 1 Validation
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = customerName || user?.displayName || "";
    const effectiveEmail = customerEmail || user?.email || "";
    const effectivePhone = customerPhone || user?.phone || "";

    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!effectiveName.trim()) errors.name = "Full name is required";
    if (!effectiveEmail.includes("@")) errors.email = "Valid email address is required";
    if (!effectivePhone.trim() || effectivePhone.length < 7) errors.phone = "Valid phone number is required";

    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      return;
    }
    setCustomerErrors({});
    setCheckoutError(null);
    setCurrentStep(2);
  };

  // Step 2 Submit
  const onShippingAddressSubmit = () => {
    setCheckoutError(null);
    setCurrentStep(3);
  };

  // Step 4 Final Payment & Order Placement
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setStripeLoadingStep(1);
    setCheckoutError(null);

    // Simulate realistic Stripe redirect and authorization progression
    const timer1 = setTimeout(() => setStripeLoadingStep(2), 1200);
    const timer2 = setTimeout(() => setStripeLoadingStep(3), 2400);

    try {
      const shippingData = addressForm.getValues();

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid || "guest_" + Math.random().toString(36).substring(2, 8),
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
          },
          shippingAddress: shippingData,
          billingAddress: shippingData,
          shippingMethodId: selectedShippingMethod.id,
          couponCode: couponCode || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
          paymentMethod: "stripe",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order creation failed. Please verify your payment details.");
      }

      setCreatedOrder(data.order);
      clearCart();
      setCurrentStep(5);
      toast.success("Order confirmed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      setCheckoutError(msg);
      toast.error(msg);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsProcessing(false);
      setStripeLoadingStep(0);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = promoInput.trim().toUpperCase();
    if (!cleanCode) return;
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const ok = await applyCoupon(cleanCode);
      if (ok) {
        setPromoInput("");
      } else {
        setPromoError("Invalid code. Try SOLE20 (20% off) or WELCOME10 (10% off)");
      }
    } catch {
      setPromoError("Unable to apply promo code");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleQuickApply = async (code: string) => {
    setIsApplyingPromo(true);
    setPromoError(null);
    try {
      const ok = await applyCoupon(code);
      if (ok) setPromoInput("");
      else setPromoError(`Coupon ${code} is invalid or requirements not met.`);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Empty checkout view (when items === 0 and not on order confirmation step)
  if (items.length === 0 && currentStep !== 5) {
    return (
      <div className="min-h-[80vh] bg-zinc-50/50 flex items-center justify-center py-16 px-4">
        <div className="text-center bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200/80 max-w-md w-full shadow-xs">
          <div className="relative w-20 h-20 rounded-3xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center mx-auto mb-4 text-zinc-400">
            <ShoppingBag className="h-9 w-9 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-black text-zinc-950 tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 mb-6 leading-relaxed">
            Add pairs to your shopping bag before proceeding through the checkout process.
          </p>
          <div className="flex flex-col gap-2.5">
            <Button asChild className="w-full h-11 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-md">
              <Link href="/shop">Browse Sneakers</Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-11 rounded-xl text-xs font-semibold border-zinc-200">
              <Link href="/wishlist">View Wishlist</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stepLabels = [
    { step: 1, label: "Customer", icon: User },
    { step: 2, label: "Shipping", icon: MapPin },
    { step: 3, label: "Delivery", icon: Truck },
    { step: 4, label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stripe Redirect / Payment Loading Modal Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-md flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 border border-zinc-200"
              >
                {/* Animated Lock & Pulse Rings */}
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                  <div className="relative w-full h-full rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-lg">
                    <Lock className="h-8 w-8 text-emerald-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5" /> Stripe Secure Checkout
                  </span>
                  <h3 className="text-xl font-black text-zinc-950">
                    {stripeLoadingStep === 1 && "Connecting to Stripe Gateway..."}
                    {stripeLoadingStep === 2 && "Authorizing Payment Method..."}
                    {stripeLoadingStep === 3 && "Finalizing Your Order..."}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Please do not refresh, close, or navigate away from this page. Your payment is being verified through 256-bit encrypted channels.
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500">
                    <span>Security Check</span>
                    <span className="text-emerald-600 font-extrabold">Active</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: "20%" }}
                      animate={{
                        width: stripeLoadingStep === 1 ? "40%" : stripeLoadingStep === 2 ? "75%" : "95%",
                      }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Collapsible Order Summary Banner */}
        {currentStep < 5 && (
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
                className="w-full p-4 flex items-center justify-between text-left cursor-pointer bg-zinc-50/70"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                  <ShoppingBag className="h-4 w-4 text-zinc-600" />
                  <span>
                    {mobileSummaryOpen ? "Hide order summary" : "Show order summary"}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {items.length} {items.length === 1 ? "pair" : "pairs"}
                  </Badge>
                  {mobileSummaryOpen ? (
                    <ChevronUp className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <span className="text-sm font-black text-zinc-950">
                  {formatPrice(total)}
                </span>
              </button>

              <AnimatePresence>
                {mobileSummaryOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 border-t border-zinc-100 space-y-4"
                  >
                    {/* Items List */}
                    <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto">
                      {items.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-100">
                              <Image src={item.image} alt={item.name} fill className="object-cover" />
                              <span className="absolute bottom-0 right-0 bg-zinc-950 text-white text-[9px] font-bold px-1 rounded-tl-md">
                                {item.quantity}x
                              </span>
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-zinc-900 truncate max-w-[150px]">
                                {item.name}
                              </h5>
                              <p className="text-[11px] text-zinc-500">
                                US {item.size} • {item.color}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-xs text-zinc-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-1.5 text-xs text-zinc-600 pt-2 border-t border-zinc-100">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>Discount</span>
                          <span>-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping ({selectedShippingMethod.name})</span>
                        <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Tax (8%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="flex justify-between font-black text-sm text-zinc-950 pt-2 border-t border-zinc-100">
                        <span>Total Due</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Responsive Stepper Navigation */}
        {currentStep < 5 && (
          <div className="mb-8 max-w-2xl mx-auto">
            {/* Desktop Stepper */}
            <div className="hidden sm:flex items-center justify-between">
              {stepLabels.map((s, idx) => {
                const Icon = s.icon;
                const isCurrent = currentStep === s.step;
                const isCompleted = currentStep > s.step;
                return (
                  <div key={s.step} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      disabled={!isCompleted}
                      onClick={() => isCompleted && setCurrentStep(s.step as CheckoutStep)}
                      className={`flex flex-col items-center gap-1.5 transition-all ${
                        isCompleted ? "cursor-pointer group" : "cursor-default"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                          isCompleted
                            ? "bg-emerald-600 text-white shadow-xs group-hover:scale-105"
                            : isCurrent
                            ? "bg-zinc-950 text-white shadow-md ring-4 ring-zinc-900/10"
                            : "bg-zinc-100 text-zinc-400 border border-zinc-200"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span
                        className={`text-xs font-bold tracking-tight ${
                          isCurrent
                            ? "text-zinc-950"
                            : isCompleted
                            ? "text-zinc-700 group-hover:text-zinc-950"
                            : "text-zinc-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>

                    {idx < 3 && (
                      <div
                        className={`h-[2px] flex-1 mx-3 -mt-5 transition-colors ${
                          currentStep > idx + 1 ? "bg-emerald-500" : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Adaptive Stepper */}
            <div className="sm:hidden bg-white rounded-2xl border border-zinc-200/80 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-zinc-950 text-white text-[10px] font-black flex items-center justify-center">
                    {currentStep}
                  </span>
                  Step {currentStep} of 4: {stepLabels[currentStep - 1].label}
                </span>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((currentStep - 1) as CheckoutStep)}
                    className="text-xs font-bold text-zinc-600 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back
                  </button>
                )}
              </div>
              <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-zinc-950 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Checkout Error Alert Banner */}
        <AnimatePresence>
          {checkoutError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 shadow-xs flex items-start gap-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-sm text-red-950">Payment / Checkout Issue</h4>
                <p className="mt-0.5 leading-relaxed text-red-800">{checkoutError}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handlePlaceOrder}
                    className="h-8 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Try Again
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCheckoutError(null)}
                    className="h-8 rounded-lg text-xs font-semibold border-red-300 text-red-800 hover:bg-red-100/60"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutError(null)}
                className="text-red-500 hover:text-red-800 p-1"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STEP 5: ORDER SUCCESS CONFIRMATION */}
        {currentStep === 5 && createdOrder ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-zinc-200/80 shadow-xs text-center space-y-6"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-200/60 px-3.5 py-1 rounded-full">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight mt-3">
                Thank you for your order!
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Order <strong className="text-zinc-900">#{createdOrder.id}</strong> has been received and is being prepared for dispatch.
              </p>
            </div>

            <div className="bg-zinc-50/80 rounded-2xl p-5 text-left text-xs text-zinc-600 space-y-2.5 border border-zinc-200/60">
              <div className="flex justify-between font-semibold text-zinc-800">
                <span>Confirmation sent to:</span>
                <span className="text-zinc-950">{createdOrder.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span className="font-medium text-zinc-800">{createdOrder.shippingMethod?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Arrival:</span>
                <span className="font-bold text-zinc-950">
                  {createdOrder.shippingMethod?.estimatedDays}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-zinc-950 pt-2.5 border-t border-zinc-200">
                <span>Total Paid:</span>
                <span className="text-base">{formatPrice(createdOrder.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs shadow-md">
                <Link href={`/account/orders/${createdOrder.id}`}>
                  View Full Invoice & Tracking
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 h-12 rounded-xl font-bold text-xs border-zinc-200">
                <Link href="/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          /* STEPS 1-4: TWO-COLUMN CHECKOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left: Interactive Step Forms */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs">
              {/* STEP 1: CUSTOMER INFO */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                    <div>
                      <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                        1. Contact Information
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        We will send order receipts and tracking updates here.
                      </p>
                    </div>
                    {!user && (
                      <Link
                        href="/login?redirect=/checkout"
                        className="text-xs font-bold text-zinc-900 hover:underline shrink-0"
                      >
                        Sign In
                      </Link>
                    )}
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-500" /> Full Name
                      </label>
                      <Input
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (customerErrors.name) setCustomerErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        className={`mt-1.5 h-12 rounded-xl text-sm ${
                          customerErrors.name ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      {customerErrors.name && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">{customerErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-zinc-500" /> Email Address
                      </label>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          if (customerErrors.email) setCustomerErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        placeholder="alex@example.com"
                        autoComplete="email"
                        className={`mt-1.5 h-12 rounded-xl text-sm ${
                          customerErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      {customerErrors.email && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">{customerErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-500" /> Phone Number (for delivery SMS)
                      </label>
                      <Input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (customerErrors.phone) setCustomerErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                        className={`mt-1.5 h-12 rounded-xl text-sm ${
                          customerErrors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      {customerErrors.phone && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">{customerErrors.phone}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Continue to Shipping Address</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: SHIPPING ADDRESS */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                    <div>
                      <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                        2. Shipping Address
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Where should we deliver your order?
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  {/* Saved Address Selection (if user is authenticated) */}
                  {user?.addresses && user.addresses.length > 0 && (
                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                          Saved Delivery Addresses
                        </label>
                        <button
                          type="button"
                          onClick={() => setUseSavedAddress(!useSavedAddress)}
                          className="text-xs font-bold text-zinc-900 hover:underline"
                        >
                          {useSavedAddress ? "+ Enter a different address" : "Use saved address"}
                        </button>
                      </div>

                      {useSavedAddress && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {user.addresses.map((addr) => {
                            const isSelected = selectedAddressId === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => {
                                  setSelectedAddressId(addr.id);
                                  addressForm.reset({
                                    fullName: addr.fullName,
                                    street: addr.street,
                                    apartment: addr.apartment || "",
                                    city: addr.city,
                                    state: addr.state,
                                    zipCode: addr.zipCode,
                                    country: addr.country,
                                    phone: addr.phone,
                                  });
                                }}
                                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950 shadow-xs"
                                    : "border-zinc-200 bg-white hover:border-zinc-300"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-black text-zinc-900 truncate">
                                    {addr.fullName}
                                  </span>
                                  {addr.isDefault && (
                                    <Badge className="bg-zinc-900 text-white text-[9px] px-1.5 py-0">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-zinc-600 line-clamp-1">
                                  {addr.street} {addr.apartment ? `• ${addr.apartment}` : ""}
                                </p>
                                <p className="text-zinc-400 text-[11px] mt-0.5">
                                  {addr.city}, {addr.state} {addr.zipCode}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <form
                    onSubmit={addressForm.handleSubmit(onShippingAddressSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-zinc-500" /> Recipient Full Name
                      </label>
                      <Input
                        {...addressForm.register("fullName")}
                        placeholder="Alex Morgan"
                        autoComplete="name"
                        className="mt-1.5 h-12 rounded-xl text-sm"
                      />
                      {addressForm.formState.errors.fullName && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">
                          {addressForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-zinc-500" /> Street Address
                      </label>
                      <Input
                        {...addressForm.register("street")}
                        placeholder="123 Sneakerhead Blvd"
                        autoComplete="street-address"
                        className="mt-1.5 h-12 rounded-xl text-sm"
                      />
                      {addressForm.formState.errors.street && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">
                          {addressForm.formState.errors.street.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5 text-zinc-500" /> Apartment, Suite, Floor (Optional)
                      </label>
                      <Input
                        {...addressForm.register("apartment")}
                        placeholder="Apt 4B"
                        className="mt-1.5 h-12 rounded-xl text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                          City
                        </label>
                        <Input
                          {...addressForm.register("city")}
                          placeholder="New York"
                          autoComplete="address-level2"
                          className="mt-1.5 h-12 rounded-xl text-sm"
                        />
                        {addressForm.formState.errors.city && (
                          <p className="text-xs text-red-500 mt-1 font-semibold">
                            {addressForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                          State / Province
                        </label>
                        <Input
                          {...addressForm.register("state")}
                          placeholder="NY"
                          autoComplete="address-level1"
                          className="mt-1.5 h-12 rounded-xl text-sm"
                        />
                        {addressForm.formState.errors.state && (
                          <p className="text-xs text-red-500 mt-1 font-semibold">
                            {addressForm.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                          Postal / ZIP Code
                        </label>
                        <Input
                          {...addressForm.register("zipCode")}
                          placeholder="10001"
                          autoComplete="postal-code"
                          className="mt-1.5 h-12 rounded-xl text-sm"
                        />
                        {addressForm.formState.errors.zipCode && (
                          <p className="text-xs text-red-500 mt-1 font-semibold">
                            {addressForm.formState.errors.zipCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                          Country
                        </label>
                        <Input
                          {...addressForm.register("country")}
                          placeholder="United States"
                          autoComplete="country-name"
                          className="mt-1.5 h-12 rounded-xl text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-500" /> Recipient Phone
                      </label>
                      <Input
                        {...addressForm.register("phone")}
                        placeholder="+1 (555) 000-0000"
                        autoComplete="tel"
                        className="mt-1.5 h-12 rounded-xl text-sm"
                      />
                      {addressForm.formState.errors.phone && (
                        <p className="text-xs text-red-500 mt-1 font-semibold">
                          {addressForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Continue to Delivery Method</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* STEP 3: DELIVERY METHOD */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                    <div>
                      <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                        3. Delivery Method
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Choose your shipping speed and dispatch handling.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  <div className="space-y-4">
                    {SHIPPING_METHODS.map((method) => {
                      const isFree =
                        subtotal >= FREE_SHIPPING_THRESHOLD && method.id === "standard";
                      const isSelected = selectedShippingMethod.id === method.id;

                      return (
                        <div
                          key={method.id}
                          onClick={() => setShippingMethod(method)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "border-zinc-950 bg-zinc-50 ring-2 ring-zinc-950 shadow-xs"
                              : "border-zinc-200 bg-white hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-zinc-950 bg-zinc-950 text-white"
                                    : "border-zinc-300 bg-white"
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-black text-sm text-zinc-950">{method.name}</h4>
                                  {isFree && (
                                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                                      Eligible Free
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-zinc-400" />
                                  <span>{method.estimatedDays}</span>
                                  <span>•</span>
                                  <span>{method.description}</span>
                                </p>
                              </div>
                            </div>
                            <span className="font-black text-sm text-zinc-950">
                              {isFree ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                                  FREE
                                </span>
                              ) : (
                                formatPrice(method.price)
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4">
                      <Button
                        onClick={() => setCurrentStep(4)}
                        className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Continue to Payment</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: PAYMENT DETAILS */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                    <div>
                      <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                        4. Payment Details
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Guaranteed safe and encrypted 256-bit Stripe transaction.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Stripe Card Container */}
                    <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-zinc-700" />
                          Credit / Debit Card (Stripe Secured)
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-extrabold">
                          <span className="bg-white px-1.5 py-0.5 rounded border border-zinc-200">VISA</span>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-zinc-200">MC</span>
                          <span className="bg-white px-1.5 py-0.5 rounded border border-zinc-200">AMEX</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                          Card Number
                        </label>
                        <Input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="mt-1 h-12 rounded-xl bg-white font-mono text-sm shadow-2xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                            Expiration
                          </label>
                          <Input
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            placeholder="MM/YY"
                            className="mt-1 h-12 rounded-xl bg-white font-mono text-sm shadow-2xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                            CVC / CVV
                          </label>
                          <Input
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            className="mt-1 h-12 rounded-xl bg-white font-mono text-sm shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Billing address toggle */}
                    <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingSameAsShipping}
                        onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                        className="rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 w-4 h-4 cursor-pointer"
                      />
                      <span>Billing address is same as shipping address</span>
                    </label>

                    {/* Security Notice */}
                    <div className="flex items-center gap-2.5 text-xs text-zinc-600 bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                      <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        256-bit encrypted SSL checkout. Your card data is processed directly via Stripe and never saved on our server.
                      </span>
                    </div>

                    {/* Place Order CTA Button */}
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full h-14 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      <span>{isProcessing ? "Processing Secure Payment..." : `Authorize & Pay ${formatPrice(total)}`}</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right: Order Summary Sidebar (Desktop) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-zinc-200/80 p-6 sm:p-7 shadow-xs sticky top-24 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <h3 className="font-black text-zinc-950 text-base">Order Summary</h3>
                  <Badge variant="secondary" className="text-xs font-bold">
                    {items.length} {items.length !== 1 ? "items" : "item"}
                  </Badge>
                </div>

                {/* Items Preview */}
                <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-200/70 shadow-2xs">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                          <span className="absolute bottom-0 right-0 bg-zinc-950 text-white text-[9px] font-bold px-1 rounded-tl-md">
                            {item.quantity}x
                          </span>
                        </div>
                        <div>
                          <h5 className="font-bold text-xs text-zinc-900 truncate max-w-[150px]">
                            {item.name}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-semibold bg-zinc-100 text-zinc-700 px-1.5 py-0.2 rounded border border-zinc-200">
                              US {item.size}
                            </span>
                            <span className="text-[10px] text-zinc-500 truncate max-w-[80px]">
                              {item.color}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-zinc-950">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Box */}
                <div className="space-y-2">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <Input
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        if (promoError) setPromoError(null);
                      }}
                      placeholder="Promo code (e.g. SOLE20)"
                      className={`h-10 rounded-xl text-xs uppercase bg-zinc-50 ${
                        promoError ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={isApplyingPromo || !promoInput.trim()}
                      className="h-10 rounded-xl text-xs font-bold px-4 shrink-0 cursor-pointer"
                    >
                      {isApplyingPromo ? "Applying..." : "Apply"}
                    </Button>
                  </form>

                  {/* Invalid Promo State */}
                  {promoError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0, x: [-6, 6, -4, 4, 0] }}
                      className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700"
                    >
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                      <span>{promoError}</span>
                    </motion.div>
                  )}

                  {/* Successful Promo State */}
                  {couponCode && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl text-xs text-emerald-800 font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" />
                        Code {couponCode} (-{formatPrice(discount)})
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-emerald-950 font-bold p-0.5 cursor-pointer"
                        aria-label="Remove coupon"
                      >
                        ✕
                      </button>
                    </motion.div>
                  )}

                  {/* Quick Code Suggestion Chips */}
                  {!couponCode && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-zinc-400 font-medium">Try:</span>
                      <button
                        type="button"
                        onClick={() => handleQuickApply("SOLE20")}
                        className="text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        SOLE20 (-20%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickApply("WELCOME10")}
                        className="text-[10px] font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        WELCOME10 (-10%)
                      </button>
                    </div>
                  )}
                </div>

                {/* Breakdown */}
                <div className="space-y-2 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-zinc-900">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Shipping ({selectedShippingMethod.name})</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-200/50">
                          FREE
                        </span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span>{formatPrice(tax)}</span>
                  </div>
                  <Separator className="my-2 bg-zinc-200" />
                  <div className="flex justify-between text-base font-black text-zinc-950">
                    <span>Total</span>
                    <span className="text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Security Reassurance */}
                <div className="pt-2 text-[10px] text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>256-bit encrypted checkout with Stripe</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Free shipping on orders over ₹{FREE_SHIPPING_THRESHOLD}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

"use client";

import { useState, Suspense } from "react";
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
} from "lucide-react";
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
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Customer info form (Step 1)
  const [customerName, setCustomerName] = useState(user?.displayName || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [customerErrors, setCustomerErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

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

  // Credit Card state (Step 4)
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExp, setCardExp] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("123");

  // Step 1 Validation
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveName = customerName || user?.displayName || "";
    const effectiveEmail = customerEmail || user?.email || "";
    const effectivePhone = customerPhone || user?.phone || "";

    const errors: { name?: string; email?: string; phone?: string } = {};
    if (!effectiveName.trim()) errors.name = "Full name is required";
    if (!effectiveEmail.includes("@")) errors.email = "Valid email is required";
    if (!effectivePhone.trim() || effectivePhone.length < 7) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      return;
    }
    setCustomerErrors({});
    setCurrentStep(2);
  };

  // Step 2 Submit
  const onShippingAddressSubmit = () => {
    setCurrentStep(3);
  };

  // Step 4 Final Payment & Order Placement
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
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
        throw new Error(data.error || "Order creation failed");
      }

      setCreatedOrder(data.order);
      clearCart();
      setCurrentStep(5);
      toast.success("Order confirmed successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    try {
      const ok = await applyCoupon(promoInput);
      if (ok) setPromoInput("");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  if (items.length === 0 && currentStep !== 5) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-16 px-4">
        <div className="text-center bg-white p-8 sm:p-12 rounded-2xl border border-zinc-200/80 max-w-md w-full shadow-xs">
          <ShoppingBag className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-zinc-900">Your Cart is Empty</h2>
          <p className="text-xs text-zinc-500 mt-1 mb-6">
            Add your favorite shoes to the cart to proceed through checkout.
          </p>
          <Button asChild className="w-full rounded-xl">
            <Link href="/shop">Browse Catalog</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Stepper */}
        {currentStep < 5 && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
              {[
                { step: 1, label: "Customer", icon: User },
                { step: 2, label: "Shipping", icon: MapPin },
                { step: 3, label: "Delivery", icon: Truck },
                { step: 4, label: "Payment", icon: CreditCard },
              ].map((s, idx) => {
                const Icon = s.icon;
                const isCurrent = currentStep === s.step;
                const isCompleted = currentStep > s.step;
                return (
                  <div key={s.step} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      disabled={!isCompleted}
                      onClick={() => isCompleted && setCurrentStep(s.step as CheckoutStep)}
                      className="flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          isCompleted
                            ? "bg-emerald-600 text-white"
                            : isCurrent
                            ? "bg-zinc-900 text-white shadow-sm ring-4 ring-zinc-900/10"
                            : "bg-zinc-200 text-zinc-500"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span
                        className={`text-[11px] font-semibold ${
                          isCurrent ? "text-zinc-900" : isCompleted ? "text-zinc-700" : "text-zinc-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                    {idx < 3 && (
                      <div
                        className={`h-[2px] flex-1 mx-2 -mt-4 transition-colors ${
                          currentStep > idx + 1 ? "bg-emerald-500" : "bg-zinc-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5: ORDER SUCCESS */}
        {currentStep === 5 && createdOrder ? (
          <div className="max-w-2xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-zinc-200 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                Order Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-3">
                Thank you for your order!
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Order #{createdOrder.id} has been received and is being prepared.
              </p>
            </div>

            <div className="bg-zinc-50 rounded-xl p-4 text-left text-xs text-zinc-600 space-y-2 border border-zinc-100">
              <div className="flex justify-between font-semibold text-zinc-800">
                <span>Confirmation sent to:</span>
                <span>{createdOrder.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Method:</span>
                <span>{createdOrder.shippingMethod?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Arrival:</span>
                <span className="font-semibold text-zinc-900">
                  {createdOrder.shippingMethod?.estimatedDays}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-zinc-900 pt-2 border-t border-zinc-200">
                <span>Total Paid:</span>
                <span>{formatPrice(createdOrder.total)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 h-11 rounded-xl font-semibold">
                <Link href={`/account/orders/${createdOrder.id}`}>
                  View Full Invoice
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 h-11 rounded-xl font-semibold">
                <Link href="/shop">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          /* STEPS 1-4: TWO-COLUMN CHECKOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Step Form */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs">
              {/* STEP 1: CUSTOMER INFO */}
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">1. Customer Information</h2>
                    {!user && (
                      <Link
                        href="/login?redirect=/checkout"
                        className="text-xs font-semibold text-zinc-900 hover:underline"
                      >
                        Already have an account? Sign In
                      </Link>
                    )}
                  </div>

                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                        Full Name
                      </label>
                      <Input
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="mt-1 h-11 rounded-xl"
                      />
                      {customerErrors.name && (
                        <p className="text-xs text-red-500 mt-1">{customerErrors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                        Email Address (for order tracking & receipt)
                      </label>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="mt-1 h-11 rounded-xl"
                      />
                      {customerErrors.email && (
                        <p className="text-xs text-red-500 mt-1">{customerErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                        Phone Number (for delivery updates)
                      </label>
                      <Input
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1 h-11 rounded-xl"
                      />
                      {customerErrors.phone && (
                        <p className="text-xs text-red-500 mt-1">{customerErrors.phone}</p>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800"
                      >
                        Continue to Shipping
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2: SHIPPING ADDRESS */}
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">2. Shipping Address</h2>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  {user?.addresses && user.addresses.length > 0 && (
                    <div className="mb-6 space-y-2">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        Select a saved address:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {user.addresses.map((addr) => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => {
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
                            className="p-3 text-left rounded-xl border border-zinc-200 hover:border-zinc-900 bg-zinc-50/50 text-xs transition-colors"
                          >
                            <span className="font-bold text-zinc-900 block">{addr.fullName}</span>
                            <span className="text-zinc-500 truncate block">
                              {addr.street}, {addr.city}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form
                    onSubmit={addressForm.handleSubmit(onShippingAddressSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Recipient Name</label>
                      <Input
                        {...addressForm.register("fullName")}
                        placeholder="Alex Morgan"
                        className="mt-1 h-11 rounded-xl"
                      />
                      {addressForm.formState.errors.fullName && (
                        <p className="text-xs text-red-500 mt-1">
                          {addressForm.formState.errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Street Address</label>
                      <Input
                        {...addressForm.register("street")}
                        placeholder="742 Evergreen Terrace"
                        className="mt-1 h-11 rounded-xl"
                      />
                      {addressForm.formState.errors.street && (
                        <p className="text-xs text-red-500 mt-1">
                          {addressForm.formState.errors.street.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700">
                        Apartment, Suite, Unit (Optional)
                      </label>
                      <Input
                        {...addressForm.register("apartment")}
                        placeholder="Apt 4B"
                        className="mt-1 h-11 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700">City</label>
                        <Input
                          {...addressForm.register("city")}
                          placeholder="Springfield"
                          className="mt-1 h-11 rounded-xl"
                        />
                        {addressForm.formState.errors.city && (
                          <p className="text-xs text-red-500 mt-1">
                            {addressForm.formState.errors.city.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-zinc-700">
                          State / Region
                        </label>
                        <Input
                          {...addressForm.register("state")}
                          placeholder="OR"
                          className="mt-1 h-11 rounded-xl"
                        />
                        {addressForm.formState.errors.state && (
                          <p className="text-xs text-red-500 mt-1">
                            {addressForm.formState.errors.state.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700">
                          Postal / ZIP Code
                        </label>
                        <Input
                          {...addressForm.register("zipCode")}
                          placeholder="97477"
                          className="mt-1 h-11 rounded-xl"
                        />
                        {addressForm.formState.errors.zipCode && (
                          <p className="text-xs text-red-500 mt-1">
                            {addressForm.formState.errors.zipCode.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-zinc-700">Country</label>
                        <Input
                          {...addressForm.register("country")}
                          placeholder="United States"
                          className="mt-1 h-11 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800"
                      >
                        Continue to Delivery Method
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: DELIVERY METHOD */}
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">3. Select Delivery Method</h2>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
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
                              ? "border-zinc-900 bg-zinc-50/70 shadow-xs ring-2 ring-zinc-900"
                              : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                    : "border-zinc-300"
                                }`}
                              >
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-zinc-900">{method.name}</h4>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  {method.estimatedDays} • {method.description}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-sm text-zinc-900">
                              {isFree ? "FREE" : formatPrice(method.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-4">
                      <Button
                        onClick={() => setCurrentStep(4)}
                        className="w-full h-12 rounded-xl bg-zinc-900 text-white font-semibold text-sm hover:bg-zinc-800"
                      >
                        Continue to Payment
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT */}
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-zinc-900">4. Payment Details</h2>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Stripe Card Container Simulation / Element */}
                    <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                          <CreditCard className="h-4 w-4 text-zinc-600" />
                          Credit / Debit Card (Stripe Secured)
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold">
                          <span>VISA</span>
                          <span>MC</span>
                          <span>AMEX</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-600">
                          Card Number
                        </label>
                        <Input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4242 4242 4242 4242"
                          className="mt-1 h-11 rounded-xl bg-white font-mono text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-600">
                            Expiration
                          </label>
                          <Input
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            placeholder="MM/YY"
                            className="mt-1 h-11 rounded-xl bg-white font-mono text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-zinc-600">
                            CVC / CVV
                          </label>
                          <Input
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            placeholder="123"
                            className="mt-1 h-11 rounded-xl bg-white font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        256-bit encrypted SSL checkout. Your card details are never stored on our servers.
                      </span>
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full h-12 rounded-xl bg-zinc-900 text-white font-bold text-base hover:bg-zinc-800 transition-all shadow-md"
                    >
                      {isProcessing ? "Processing Secure Payment..." : `Pay ${formatPrice(total)}`}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order Summary Sidebar */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs sticky top-24 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                  <h3 className="font-bold text-zinc-900 text-base">Order Summary</h3>
                  <Badge variant="secondary" className="text-xs">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {/* Items preview */}
                <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                          <span className="absolute bottom-0 right-0 bg-zinc-900 text-white text-[9px] font-bold px-1 rounded-tl-md">
                            {item.quantity}x
                          </span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-xs text-zinc-900 truncate max-w-[140px]">
                            {item.name}
                          </h5>
                          <p className="text-[11px] text-zinc-500">
                            Size US {item.size} • {item.color}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-xs text-zinc-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Box */}
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <Input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code (e.g. SOLE20)"
                    className="h-10 rounded-xl text-xs uppercase"
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isApplyingPromo}
                    className="h-10 rounded-xl text-xs font-semibold px-4 shrink-0"
                  >
                    Apply
                  </Button>
                </form>

                {couponCode && (
                  <div className="flex items-center justify-between bg-emerald-50 px-3 py-2 rounded-xl text-xs text-emerald-800 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      {couponCode} (-{formatPrice(discount)})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-600 hover:text-emerald-900 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Breakdown */}
                <div className="space-y-2 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
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
                  <Separator className="my-2" />
                  <div className="flex justify-between text-base font-black text-zinc-900">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
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

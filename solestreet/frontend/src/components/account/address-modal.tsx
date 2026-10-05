"use client";

import * as React from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Loader2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressSchema, type AddressFormValues } from "@/lib/validations/checkout";
import type { Address } from "@/types";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: Address | null;
  onSave: (data: AddressFormValues) => Promise<void>;
}

const POPULAR_COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "Netherlands",
  "Italy",
];

export function AddressModal({
  isOpen,
  onClose,
  addressToEdit,
  onSave,
}: AddressModalProps) {
  const isEditing = !!addressToEdit;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: "",
      street: "",
      apartment: "",
      city: "",
      state: "",
      zipCode: "",
      country: "United States",
      phone: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (addressToEdit) {
        reset({
          fullName: addressToEdit.fullName || "",
          street: addressToEdit.street || "",
          apartment: addressToEdit.apartment || "",
          city: addressToEdit.city || "",
          state: addressToEdit.state || "",
          zipCode: addressToEdit.zipCode || "",
          country: addressToEdit.country || "United States",
          phone: addressToEdit.phone || "",
          isDefault: addressToEdit.isDefault || false,
        });
      } else {
        reset({
          fullName: "",
          street: "",
          apartment: "",
          city: "",
          state: "",
          zipCode: "",
          country: "United States",
          phone: "",
          isDefault: false,
        });
      }
    }
  }, [isOpen, addressToEdit, reset]);

  const onSubmit = async (data: AddressFormValues) => {
    await onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-zinc-200">
        <div className="bg-zinc-950 p-6 text-white flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <DialogTitle className="text-lg font-black tracking-tight text-white">
              {isEditing ? "Edit Shipping Address" : "Add New Shipping Address"}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-300 mt-0.5">
              {isEditing
                ? "Update your delivery destination and contact info."
                : "Save your delivery address for rapid 1-click checkout."}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("fullName")}
                placeholder="e.g. John Doe"
                className={`h-11 rounded-xl ${errors.fullName ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-[11px] font-semibold text-red-500 mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("phone")}
                placeholder="+1 (555) 000-0000"
                className={`h-11 rounded-xl ${errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-[11px] font-semibold text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Street Address <span className="text-red-500">*</span>
            </label>
            <Input
              {...register("street")}
              placeholder="e.g. 742 Evergreen Terrace"
              className={`h-11 rounded-xl ${errors.street ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              disabled={isSubmitting}
            />
            {errors.street && (
              <p className="text-[11px] font-semibold text-red-500 mt-1">
                {errors.street.message}
              </p>
            )}
          </div>

          {/* Apartment */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Apartment, Suite, Unit <span className="text-zinc-400 font-normal normal-case">(Optional)</span>
            </label>
            <Input
              {...register("apartment")}
              placeholder="e.g. Apt 4B, Penthouse"
              className="h-11 rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("city")}
                placeholder="e.g. New York"
                className={`h-11 rounded-xl ${errors.city ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="text-[11px] font-semibold text-red-500 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                State / Province <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("state")}
                placeholder="e.g. NY"
                className={`h-11 rounded-xl ${errors.state ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                disabled={isSubmitting}
              />
              {errors.state && (
                <p className="text-[11px] font-semibold text-red-500 mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>
          </div>

          {/* Postal Code & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                ZIP / Postal Code <span className="text-red-500">*</span>
              </label>
              <Input
                {...register("zipCode")}
                placeholder="e.g. 10001"
                className={`h-11 rounded-xl ${errors.zipCode ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                disabled={isSubmitting}
              />
              {errors.zipCode && (
                <p className="text-[11px] font-semibold text-red-500 mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Country <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register("country")}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-200 bg-white text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  disabled={isSubmitting}
                >
                  {POPULAR_COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {errors.country && (
                <p className="text-[11px] font-semibold text-red-500 mt-1">
                  {errors.country.message}
                </p>
              )}
            </div>
          </div>

          {/* Set as Default Address Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-colors">
              <input
                type="checkbox"
                {...register("isDefault")}
                className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                disabled={isSubmitting}
              />
              <div className="text-xs">
                <span className="font-bold text-zinc-900 block">Set as default shipping address</span>
                <span className="text-zinc-500">Automatically use this address during fast checkout</span>
              </div>
            </label>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl h-11 px-5 text-xs font-bold border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl h-11 px-6 text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Update Address
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-1.5" />
                  Save Address
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

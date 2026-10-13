"use client";

import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { profileSchema, type ProfileFormValues } from "@/lib/validations/auth";
import { formatDate } from "@/lib/format";
import type { UserProfile } from "@/types";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
}

export function ProfileSettings({
  user,
  onUpdate,
  onResetPassword,
}: ProfileSettingsProps) {
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || "",
      phone: user.phone || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await onUpdate({
        displayName: data.displayName.trim(),
        phone: data.phone?.trim() || undefined,
      });
      reset(data);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) return;
    setIsResettingPassword(true);
    try {
      await onResetPassword(user.email);
      toast.success(`Password reset link dispatched to ${user.email}`);
    } catch {
      toast.error("Could not send password reset email. Please try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
          <div>
            <h3 className="text-lg font-black text-zinc-950 tracking-tight">
              Personal Information
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Manage your identity, contact preferences, and public collector display.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Verified Profile
            </Badge>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Account Role</p>
            <p className="mt-0.5 text-sm font-bold text-zinc-900">{user.role === "admin" ? "Administrator" : "Customer"}</p>
          </div>
          <Badge className={user.role === "admin" ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-zinc-200 text-zinc-700 border-zinc-300"}>
            {user.role === "admin" ? "ADMIN" : "CUSTOMER"}
          </Badge>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5 max-w-xl">
          {/* Display Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Display Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                {...register("displayName")}
                placeholder="e.g. John Doe"
                className={`h-11 pl-10 rounded-xl ${errors.displayName ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.displayName && (
              <p className="text-[11px] font-semibold text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.displayName.message}
              </p>
            )}
            <p className="text-[11px] text-zinc-400 mt-1">
              Visible on your orders and community reviews.
            </p>
          </div>

          {/* Email (Read only) */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                value={user.email}
                disabled
                className="h-11 pl-10 rounded-xl bg-zinc-50 text-zinc-500 border-zinc-200 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">
              Your primary authentication email. Contact concierge support to change.
            </p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                {...register("phone")}
                placeholder="+1 (555) 000-0000"
                className={`h-11 pl-10 rounded-xl ${errors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] font-semibold text-red-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone.message}
              </p>
            )}
            <p className="text-[11px] text-zinc-400 mt-1">
              Used for SMS delivery updates and courier drop confirmations.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="rounded-xl h-11 px-7 text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white min-w-[150px] shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </Button>
            {isDirty && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => reset()}
                disabled={isSubmitting}
                className="rounded-xl h-11 px-4 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
              >
                Discard
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Security & Access Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-black text-zinc-950 tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-zinc-900" />
            Security & Authentication
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Keep your credentials secured with two-factor standards and recovery options.
          </p>
        </div>

        <div className="divide-y divide-zinc-100 border-y border-zinc-100">
          {/* Password Reset */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-zinc-500" />
                Password & Authentication
              </h4>
              <p className="text-xs text-zinc-500">
                Receive an encrypted recovery link at your registered email address.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
              className="rounded-xl h-10 px-4 text-xs font-bold border-zinc-200 hover:bg-zinc-50 shrink-0"
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Dispatching...
                </>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </div>

          {/* Account Creation Date */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-0.5">
              <h4 className="font-bold text-zinc-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                Member Since
              </h4>
              <p className="text-zinc-500">
                Collector account established with authenticated credentials.
              </p>
            </div>
            <span className="font-mono font-bold text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100" suppressHydrationWarning>
              {user.createdAt ? formatDate(user.createdAt) : "Verified Member"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validations/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await resetPassword(data.email);
      setIsSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch {
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <Link href="/" className="text-3xl font-black tracking-tight text-zinc-900 inline-block">
            SoleStreet
          </Link>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-zinc-200/80">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">Check your inbox</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                If an account exists with that email address, we&apos;ve sent password reset instructions.
              </p>
              <div className="pt-4">
                <Button asChild variant="outline" className="w-full rounded-xl">
                  <Link href="/login">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="alex@example.com"
                    className="pl-10 h-11 rounded-xl"
                    disabled={isLoading}
                  />
                  <Mail className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3.5" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-sm transition-all"
              >
                {isLoading ? "Sending email..." : "Send Reset Link"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { toast } from "sonner";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const { signUp, signInWithGoogleProvider } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signUp(data.email, data.password, data.name);
      toast.success("Account created successfully! Welcome to SoleStreet.");
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create account. Please try again.";
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogleProvider();
      toast.success("Signed in with Google!");
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign in failed";
      setAuthError(msg);
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Already have an account?{" "}
            <Link
              href={`/login${redirect !== "/account" ? `?redirect=${redirect}` : ""}`}
              className="font-semibold text-zinc-900 underline hover:text-zinc-700"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-zinc-200/80">
          {authError && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {authError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <Input
                  {...register("name")}
                  type="text"
                  placeholder="Jordan Vance"
                  className="pl-10 h-11 rounded-xl"
                  disabled={isLoading}
                />
                <User className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="jordan@example.com"
                  className="pl-10 h-11 rounded-xl"
                  disabled={isLoading}
                />
                <Mail className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 8 characters (1 uppercase, 1 number)"
                  className="pl-10 pr-10 h-11 rounded-xl"
                  disabled={isLoading}
                />
                <Lock className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  className="pl-10 pr-10 h-11 rounded-xl"
                  disabled={isLoading}
                />
                <Lock className="h-4 w-4 text-zinc-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3.5 text-zinc-400 hover:text-zinc-600"
                  aria-label="Toggle password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-semibold text-sm transition-all"
              >
                {isLoading ? "Creating account..." : "Create Account"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-zinc-400 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-medium border-zinc-200 hover:bg-zinc-50"
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign up with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

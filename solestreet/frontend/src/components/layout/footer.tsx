"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, ShieldCheck, Lock, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  SITE_NAME,
  FOOTER_LINKS,
  SOCIAL_LINKS,
} from "@/lib/constants";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Welcome to SoleStreet VIP", {
      description: "You're first in line for our next limited release drop.",
    });
    setEmail("");
  };

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 selection:bg-white selection:text-zinc-950">
      {/* Newsletter VIP Section */}
      <div className="border-b border-zinc-900 bg-gradient-to-b from-zinc-900/40 to-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-300 text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Join The Inner Circle</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-3">
              Never Miss a Drop
            </h3>
            <p className="text-zinc-400 mb-8 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Get exclusive early access to high-heat releases, curated style edits, and members-only VIP promo codes.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 className="h-5 w-5" />
                <span>You&apos;re on the list! Check your inbox for your 20% discount code.</span>
              </div>
            ) : (
              <form
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                onSubmit={handleSubscribe}
              >
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email for newsletter"
                  className="bg-zinc-900/80 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-white h-12 rounded-xl text-sm"
                />
                <Button
                  type="submit"
                  size="lg"
                  className="bg-white text-zinc-950 hover:bg-zinc-200 font-bold h-12 px-7 rounded-xl shrink-0 text-sm shadow-md"
                >
                  Join VIP
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand & Mission */}
          <div className="col-span-2 sm:col-span-1">
            <Link
              href="/"
              className="text-2xl font-black text-white tracking-tight uppercase block mb-3"
            >
              {SITE_NAME}
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Curated premium footwear and high-heat streetwear silhouettes. 100% verified authentic, backed by specialist inspection.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
                aria-label="Twitter / X"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors border border-zinc-800"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Catalogue
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Client Care
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              Company
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-zinc-900" />

      {/* Bottom Legal & Payment Trust Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-zinc-400" />
            <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Encrypted 256-Bit SSL Checkout.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Authenticity Protocol
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

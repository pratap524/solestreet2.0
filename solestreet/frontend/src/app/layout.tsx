import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { AuthProvider } from "@/context/auth-context";
import { WishlistProvider } from "@/context/wishlist-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SoleStreet — Premium Footwear for Every Step",
    template: "%s | SoleStreet",
  },
  description:
    "Discover the latest styles in running, casual, basketball, and outdoor shoes from the world's best brands. Free shipping on orders over $150.",
  keywords: [
    "shoes",
    "sneakers",
    "footwear",
    "running shoes",
    "basketball shoes",
    "casual shoes",
    "hiking boots",
  ],
  authors: [{ name: "SoleStreet" }],
  openGraph: {
    type: "website",
    siteName: "SoleStreet",
    title: "SoleStreet — Premium Footwear for Every Step",
    description:
      "Discover the latest styles in running, casual, basketball, and outdoor shoes.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-[#fafaf9] text-zinc-950 min-h-screen flex flex-col selection:bg-zinc-900 selection:text-white"
        suppressHydrationWarning
      >
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Suspense fallback={null}>
                <Header />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "rounded-2xl shadow-xl font-medium",
                  style: {
                    background: "#09090b",
                    color: "#fafaf9",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    padding: "12px 16px",
                  },
                }}
              />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

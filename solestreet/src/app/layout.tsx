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
        className="font-sans antialiased bg-white text-zinc-900 min-h-screen flex flex-col"
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
                  style: {
                    background: "#18181b",
                    color: "#fff",
                    border: "1px solid #27272a",
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

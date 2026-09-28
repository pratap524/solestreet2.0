# SoleStreet — Premium E-Commerce Sneaker Store & Admin Portal

SoleStreet is a full-featured, modern e-commerce web application and administration dashboard built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Firebase Auth & Firestore**, and **Stripe Checkout**.

---

## 🚀 Key Features

### 🛍️ Customer Experience
- **Hero & Landing Banners**: Dynamic marketing sections with responsive imagery and direct CTAs.
- **Product Catalog**: Comprehensive catalog with filtering by category, gender, size, price slider, and instant search.
- **Product Detail Pages**: Multi-image interactive gallery, size/color selector with real-time stock feedback, customer reviews with star ratings and review submission.
- **Cart & Wishlist**: Slide-over cart sheet and dedicated cart page with promo code application, free shipping progress bar, and wishlist persistence with local + Firestore sync.
- **Multi-Step Checkout**: Shipping address management, order summary, coupon validation, and Stripe checkout integration.
- **Customer Account**: Profile management, saved shipping addresses, order history tracking with status indicators.
- **SEO & Social Sharing**: Dynamic Metadata, Open Graph tags, JSON-LD Product schema, auto-generated `sitemap.xml`, and `robots.txt`.

### 🛡️ Admin Dashboard (`/admin`)
- **Role-Based Access Control (RBAC)**: Secure route protection requiring `admin` role claims or demo admin access.
- **Admin Overview**: Executive summary with key metrics (Total Revenue, Orders, Customers, Products, Low Stock alerts), revenue charts, and quick-action widgets.
- **Product Management**: Complete CRUD operations for sneakers, inventory adjustment per size, price/discount management, tag toggles (Featured, New Arrival, Bestseller), and image URL management.
- **Category Management**: Category hierarchy creation, slug generation, product count tracking, and active toggles.
- **Order Management**: Search orders by customer or ID, filter by payment and fulfillment status, update tracking numbers, and manage fulfillment workflows.
- **Customer Management**: User profile lookup, order history inspection, and account enable/disable capabilities.
- **Coupon & Promo Management**: Percentage or fixed-dollar discounts, minimum order thresholds, usage limits, expiration dates, and active status toggles.
- **Review Moderation**: Moderation dashboard to inspect user reviews, approve/hide content, and handle flagged submissions.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Components**: React 19, Lucide React icons, Tailwind CSS v4, Framer Motion animations, Radix UI primitives, Sonner toasts.
- **State Management**: React Context (`CartContext`, `AuthContext`, `WishlistContext`).
- **Database & Auth**: Firebase Auth (Email/Password & Google Provider) + Cloud Firestore, with local fallback for immediate offline/demo evaluation.
- **Payments**: Stripe Checkout & Payment Intents API.
- **Testing**: Vitest for unit & business logic verification.

---

## ⚡ Quick Start

### 1. Installation
```bash
git clone https://github.com/your-repo/solestreet.git
cd solestreet
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Access & Demo Login

To test the Protected Admin Dashboard:
1. Navigate to `/login`.
2. Click the **"Log in as Demo Admin"** button at the top of the form, or log in with credentials `admin@solestreet.com` / `admin123`.
3. You will be redirected to `/admin` with full access to all management modules.

---

## 🧪 Running Tests & Type Checks

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run Unit Tests
npm test
```

---

## 📦 Production Deployment

Build the optimized Next.js bundle:
```bash
npm run build
npm run start
```
The application is ready for deployment on **Vercel**, **Firebase App Hosting**, or any Node.js hosting platform.

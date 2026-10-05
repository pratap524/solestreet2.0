# SoleStreet — Decoupled Architecture (Frontend & Backend)

SoleStreet is a premium e-commerce sneaker store and admin portal with a decoupled architecture separating the **Next.js 16 Client Frontend** and the **Express.js REST API Backend**.

---

## 🏗️ Architecture Overview

```
solestreet/
├── frontend/             # Next.js 16 (App Router), React 19, Tailwind CSS v4
│   ├── src/
│   │   ├── app/          # App router pages & layouts
│   │   ├── components/   # UI & feature components
│   │   ├── context/      # Auth, Cart, Wishlist state
│   │   └── lib/          # Utilities & client helpers
│   ├── next.config.ts    # Configured with proxy rewrites to Backend (:5000)
│   └── package.json
│
├── backend/              # Express.js REST API, TypeScript, Node.js
│   ├── src/
│   │   ├── server.ts     # Express server & CORS configuration
│   │   ├── routes/       # Products, Checkout, Orders, Coupons, Reviews, Admin
│   │   ├── services/     # StoreService, inventory, pricing, validations
│   │   ├── config/       # Environment & shipping/tax constants
│   │   └── types/        # Shared data interfaces
│   └── package.json
│
└── package.json          # Root scripts to orchestrate frontend & backend
```

---

## ⚡ Quick Start

### 1. Installation
Install dependencies for both frontend and backend:
```bash
# In the solestreet/ directory:
npm run install:all
```
Or individually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Running Locally

**Terminal 1 — Backend (Express REST API on port 5000):**
```bash
npm run dev:backend
# Or: cd backend && npm run dev
```

**Terminal 2 — Frontend (Next.js on port 3000):**
```bash
npm run dev:frontend
# Or: cd frontend && npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000) and automatically route API requests to the Express backend on [http://localhost:5000](http://localhost:5000).

---

## 🔌 Backend REST API Endpoints (`http://localhost:5000`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `GET` | `/api/products` | Get products (supports category, gender, brand, price, sort, search) |
| `GET` | `/api/products/:id` | Get product details by ID or slug |
| `POST` | `/api/products` | Create product (Admin) |
| `PUT` | `/api/products/:id` | Update product (Admin) |
| `DELETE` | `/api/products/:id` | Delete product (Admin) |
| `POST` | `/api/checkout` | Process order with inventory validation & server-side pricing |
| `POST` | `/api/checkout/payment-intent` | Stripe payment intent initialization |
| `GET` | `/api/orders` | List orders (supports `?userId=...`) |
| `GET` | `/api/orders/:id` | Get order by ID |
| `PATCH`| `/api/orders/:id/status` | Update fulfillment / tracking / payment status |
| `POST` | `/api/coupons/validate` | Validate promo code and compute discount |
| `GET` | `/api/coupons` | List all available coupons |
| `POST` | `/api/coupons` | Create new promo coupon |
| `GET` | `/api/reviews` | List reviews (supports `?productId=...`) |
| `POST` | `/api/reviews` | Submit a customer review |
| `PATCH`| `/api/reviews/:id/status` | Moderate review (`approved`, `hidden`) |
| `GET` | `/api/admin/overview` | Executive dashboard analytics (sales, orders, low stock) |
| `POST` | `/api/webhooks/stripe` | Stripe webhook listener |

---

## 🔐 Admin Access & Demo Login
- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)
- Demo Admin Credentials: `admin@solestreet.com` / `admin123` (or click **"Log in as Demo Admin"** on the login page).

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Tag,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Zap,
  RotateCcw,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  adminGetStats,
  adminGetOrders,
  adminGetProducts,
  adminGetCustomers,
} from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import type { AdminStats, Order, Product } from "@/types";
import { toast } from "sonner";

type ChartPeriod = "7d" | "30d" | "6m";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("6m");
  const [orderFilter, setOrderFilter] = useState<"all" | "unfulfilled" | "delivered" | "high-value">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const s = adminGetStats();
      const o = adminGetOrders();
      const p = adminGetProducts();
      setStats(s);
      setOrders(o);
      setAllProducts(p);
      setLowStockProducts(
        p.filter((prod) => prod.sizes.some((sz) => sz.stock <= 5)).slice(0, 6)
      );
    } catch (err) {
      console.error("Failed to load admin overview data:", err);
      setLoadError("Unable to retrieve store telemetry. Please refresh or retry.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Authentic Revenue Data Aggregation strictly derived from actual orders
  const chartData = useMemo(() => {
    const paidOrders = orders.filter(
      (o) => o.paymentStatus === "succeeded" || (o.paymentStatus as string) === "paid"
    );

    const now = new Date();

    if (chartPeriod === "7d") {
      // Last 7 days
      const days: { label: string; dateStr: string; value: number; count: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        const label = d.toLocaleDateString("en-US", { weekday: "short" });
        days.push({ label, dateStr, value: 0, count: 0 });
      }

      paidOrders.forEach((o) => {
        const orderDate = new Date(o.createdAt).toISOString().split("T")[0];
        const match = days.find((d) => d.dateStr === orderDate);
        if (match) {
          match.value += o.total;
          match.count += 1;
        }
      });

      return days.map((d) => ({
        label: d.label,
        value: Math.round(d.value * 100) / 100,
        ordersCount: d.count,
      }));
    }

    if (chartPeriod === "30d") {
      // 4 discrete weeks over the last 30 days
      const weeks: { label: string; start: number; end: number; value: number; count: number }[] = [
        { label: "Wk 1", start: 28, end: 21, value: 0, count: 0 },
        { label: "Wk 2", start: 21, end: 14, value: 0, count: 0 },
        { label: "Wk 3", start: 14, end: 7, value: 0, count: 0 },
        { label: "Wk 4", start: 7, end: 0, value: 0, count: 0 },
      ];

      const nowTime = now.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      paidOrders.forEach((o) => {
        const orderTime = new Date(o.createdAt).getTime();
        const diffDays = (nowTime - orderTime) / oneDay;
        const match = weeks.find((w) => diffDays <= w.start && diffDays >= w.end);
        if (match) {
          match.value += o.total;
          match.count += 1;
        }
      });

      return weeks.map((w) => ({
        label: w.label,
        value: Math.round(w.value * 100) / 100,
        ordersCount: w.count,
      }));
    }

    // Default: Last 6 calendar months
    const months: { label: string; yearMonth: string; value: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short" });
      months.push({ label, yearMonth, value: 0, count: 0 });
    }

    paidOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const match = months.find((m) => m.yearMonth === yearMonth);
      if (match) {
        match.value += o.total;
        match.count += 1;
      }
    });

    return months.map((m) => ({
      label: m.label,
      value: Math.round(m.value * 100) / 100,
      ordersCount: m.count,
    }));
  }, [orders, chartPeriod]);

  const maxChartValue = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value));
    return max > 0 ? max : 100;
  }, [chartData]);

  const chartPeriodTotal = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.value, 0);
  }, [chartData]);

  // Filtered orders for Recent Orders Table
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilter === "unfulfilled") {
        if (o.fulfillmentStatus !== "unfulfilled" && o.fulfillmentStatus !== "processing") {
          return false;
        }
      } else if (orderFilter === "delivered") {
        if (o.fulfillmentStatus !== "delivered") return false;
      } else if (orderFilter === "high-value") {
        if (o.total < 250) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesCustomer =
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer) return false;
      }

      return true;
    });
  }, [orders, orderFilter, searchQuery]);

  // Export actual orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error("No recorded orders available to export");
      return;
    }

    const headers = [
      "Order ID",
      "Date",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Items Count",
      "Subtotal ($)",
      "Discount ($)",
      "Shipping ($)",
      "Tax ($)",
      "Total ($)",
      "Fulfillment Status",
      "Payment Status",
      "Tracking Number",
    ];

    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString(),
      `"${o.customer.name.replace(/"/g, '""')}"`,
      o.customer.email,
      `"${o.customer.phone || ""}"`,
      o.items.length,
      o.subtotal.toFixed(2),
      o.discount.toFixed(2),
      o.shippingCost.toFixed(2),
      o.tax.toFixed(2),
      o.total.toFixed(2),
      o.fulfillmentStatus,
      o.paymentStatus,
      `"${o.trackingNumber || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `solestreet_orders_manifest_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders manifest exported successfully!");
  };

  // Calculate vault total pairs
  const totalVaultPairs = useMemo(() => {
    return allProducts.reduce(
      (acc, prod) => acc + prod.sizes.reduce((sAcc, s) => sAcc + s.stock, 0),
      0
    );
  }, [allProducts]);

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-zinc-200 rounded-xl" />
            <div className="h-4 w-96 bg-zinc-200 rounded-lg" />
          </div>
          <div className="h-10 w-36 bg-zinc-200 rounded-xl" />
        </div>

        {/* KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs" />
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-white rounded-2xl border border-zinc-200/80 shadow-xs" />
          <div className="h-72 bg-white rounded-2xl border border-zinc-200/80 shadow-xs" />
        </div>

        {/* Table Skeleton */}
        <div className="h-80 bg-white rounded-2xl border border-zinc-200/80 shadow-xs" />
      </div>
    );
  }

  // Error State
  if (loadError) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-xs text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
          <AlertCircle className="w-6 h-6 stroke-[2]" />
        </div>
        <h3 className="text-lg font-black text-zinc-950">Dashboard Telemetry Error</h3>
        <p className="text-xs text-zinc-500 leading-relaxed">{loadError}</p>
        <Button
          onClick={loadData}
          className="rounded-xl font-bold text-xs h-10 px-5 bg-zinc-950 hover:bg-zinc-800 text-white"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
          Retry Telemetry Sync
        </Button>
      </div>
    );
  }

  const safeStats = stats || {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight flex items-center gap-2.5">
            SoleStreet Command Center
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time telemetry, revenue analytics, inventory alerts, and order manifests.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="rounded-xl h-10 px-4 text-xs font-bold border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 mr-2 text-zinc-500" />
            Export Orders CSV
          </Button>

          <Button
            asChild
            className="rounded-xl h-10 px-5 text-xs font-bold bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm"
          >
            <Link href="/admin/products">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Sneaker
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Top KPI Cards Grid (White Cards on Neutral Gray) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Gross Sales */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Gross Revenue
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
              {formatPrice(safeStats.totalSales)}
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-zinc-500">
              AOV: <strong className="text-zinc-900">{formatPrice(safeStats.averageOrderValue)}</strong>
            </span>
            <span className="text-[11px] text-zinc-400 font-mono">
              {orders.filter((o) => o.paymentStatus === "succeeded" || (o.paymentStatus as string) === "paid").length} Paid
            </span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              {safeStats.totalOrders}
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-zinc-600">
              <span className="font-bold text-amber-600">{safeStats.pendingOrders}</span> In Progress
            </span>
            <Link
              href="/admin/orders"
              className="text-[11px] font-bold text-zinc-800 hover:text-zinc-950 flex items-center"
            >
              Manage <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* KPI 3: Customers */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Registered Collectors
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100/80 flex items-center justify-center text-purple-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              {safeStats.totalCustomers}
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-zinc-500">
              Active CRM Accounts
            </span>
            <Link
              href="/admin/customers"
              className="text-[11px] font-bold text-zinc-800 hover:text-zinc-950 flex items-center"
            >
              Directory <ArrowUpRight className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* KPI 4: Sneaker Catalog */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs hover:border-zinc-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Sneaker Catalog
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-600">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight font-mono">
              {safeStats.totalProducts} <span className="text-sm font-semibold text-zinc-400 font-sans">Styles</span>
            </p>
          </div>

          <div className="mt-4 pt-3.5 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-zinc-500 font-medium">
              Vault Stock: <strong className="text-zinc-800">{totalVaultPairs}</strong> pairs
            </span>
            {safeStats.lowStockProducts > 0 ? (
              <Badge className="bg-rose-50 text-rose-700 border-rose-200 text-[10px] font-bold px-1.5 py-0.2">
                {safeStats.lowStockProducts} Low
              </Badge>
            ) : (
              <span className="text-[11px] text-emerald-600 font-bold">100% Stocked</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Low-Stock Section (Alert or Optimal State) */}
      {lowStockProducts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-zinc-950 flex items-center gap-2">
                  Low Stock Inventory Warning
                  <span className="text-[10px] font-mono font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    {lowStockProducts.length} Silhouettes Critical
                  </span>
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  The following sneaker sizes have dropped to $\le 5$ units in the physical vault.
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl h-9 text-xs font-bold border-amber-200 bg-white hover:bg-amber-50 text-amber-900 shrink-0 self-start sm:self-auto"
            >
              <Link href="/admin/products">
                Vault Stock Manager <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((prod) => {
              const lowestSizes = prod.sizes.filter((s) => s.stock <= 5);
              const minStock = Math.min(...prod.sizes.map((s) => s.stock));
              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl border border-zinc-200/90 p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 bg-zinc-100 rounded-lg overflow-hidden shrink-0 border border-zinc-100">
                      {prod.images?.[0]?.url && (
                        <Image
                          src={prod.images[0].url}
                          alt={prod.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block truncate">
                        {prod.brand}
                      </span>
                      <p className="text-xs font-bold text-zinc-950 truncate">{prod.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                          {minStock} pairs left
                        </span>
                        <span className="text-[10px] text-zinc-400 truncate">
                          ({lowestSizes.map((s) => `US ${s.size}`).join(", ")})
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 rounded-lg shrink-0"
                  >
                    <Link href="/admin/products">
                      Restock →
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-950">All Inventory Optimal</p>
              <p className="text-[11px] text-zinc-500">
                Zero products are currently below the critical stock threshold (5 pairs).
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl h-8 text-xs font-bold border-zinc-200">
            <Link href="/admin/products">Inspect Catalog</Link>
          </Button>
        </div>
      )}

      {/* 4. Middle Row: Authentic Revenue Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Card (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-zinc-950 tracking-tight">
                  Authentic Revenue Trends
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                  Verified Sales
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Period Volume: <strong className="text-zinc-900 font-bold">{formatPrice(chartPeriodTotal)}</strong>
              </p>
            </div>

            {/* Chart Period Selector */}
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
              {(
                [
                  { key: "7d", label: "7 Days" },
                  { key: "30d", label: "30 Days" },
                  { key: "6m", label: "6 Months" },
                ] as const
              ).map((p) => (
                <button
                  key={p.key}
                  onClick={() => setChartPeriod(p.key)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    chartPeriod === p.key
                      ? "bg-white text-zinc-950 shadow-2xs"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization strictly derived from real transactions */}
          <div className="pt-2">
            <div className="h-56 flex items-end gap-3 sm:gap-4 px-2 pb-2 border-b border-zinc-100">
              {chartData.map((d, idx) => {
                const heightPercent =
                  maxChartValue > 0 && d.value > 0
                    ? Math.max(8, Math.round((d.value / maxChartValue) * 100))
                    : 4;
                const isMax = d.value > 0 && d.value === maxChartValue;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-12 bg-zinc-950 text-white text-[10px] font-bold py-1 px-2 rounded-lg whitespace-nowrap z-10 shadow-lg">
                      <span className="block text-emerald-400">{formatPrice(d.value)}</span>
                      <span className="text-zinc-400 font-normal">{d.ordersCount} orders</span>
                    </div>

                    <div className="w-full flex items-end justify-center h-44">
                      <div
                        className={`w-full max-w-[42px] rounded-t-xl transition-all duration-500 ${
                          isMax
                            ? "bg-zinc-950 shadow-sm"
                            : d.value > 0
                            ? "bg-zinc-300 group-hover:bg-zinc-800"
                            : "bg-zinc-100"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-950 truncate">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex flex-wrap items-center justify-between text-xs text-zinc-400 font-medium">
              <span>● Real-time transaction aggregate</span>
              <span>Calculated from verified customer orders</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel (1 Column) */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-current" />
              Quick Command Actions
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Immediate operational shortcuts for high-velocity store workflows.
            </p>

            <div className="mt-4 space-y-2">
              <Link
                href="/admin/products"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-xs font-bold text-zinc-900 group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </span>
                  Add New Sneaker
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
              </Link>

              <Link
                href="/admin/coupons"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-xs font-bold text-zinc-900 group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Tag className="w-4 h-4" />
                  </span>
                  Issue Drop Coupon
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
              </Link>

              <Link
                href="/admin/customers"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-xs font-bold text-zinc-900 group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Users className="w-4 h-4" />
                  </span>
                  Collector CRM
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
              </Link>

              <Link
                href="/admin/categories"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-xs font-bold text-zinc-900 group"
              >
                <span className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 group-hover:bg-zinc-950 group-hover:text-white transition-colors">
                    <Layers className="w-4 h-4" />
                  </span>
                  Collection Taxonomy
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900" />
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs transition-colors"
            >
              Open Live Storefront <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. Recent Orders Table (Data-Dense White Card) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-zinc-950 tracking-tight">
              Live Order Manifest
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Verified sneaker purchases across all checkout channels.
            </p>
          </div>

          {/* Filter Pills & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, customer..."
                className="h-8 pl-8 text-xs rounded-xl border-zinc-200"
              />
            </div>

            <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "unfulfilled", label: "Pending" },
                  { id: "delivered", label: "Delivered" },
                  { id: "high-value", label: "VIP ($250+)" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                    orderFilter === f.id
                      ? "bg-white text-zinc-950 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-950"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No Orders Received Yet"
            description="When customers place orders on the storefront, live transaction manifests, item breakdown, and courier tracking will appear here."
            actionLabel="View Storefront"
            actionHref="/"
            secondaryLabel="Catalog Inventory"
            secondaryHref="/admin/products"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 border-b border-zinc-100 text-zinc-400 uppercase tracking-wider font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3">Order Ref</th>
                  <th className="px-4 py-3">Collector Customer</th>
                  <th className="px-4 py-3 hidden md:table-cell">Footwear Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Fulfillment</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Payment</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Placed Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      No orders match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-50/70 transition-colors">
                      {/* Order ID */}
                      <td className="px-4 py-3 font-mono font-bold text-zinc-950 whitespace-nowrap">
                        #{order.id}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {order.customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-900 truncate">{order.customer.name}</p>
                            <p className="text-[10px] text-zinc-400 truncate">{order.customer.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Items Thumbnails */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          {order.items.slice(0, 2).map((item, i) => (
                            <div
                              key={i}
                              className="relative w-7 h-7 rounded-md overflow-hidden bg-zinc-100 border border-zinc-200/80 shrink-0"
                              title={`${item.brand} ${item.name}`}
                            >
                              {item.image && (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="28px"
                                />
                              )}
                            </div>
                          ))}
                          <span className="text-[11px] text-zinc-500 font-medium">
                            {order.items.length} {order.items.length === 1 ? "pair" : "pairs"}
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-4 py-3 font-bold text-zinc-950 font-mono whitespace-nowrap">
                        {formatPrice(order.total)}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={order.fulfillmentStatus} dot />
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-3 hidden sm:table-cell whitespace-nowrap">
                        <StatusBadge status={order.paymentStatus} dot={false} className="text-[10px]" />
                      </td>

                      {/* Placed Date */}
                      <td className="px-4 py-3 text-zinc-400 text-[11px] hidden lg:table-cell whitespace-nowrap" suppressHydrationWarning>
                        {formatDate(order.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg"
                        >
                          <Link href={`/admin/orders?id=${order.id}`}>
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer */}
        {orders.length > 0 && (
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {filteredOrders.length} of {orders.length} total orders</span>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-xs font-bold text-zinc-900 hover:text-zinc-600"
            >
              <Link href="/admin/orders">
                Open Full Orders Manager <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

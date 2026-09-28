"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  Clock,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminGetStats,
  adminGetOrders,
  adminGetProducts,
} from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import type { AdminStats, Order, Product } from "@/types";

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  href,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  href?: string;
}) {
  const content = (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors group">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
          <Icon className="h-5 w-5 text-zinc-400" />
        </div>
        {trend && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">
            <TrendingUp className="h-3 w-3 mr-1" />
            {trend}
          </Badge>
        )}
      </div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-xs text-zinc-500 mt-1 font-medium">{label}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function OrderStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    unfulfilled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    refunded: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  };
  return (
    <Badge className={`text-[10px] font-semibold capitalize ${styles[status] || styles.unfulfilled}`}>
      {status}
    </Badge>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);

  useEffect(() => {
    setStats(adminGetStats());
    setRecentOrders(adminGetOrders().slice(0, 8));
    setLowStock(
      adminGetProducts()
        .filter((p) => p.sizes.some((s) => s.stock <= 5))
        .slice(0, 6)
    );
  }, []);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900 border border-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // Revenue chart data (mock monthly data)
  const monthlyData = [
    { month: "Apr", value: 4200 },
    { month: "May", value: 5800 },
    { month: "Jun", value: 7100 },
    { month: "Jul", value: 6400 },
    { month: "Aug", value: 8900 },
    { month: "Sep", value: stats.totalSales || 3200 },
  ];
  const maxValue = Math.max(...monthlyData.map((d) => d.value));

  // Order status summary
  const orders = adminGetOrders();
  const statusCounts = {
    unfulfilled: orders.filter((o) => o.fulfillmentStatus === "unfulfilled").length,
    processing: orders.filter((o) => o.fulfillmentStatus === "processing").length,
    shipped: orders.filter((o) => o.fulfillmentStatus === "shipped").length,
    delivered: orders.filter((o) => o.fulfillmentStatus === "delivered").length,
    cancelled: orders.filter((o) => o.fulfillmentStatus === "cancelled").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Welcome back. Here&apos;s what&apos;s happening with your store.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Sales"
          value={formatPrice(stats.totalSales)}
          icon={DollarSign}
          trend="+12.5%"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toString()}
          icon={ShoppingCart}
          href="/admin/orders"
        />
        <StatCard
          label="Customers"
          value={stats.totalCustomers.toString()}
          icon={Users}
          href="/admin/customers"
        />
        <StatCard
          label="Products"
          value={stats.totalProducts.toString()}
          icon={Package}
          href="/admin/products"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Low Stock Alerts"
          value={stats.lowStockProducts.toString()}
          icon={AlertTriangle}
          href="/admin/products"
        />
        <StatCard
          label="Pending Orders"
          value={stats.pendingOrders.toString()}
          icon={Clock}
          href="/admin/orders"
        />
        <StatCard
          label="Avg. Order Value"
          value={formatPrice(stats.averageOrderValue)}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white">Revenue Overview</h2>
            <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
              Last 6 months
            </Badge>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] text-zinc-500 font-medium">
                  {formatPrice(d.value)}
                </span>
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-500 min-h-[4px]"
                  style={{ height: `${(d.value / maxValue) * 100}%` }}
                />
                <span className="text-[10px] text-zinc-500 font-medium">
                  {d.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Summary */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-white">Order Status</h2>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs h-7" asChild>
              <Link href="/admin/orders">
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={status} />
                </div>
                <span className="text-sm font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
          {orders.length === 0 && (
            <p className="text-xs text-zinc-500 text-center py-6">
              No orders yet. They&apos;ll appear here once customers start purchasing.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Recent Orders</h2>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs h-7" asChild>
              <Link href="/admin/orders">
                View All <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8">
              No orders yet
            </p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders?id=${order.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{order.id}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {order.customer.name} · {order.items.length} item
                      {order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-white">
                      {formatPrice(order.total)}
                    </p>
                    <OrderStatusBadge status={order.fulfillmentStatus} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white">Low Stock Alert</h2>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs h-7" asChild>
              <Link href="/admin/products">
                Manage <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-8">
              All products are well-stocked 🎉
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => {
                const minStock = Math.min(...product.sizes.map((s) => s.stock));
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/50 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {product.brand} · {product.category}
                      </p>
                    </div>
                    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-semibold">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {minStock} left
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

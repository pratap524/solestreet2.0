"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Truck,
  Package as PackageIcon,
  Mail,
  Trash2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
} from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { Order, FulfillmentStatus, PaymentStatus } from "@/types";

const PAGE_SIZE = 10;
const STATUSES: FulfillmentStatus[] = [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPayment, setFilterPayment] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setOrders(adminGetOrders());
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleDeleteOrder = (id: string) => {
    adminDeleteOrder(id);
    loadOrders();
    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
    }
    setDeleteConfirm(null);
    toast.success(`Order #${id} deleted.`);
  };

  const filtered = useMemo(() => {
    let result = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }
    if (filterStatus) result = result.filter((o) => o.fulfillmentStatus === filterStatus);
    if (filterPayment) result = result.filter((o) => o.paymentStatus === filterPayment);
    return result;
  }, [orders, search, filterStatus, filterPayment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleUpdateStatus = (status: FulfillmentStatus) => {
    if (!selectedOrder) return;
    const updated = adminUpdateOrderStatus(
      selectedOrder.id,
      status,
      trackingNumber || undefined,
      notes || undefined
    );
    if (updated) {
      loadOrders();
      setSelectedOrder(updated);
      toast.success(`Order #${updated.id} status updated to ${status}.`);
    }
  };

  const handleSendNotification = () => {
    toast.success("Order status email dispatched to customer.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Order Fulfillment
            </h1>
            <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-bold px-2 py-0.5 text-xs">
              {orders.length} Total Orders
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            Track customer sneaker dispatches, manage shipping tracking numbers, and process fulfillment workflows.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadOrders}
          className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 h-10 px-3 text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by order ID, customer name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden"
          >
            <option value="">All Fulfillment</option>
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterPayment}
            onChange={(e) => {
              setFilterPayment(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-semibold focus:outline-hidden"
          >
            <option value="">All Payment</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded / Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          {(search || filterStatus || filterPayment) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setFilterStatus("");
                setFilterPayment("");
                setPage(1);
              }}
              className="h-10 px-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Customer</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Payment</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginated.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-zinc-900 text-xs sm:text-sm">
                    #{order.id}
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="font-bold text-zinc-900 text-xs sm:text-sm">{order.customer.name}</p>
                    <p className="text-[11px] text-zinc-500">{order.customer.email}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-zinc-900 text-xs sm:text-sm">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <StatusBadge
                      status={order.paymentStatus === "succeeded" ? "paid" : order.paymentStatus}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={order.fulfillmentStatus} />
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-xs text-zinc-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 text-xs h-8 px-2.5 rounded-lg font-semibold"
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingNumber(order.trackingNumber || "");
                          setNotes(order.notes || "");
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Order"
                        onClick={() => setDeleteConfirm(order.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 px-4">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                        <ShoppingBag className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 mb-1">No orders found</h4>
                      <p className="text-xs text-zinc-500">
                        {search || filterStatus || filterPayment
                          ? "No orders match your filter criteria. Try resetting your search."
                          : "No customer orders have been recorded yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-zinc-200 bg-zinc-50/50">
            <p className="text-xs text-zinc-500">
              Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} orders
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-zinc-600 rounded-lg"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-zinc-600 rounded-lg"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="w-[96vw] max-w-2xl max-h-[92vh] overflow-y-auto bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-zinc-900">
              Order #{selectedOrder?.id} Details
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Placed on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-5 py-2">
              {/* Customer & Shipping info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Customer Information
                  </h4>
                  <p className="text-sm font-bold text-zinc-900">{selectedOrder.customer.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone && (
                    <p className="text-xs text-zinc-500 mt-0.5">{selectedOrder.customer.phone}</p>
                  )}
                </div>

                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Shipping Address
                  </h4>
                  <p className="text-xs font-semibold text-zinc-800">
                    {selectedOrder.shippingAddress.street}
                    {selectedOrder.shippingAddress.apartment && `, ${selectedOrder.shippingAddress.apartment}`}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-xs text-zinc-500">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-zinc-700 mb-2">
                  Purchased Items ({selectedOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-zinc-50 rounded-xl p-3 border border-zinc-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{item.name}</p>
                          <p className="text-[11px] text-zinc-500">
                            Size US {item.size} • {item.color} • Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black text-zinc-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{(selectedOrder.shippingMethod?.price ?? 0) === 0 ? "FREE" : formatPrice(selectedOrder.shippingMethod?.price ?? 0)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-zinc-900 pt-2 border-t border-zinc-200">
                  <span>Total Amount Paid</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Fulfillment Actions */}
              <div className="space-y-3 pt-2 border-t border-zinc-200">
                <h4 className="text-xs font-bold text-zinc-900">Fulfillment Status Controls</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedOrder.fulfillmentStatus === status ? "default" : "outline"}
                      onClick={() => handleUpdateStatus(status)}
                      className={`text-xs capitalize rounded-xl h-8 font-semibold ${
                        selectedOrder.fulfillmentStatus === status
                          ? "bg-zinc-900 text-white"
                          : "border-zinc-200 text-zinc-700 bg-white hover:bg-zinc-50"
                      }`}
                    >
                      {status}
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1 block">Tracking Number</label>
                    <Input
                      placeholder="e.g. 1Z9999999999999999"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="bg-white border-zinc-200 text-xs font-mono h-9 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1 block">Staff Notes</label>
                    <Input
                      placeholder="Internal dispatch notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-white border-zinc-200 text-xs h-9 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendNotification}
                    className="text-xs font-semibold rounded-xl border-zinc-200"
                  >
                    <Mail className="h-3.5 w-3.5 mr-1" /> Email Customer
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrder.fulfillmentStatus)}
                    className="bg-zinc-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Save Tracking & Notes
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-900">Delete Order #{deleteConfirm}?</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-1">
              Are you sure you want to permanently delete this order record? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-xl border-zinc-200 text-xs font-semibold h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDeleteOrder(deleteConfirm)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold h-10 shadow-xs"
            >
              Delete Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

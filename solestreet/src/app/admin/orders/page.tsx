"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Eye, Truck, Package as PackageIcon, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { adminGetOrders, adminUpdateOrderStatus, adminDeleteOrder } from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { Order, FulfillmentStatus } from "@/types";

const PAGE_SIZE = 10;
const STATUSES: FulfillmentStatus[] = ["unfulfilled", "processing", "shipped", "delivered", "cancelled", "refunded"];

const statusStyles: Record<string, string> = {
  unfulfilled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  shipped: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const paymentStyles: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  succeeded: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

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

  useEffect(() => { setOrders(adminGetOrders()); }, []);

  const handleDeleteOrder = (id: string) => {
    adminDeleteOrder(id);
    setOrders(adminGetOrders());
    if (selectedOrder?.id === id) {
      setSelectedOrder(null);
    }
    setDeleteConfirm(null);
    toast.success(`Order ${id} deleted`);
  };

  const filtered = useMemo(() => {
    let result = [...orders];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.email.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter((o) => o.fulfillmentStatus === filterStatus);
    if (filterPayment) result = result.filter((o) => o.paymentStatus === filterPayment);
    return result;
  }, [orders, search, filterStatus, filterPayment]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleUpdateStatus = (status: FulfillmentStatus) => {
    if (!selectedOrder) return;
    const updated = adminUpdateOrderStatus(selectedOrder.id, status, trackingNumber || undefined, notes || undefined);
    if (updated) {
      setOrders(adminGetOrders());
      setSelectedOrder(updated);
      toast.success(`Order ${updated.id} updated to ${status}`);
    }
  };

  const handleSendNotification = () => {
    toast.success("📧 Order status notification sent (placeholder — connect email service to enable)");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Orders</h1>
        <p className="text-sm text-zinc-500">{orders.length} total orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input placeholder="Search by ID, name, or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl h-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
            <option value="">All Fulfillment</option>
            {STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select value={filterPayment} onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }} className="h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
            <option value="">All Payment</option>
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">Order ID</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden md:table-cell">Customer</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden lg:table-cell">Payment</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden md:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-zinc-500 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((order) => (
                <tr key={order.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3"><span className="text-xs font-bold text-white">{order.id}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-xs text-white font-medium">{order.customer.name}</p>
                    <p className="text-[10px] text-zinc-500">{order.customer.email}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs font-bold text-white">{formatPrice(order.total)}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge className={`text-[10px] font-semibold capitalize ${paymentStyles[order.paymentStatus] || ""}`}>{order.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={`text-[10px] font-semibold capitalize ${statusStyles[order.fulfillmentStatus] || ""}`}>{order.fulfillmentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-[10px] text-zinc-500">{formatDate(order.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs h-7 rounded-lg" onClick={() => { setSelectedOrder(order); setTrackingNumber(order.trackingNumber || ""); setNotes(order.notes || ""); }}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-500 hover:text-red-400" title="Delete Order" onClick={() => setDeleteConfirm(order.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-zinc-500 text-sm">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader><DialogTitle>Order {selectedOrder?.id}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-5 py-2">
              {/* Customer Info */}
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-zinc-400 mb-2">Customer Information</h3>
                <p className="text-sm text-white font-medium">{selectedOrder.customer.name}</p>
                <p className="text-xs text-zinc-400">{selectedOrder.customer.email}</p>
                <p className="text-xs text-zinc-400">{selectedOrder.customer.phone}</p>
              </div>

              {/* Shipping Address */}
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-zinc-400 mb-2">Shipping Address</h3>
                <p className="text-xs text-zinc-300">{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 mb-2">Items ({selectedOrder.items.length})</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-zinc-700 rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs text-white font-medium">{item.name}</p>
                          <p className="text-[10px] text-zinc-500">Size {item.size} · {item.color} · Qty {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Totals */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-{formatPrice(selectedOrder.discount)}</span></div>}
                <div className="flex justify-between text-zinc-400"><span>Shipping</span><span>{formatPrice(selectedOrder.shippingCost)}</span></div>
                <div className="flex justify-between text-zinc-400"><span>Tax</span><span>{formatPrice(selectedOrder.tax)}</span></div>
                <div className="flex justify-between text-white font-bold text-sm"><span>Total</span><span>{formatPrice(selectedOrder.total)}</span></div>
              </div>

              <Separator className="bg-zinc-800" />

              {/* Update Status */}
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 mb-2">Update Fulfillment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={selectedOrder.fulfillmentStatus === status ? "default" : "outline"}
                      className={`rounded-xl text-xs capitalize ${selectedOrder.fulfillmentStatus === status ? "bg-white text-zinc-900" : "border-zinc-700 text-zinc-400 hover:text-white"}`}
                      onClick={() => handleUpdateStatus(status)}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">
                  <Truck className="h-3 w-3 inline mr-1" /> Tracking Number
                </label>
                <div className="flex gap-2">
                  <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Enter tracking number" className="bg-zinc-800 border-zinc-700 text-white rounded-xl flex-1" />
                  <Button size="sm" className="rounded-xl bg-zinc-800 text-white hover:bg-zinc-700" onClick={() => {
                    adminUpdateOrderStatus(selectedOrder.id, selectedOrder.fulfillmentStatus, trackingNumber, notes);
                    setOrders(adminGetOrders());
                    toast.success("Tracking number saved");
                  }}>
                    <PackageIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 rounded-xl border-zinc-700 text-zinc-300 hover:text-white" onClick={handleSendNotification}>
                  <Mail className="h-3.5 w-3.5 mr-2" /> Send Status Notification
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl border-red-900/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={() => setDeleteConfirm(selectedOrder.id)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete order <span className="text-white font-mono">{deleteConfirm}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-zinc-700 text-zinc-300 rounded-xl" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={() => deleteConfirm && handleDeleteOrder(deleteConfirm)}>
              Delete Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  Mail,
  Calendar,
  Lock,
  X,
  UserCheck,
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
import {
  adminGetCustomers,
  adminCreateCustomer,
  adminUpdateCustomer,
  adminDeleteCustomer,
  adminToggleCustomerStatus,
  adminGetOrders,
} from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { toast } from "sonner";
import type { UserProfile, Order } from "@/types";

const PAGE_SIZE = 10;

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<UserProfile | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // CRUD Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<UserProfile | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({ displayName: "", email: "" });
  const [editForm, setEditForm] = useState({ displayName: "", email: "" });

  const loadData = useCallback(() => {
    setCustomers(adminGetCustomers());
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.uid.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const viewCustomer = (customer: UserProfile) => {
    setSelectedCustomer(customer);
    const allOrders = adminGetOrders();
    setCustomerOrders(
      allOrders.filter(
        (o) =>
          o.userId === customer.uid ||
          o.customer.email.toLowerCase() === customer.email.toLowerCase()
      )
    );
  };

  const handleCreateCustomer = () => {
    if (!createForm.displayName.trim() || !createForm.email.trim()) {
      toast.error("Please provide both name and email.");
      return;
    }
    adminCreateCustomer({
      displayName: createForm.displayName.trim(),
      email: createForm.email.trim(),
    });
    loadData();
    setCreateDialogOpen(false);
    setCreateForm({ displayName: "", email: "" });
    toast.success("Customer created successfully.");
  };

  const handleOpenEdit = (customer: UserProfile) => {
    setEditCustomer(customer);
    setEditForm({ displayName: customer.displayName, email: customer.email });
  };

  const handleSaveEdit = () => {
    if (!editCustomer) return;
    if (!editForm.displayName.trim() || !editForm.email.trim()) {
      toast.error("Please provide both name and email.");
      return;
    }
    adminUpdateCustomer(editCustomer.uid, {
      displayName: editForm.displayName.trim(),
      email: editForm.email.trim(),
    });
    loadData();
    setEditCustomer(null);
    toast.success("Customer updated successfully.");
  };

  const handleDelete = (uid: string) => {
    adminDeleteCustomer(uid);
    loadData();
    setDeleteConfirm(null);
    if (selectedCustomer?.uid === uid) {
      setSelectedCustomer(null);
    }
    toast.success("Customer permanently deleted.");
  };

  const toggleStatus = (uid: string) => {
    adminToggleCustomerStatus(uid);
    loadData();
    toast.success("Customer account access status updated.");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              Customer Accounts
            </h1>
            <Badge className="bg-zinc-100 text-zinc-700 border-zinc-200 font-bold px-2 py-0.5 text-xs">
              {customers.length} Members
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500">
            View registered user profiles, order purchase histories, and manage authentication privileges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            className="rounded-xl border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 h-10 px-3 text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl h-10 px-4 font-semibold text-xs sm:text-sm shadow-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by name, email, or UID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 rounded-xl h-10 text-xs sm:text-sm"
          />
        </div>
        <span className="text-xs text-zinc-500 self-start sm:self-auto font-medium">
          Showing {filtered.length} matching customers
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Email Address</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Joined Date</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginated.map((customer) => (
                <tr key={customer.uid} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-2xs">
                        {customer.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-xs sm:text-sm">
                          {customer.displayName}
                        </p>
                        <p className="text-[11px] text-zinc-400 md:hidden">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-zinc-600 font-medium">
                    {customer.email}
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-zinc-500 text-xs">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={customer.isDisabled ? "inactive" : "active"} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 text-xs h-8 px-2.5 rounded-lg font-semibold"
                        onClick={() => viewCustomer(customer)}
                      >
                        <Users className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                        title="Edit Customer"
                        onClick={() => handleOpenEdit(customer)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-lg ${
                          customer.isDisabled
                            ? "text-emerald-600 hover:bg-emerald-50"
                            : "text-zinc-400 hover:text-amber-600 hover:bg-amber-50"
                        }`}
                        title={customer.isDisabled ? "Enable Customer Account" : "Disable Customer Account"}
                        onClick={() => toggleStatus(customer.uid)}
                      >
                        {customer.isDisabled ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          <ShieldOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete Customer"
                        onClick={() => setDeleteConfirm(customer.uid)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 px-4">
                    <div className="max-w-sm mx-auto flex flex-col items-center">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                        <Users className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 mb-1">No customers found</h4>
                      <p className="text-xs text-zinc-500">
                        No customers match your search criteria.
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
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} customers
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

      {/* Customer Profile View Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="w-[96vw] max-w-2xl max-h-[92vh] overflow-y-auto bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight text-zinc-900">
              Customer Profile: {selectedCustomer?.displayName}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Member ID: {selectedCustomer?.uid}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                <div className="w-12 h-12 rounded-full bg-zinc-900 text-white text-base font-black flex items-center justify-center">
                  {selectedCustomer.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-900">{selectedCustomer.displayName}</h4>
                  <p className="text-xs text-zinc-500">{selectedCustomer.email}</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Account created: {formatDate(selectedCustomer.createdAt)}
                  </p>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={selectedCustomer.isDisabled ? "inactive" : "active"} />
                </div>
              </div>

              {/* Order History */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 mb-2">
                  Order History ({customerOrders.length})
                </h4>
                <div className="space-y-2">
                  {customerOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-zinc-900">#{order.id}</span>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {formatDate(order.createdAt)} • {order.items.length} items
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.fulfillmentStatus} />
                        <span className="font-bold text-zinc-900">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  ))}
                  {customerOrders.length === 0 && (
                    <p className="text-xs text-zinc-400 italic py-2">No purchase history yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-900">Add New Customer</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Create a customer profile to manage addresses and orders.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Full Name *</label>
              <Input
                placeholder="e.g. Jordan Miller"
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                className="bg-zinc-50 border-zinc-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Email Address *</label>
              <Input
                type="email"
                placeholder="e.g. jordan@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="bg-zinc-50 border-zinc-200 rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCustomer}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-xs h-10 shadow-xs"
              >
                Create Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-900">Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Full Name</label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="bg-zinc-50 border-zinc-200 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 mb-1.5 block">Email Address</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-zinc-50 border-zinc-200 rounded-xl"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditCustomer(null)}
                className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-semibold text-xs h-10 shadow-xs"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-md bg-white border-zinc-200 text-zinc-900 rounded-2xl p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-zinc-900">Delete Customer?</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 mt-1">
              Are you sure you want to permanently delete this customer profile? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 rounded-xl border-zinc-200 font-semibold text-xs h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs h-10 shadow-xs"
            >
              Delete Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

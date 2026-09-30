"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  const loadData = () => {
    setCustomers(adminGetCustomers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.uid.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const viewCustomer = (customer: UserProfile) => {
    setSelectedCustomer(customer);
    const allOrders = adminGetOrders();
    setCustomerOrders(allOrders.filter((o) => o.userId === customer.uid || o.customer.email.toLowerCase() === customer.email.toLowerCase()));
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
    toast.success("Customer created successfully");
  };

  const handleOpenEdit = (customer: UserProfile) => {
    setEditCustomer(customer);
    setEditForm({ displayName: customer.displayName, email: customer.email });
  };

  const handleUpdateCustomer = () => {
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
    if (selectedCustomer?.uid === editCustomer.uid) {
      setSelectedCustomer((prev) =>
        prev
          ? {
              ...prev,
              displayName: editForm.displayName.trim(),
              email: editForm.email.trim(),
            }
          : null
      );
    }
    setEditCustomer(null);
    toast.success("Customer updated successfully");
  };

  const handleDeleteCustomer = (uid: string) => {
    adminDeleteCustomer(uid);
    loadData();
    if (selectedCustomer?.uid === uid) {
      setSelectedCustomer(null);
    }
    setDeleteConfirm(null);
    toast.success("Customer removed successfully");
  };

  const toggleStatus = (uid: string) => {
    adminToggleCustomerStatus(uid);
    loadData();
    toast.success("Customer status updated");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Customers</h1>
          <p className="text-sm text-zinc-500">{customers.length} registered customers</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold text-sm self-start sm:self-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search customers by name, email, or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 rounded-xl h-10 max-w-md"
        />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden md:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 hidden lg:table-cell">Joined</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-zinc-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((customer) => (
                <tr key={customer.uid} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 text-white text-xs font-bold flex items-center justify-center">
                        {customer.displayName?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <p className="text-xs font-semibold text-white">{customer.displayName}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-zinc-400">{customer.email}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-[10px] text-zinc-500">{formatDate(customer.createdAt)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={`text-[10px] font-semibold ${
                        customer.isDisabled
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {customer.isDisabled ? "Disabled" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white text-xs h-7 rounded-lg"
                        onClick={() => viewCustomer(customer)}
                      >
                        <Users className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-400 hover:text-white"
                        title="Edit Customer"
                        onClick={() => handleOpenEdit(customer)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-500 hover:text-amber-400"
                        title={customer.isDisabled ? "Enable Customer" : "Disable Customer"}
                        onClick={() => toggleStatus(customer.uid)}
                      >
                        {customer.isDisabled ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-zinc-500 hover:text-red-400"
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
                  <td colSpan={5} className="text-center py-12 text-zinc-500 text-sm">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
            <p className="text-xs text-zinc-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Customer Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Full Name *</label>
              <Input
                value={createForm.displayName}
                onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                placeholder="John Doe"
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Email Address *</label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="john@example.com"
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
              />
            </div>
            <Button
              onClick={handleCreateCustomer}
              className="w-full bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold"
            >
              <Save className="h-4 w-4 mr-2" /> Create Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={() => setEditCustomer(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Full Name *</label>
              <Input
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Email Address *</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white rounded-xl"
              />
            </div>
            <Button
              onClick={handleUpdateCustomer}
              className="w-full bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl h-10 font-semibold"
            >
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Profile Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-lg bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-zinc-800 text-white text-xl font-bold flex items-center justify-center">
                  {selectedCustomer.displayName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedCustomer.displayName}</p>
                  <p className="text-xs text-zinc-400">{selectedCustomer.email}</p>
                  <p className="text-[10px] text-zinc-500">Joined {formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </div>
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                  <ShoppingCart className="h-3 w-3" /> Order History ({customerOrders.length})
                </h3>
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-zinc-500">No orders yet</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-medium text-white">{order.id}</p>
                          <p className="text-[10px] text-zinc-500">{formatDate(order.createdAt)}</p>
                        </div>
                        <span className="text-xs font-bold text-white">{formatPrice(order.total)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-zinc-400 mb-2">Addresses</h3>
                  {selectedCustomer.addresses.map((addr) => (
                    <p key={addr.id} className="text-xs text-zinc-300">
                      {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete this customer? This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-zinc-700 text-zinc-300 rounded-xl"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl"
              onClick={() => deleteConfirm && handleDeleteCustomer(deleteConfirm)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

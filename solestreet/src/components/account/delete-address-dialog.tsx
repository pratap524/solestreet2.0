"use client";

import * as React from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Address } from "@/types";

interface DeleteAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address: Address | null;
  onConfirm: () => Promise<void>;
}

export function DeleteAddressDialog({
  isOpen,
  onClose,
  address,
  onConfirm,
}: DeleteAddressDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!address) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-zinc-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100/80 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-base font-black text-zinc-950">
              Delete Saved Address?
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 leading-relaxed">
              Are you sure you want to remove{" "}
              <strong className="text-zinc-800">{address.street}</strong> from your saved shipping
              addresses? This action cannot be undone.
            </DialogDescription>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl h-10 px-4 text-xs font-bold border-zinc-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-xl h-10 px-5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Yes, Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

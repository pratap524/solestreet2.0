"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";
import { getUserWishlist, toggleWishlistInDb } from "@/lib/firebase/firestore";
import { toast } from "sonner";

interface WishlistContextType {
  wishlist: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_GUEST_WISHLIST = "solestreet_guest_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    async function loadWishlist() {
      if (user) {
        const remoteList = await getUserWishlist(user.uid);
        setWishlist(remoteList);
      } else {
        const stored = localStorage.getItem(LOCAL_STORAGE_GUEST_WISHLIST);
        if (stored) {
          try {
            setWishlist(JSON.parse(stored));
          } catch {
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      }
    }
    loadWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const toggleWishlist = async (productId: string, productName?: string) => {
    const isAdding = !wishlist.includes(productId);

    if (user) {
      const updated = await toggleWishlistInDb(user.uid, productId);
      setWishlist(updated);
    } else {
      const updated = isAdding
        ? [...wishlist, productId]
        : wishlist.filter((id) => id !== productId);
      setWishlist(updated);
      localStorage.setItem(LOCAL_STORAGE_GUEST_WISHLIST, JSON.stringify(updated));
    }

    if (isAdding) {
      toast.success(productName ? `Added ${productName} to wishlist` : "Added to wishlist");
    } else {
      toast.info(productName ? `Removed ${productName} from wishlist` : "Removed from wishlist");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        count: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

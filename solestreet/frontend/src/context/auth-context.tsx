"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/client";
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  sendResetPassword,
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  updateUserAddress,
} from "@/lib/firebase/auth";
import type { UserProfile, Address } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogleProvider: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => Promise<Address>;
  updateAddress: (addressId: string, address: Partial<Omit<Address, "id">>) => Promise<Address | null>;
  removeAddress: (addressId: string) => Promise<void>;
  setAsDefaultAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function syncAuthCookie(role: string | null) {
  if (typeof document === "undefined") return;
  if (role) {
    document.cookie = `solestreet_role=${role}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = "solestreet_role=; path=/; max-age=0; SameSite=Lax";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize authentication cookie for edge middleware security
  useEffect(() => {
    if (user) {
      syncAuthCookie(user.role);
    } else {
      syncAuthCookie(null);
    }
  }, [user]);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      try {
        const stored = localStorage.getItem("solestreet_mock_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          syncAuthCookie(parsed.role || null);
        } else {
          syncAuthCookie(null);
        }
      } catch {
        setUser(null);
        syncAuthCookie(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        setUser(profile);
        syncAuthCookie(profile?.role || null);
      } else {
        setUser(null);
        syncAuthCookie(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const profile = await signInWithEmail(email, pass);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      const profile = await signUpWithEmail(email, pass, name);
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogleProvider = async () => {
    setIsLoading(true);
    try {
      const profile = await signInWithGoogle();
      setUser(profile);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await signOutUser();
    syncAuthCookie(null);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("solestreet_mock_user");
      } catch {
        // ignore
      }
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendResetPassword(email);
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    await updateUserProfile(user.uid, data);
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  const addAddress = async (address: Omit<Address, "id">) => {
    if (!user) throw new Error("Must be logged in to save address");
    const newAddr = await addUserAddress(user.uid, address);
    setUser((prev) => {
      if (!prev) return null;
      const current = prev.addresses || [];
      const updated: Address[] = newAddr.isDefault
        ? [...current.map((a) => ({ ...a, isDefault: false })), newAddr]
        : [...current, newAddr];
      return { ...prev, addresses: updated };
    });
    return newAddr;
  };

  const updateAddress = async (
    addressId: string,
    address: Partial<Omit<Address, "id">>
  ) => {
    if (!user) throw new Error("Must be logged in to update address");
    const updated = await updateUserAddress(user.uid, addressId, address);
    if (updated) {
      setUser((prev) => {
        if (!prev) return null;
        const current = prev.addresses || [];
        const nextList = current.map((a) => {
          if (a.id === addressId) {
            return updated;
          }
          if (updated.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });
        return { ...prev, addresses: nextList };
      });
    }
    return updated;
  };

  const removeAddress = async (addressId: string) => {
    if (!user) return;
    await deleteUserAddress(user.uid, addressId);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        addresses: prev.addresses.filter((a) => a.id !== addressId),
      };
    });
  };

  const setAsDefaultAddress = async (addressId: string) => {
    if (!user) return;
    await setDefaultUserAddress(user.uid, addressId);
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        addresses: prev.addresses.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        })),
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        signIn,
        signUp,
        signInWithGoogleProvider,
        signOut,
        resetPassword,
        updateUser,
        addAddress,
        updateAddress,
        removeAddress,
        setAsDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, ShoeSize, ShippingMethod } from "@/types";
import {
  SHIPPING_METHODS,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
} from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { validateCoupon } from "@/lib/firebase/firestore";
import { toast } from "sonner";

// ─── State ───────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; size: ShoeSize; color: string } }
  | {
      type: "UPDATE_QUANTITY";
      payload: { productId: string; size: ShoeSize; color: string; quantity: number };
    }
  | { type: "CLEAR_CART" }
  | { type: "SET_OPEN"; payload: boolean }
  | { type: "LOAD_CART"; payload: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );

      if (existingIndex >= 0) {
        const updated = [...state.items];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updated };
      }

      return { ...state, items: [...state.items, action.payload] };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.size === action.payload.size &&
              item.color === action.payload.color
            )
        ),
      };

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (item) =>
              !(
                item.productId === action.payload.productId &&
                item.size === action.payload.size &&
                item.color === action.payload.color
              )
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size &&
          item.color === action.payload.color
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART":
      return { ...state, items: [] };

    case "SET_OPEN":
      return { ...state, isOpen: action.payload };

    case "LOAD_CART":
      return { ...state, items: action.payload };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  couponCode: string | null;
  selectedShippingMethod: ShippingMethod;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: ShoeSize, color: string) => void;
  updateQuantity: (
    productId: string,
    size: ShoeSize,
    color: string,
    quantity: number
  ) => void;
  clearCart: () => void;
  setIsOpen: (open: boolean) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  setShippingMethod: (method: ShippingMethod) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod>(
    SHIPPING_METHODS[0]
  );

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("solestreet-cart");
      if (saved) {
        const items = JSON.parse(saved) as CartItem[];
        dispatch({ type: "LOAD_CART", payload: items });
      }

      const savedCoupon = localStorage.getItem("solestreet-coupon");
      if (savedCoupon) {
        setCouponCode(savedCoupon);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("solestreet-cart", JSON.stringify(state.items));
    } catch {
      // Ignore storage errors
    }
  }, [state.items]);

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  }, []);

  const removeItem = useCallback(
    (productId: string, size: ShoeSize, color: string) => {
      dispatch({ type: "REMOVE_ITEM", payload: { productId, size, color } });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, size: ShoeSize, color: string, quantity: number) => {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { productId, size, color, quantity },
      });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    setCouponCode(null);
    setDiscount(0);
    localStorage.removeItem("solestreet-coupon");
  }, []);

  const setIsOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_OPEN", payload: open });
  }, []);

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Calculate dynamic coupon discount
  useEffect(() => {
    async function revalidateCoupon() {
      if (!couponCode) {
        setDiscount(0);
        return;
      }
      const res = await validateCoupon(couponCode, subtotal);
      if (res.valid) {
        setDiscount(res.discountAmount);
      } else {
        setDiscount(0);
        setCouponCode(null);
        localStorage.removeItem("solestreet-coupon");
      }
    }
    revalidateCoupon();
  }, [couponCode, subtotal]);

  const applyCoupon = useCallback(
    async (code: string): Promise<boolean> => {
      const res = await validateCoupon(code, subtotal);
      if (res.valid) {
        setCouponCode(code.toUpperCase());
        setDiscount(res.discountAmount);
        localStorage.setItem("solestreet-coupon", code.toUpperCase());
        toast.success(`Coupon ${code.toUpperCase()} applied (-${formatPrice(res.discountAmount)})`);
        return true;
      } else {
        toast.error(res.message || "Invalid coupon code");
        return false;
      }
    },
    [subtotal]
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setDiscount(0);
    localStorage.removeItem("solestreet-coupon");
    toast.info("Coupon removed");
  }, []);

  const setShippingMethod = useCallback((method: ShippingMethod) => {
    setSelectedShippingMethod(method);
  }, []);

  // Shipping calculation
  const isFreeStandard = subtotal >= FREE_SHIPPING_THRESHOLD && selectedShippingMethod.id === "standard";
  const shipping = isFreeStandard ? 0 : selectedShippingMethod.price;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * TAX_RATE;
  const total = Math.max(0, taxableAmount + shipping + tax);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        itemCount,
        subtotal,
        shipping,
        tax,
        discount,
        couponCode,
        selectedShippingMethod,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setIsOpen,
        applyCoupon,
        removeCoupon,
        setShippingMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { dispatchCart, getCartServerSnapshot, getCartSnapshot, subscribeCart } from "@/lib/cart-storage";
import type { CartLine } from "@/lib/cart";
import { cartTotal } from "@/lib/order";
import { getProduct, type FilterId } from "@/lib/products";

type BoutiqueContextValue = {
  lines: CartLine[];
  buyerName: string;
  city: string;
  count: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: { productId: string; size: string; color: string }) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  updateVariant: (lineId: string, size: string, color: string) => void;
  setDetails: (details: { buyerName?: string; city?: string }) => void;
  filter: FilterId;
  setFilter: (filter: FilterId) => void;
  notice: string;
};

const BoutiqueContext = createContext<BoutiqueContextValue | null>(null);

export function BoutiqueProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  const [isCartOpen, setCartOpen] = useState(false);
  const [filter, setFilter] = useState<FilterId>("tout");
  const [notice, setNotice] = useState("");
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const value = useMemo<BoutiqueContextValue>(() => {
    const count = state.lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      lines: state.lines,
      buyerName: state.buyerName,
      city: state.city,
      count,
      total: cartTotal(state.lines),
      isCartOpen,
      openCart,
      closeCart,
      addItem: ({ productId, size, color }) => {
        const product = getProduct(productId);
        if (!product) return;
        dispatchCart({ type: "add", productId, size, color });
        setNotice(`${product.name} ajouté au panier.`);
        setCartOpen(true);
      },
      setQuantity: (lineId, quantity) => dispatchCart({ type: "setQuantity", lineId, quantity }),
      removeItem: (lineId) => dispatchCart({ type: "remove", lineId }),
      updateVariant: (lineId, size, color) => dispatchCart({ type: "updateVariant", lineId, size, color }),
      setDetails: (details) => dispatchCart({ type: "setDetails", ...details }),
      filter,
      setFilter,
      notice,
    };
  }, [state, isCartOpen, filter, notice, openCart, closeCart]);

  return (
    <BoutiqueContext.Provider value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite">
        {notice}
      </p>
    </BoutiqueContext.Provider>
  );
}

export function useBoutique() {
  const value = useContext(BoutiqueContext);
  if (!value) {
    throw new Error("useBoutique doit être utilisé dans BoutiqueProvider.");
  }
  return value;
}

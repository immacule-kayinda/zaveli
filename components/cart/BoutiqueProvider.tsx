"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { bindCartCatalog, dispatchCart, getCartServerSnapshot, getCartSnapshot, reloadCartWithCatalog, subscribeCart } from "@/lib/cart-storage";
import type { CartLine } from "@/lib/cart";
import { cartTotal } from "@/lib/order";
import type { Product } from "@/lib/types";

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
  notice: string;
  catalog: Product[];
};

const BoutiqueContext = createContext<BoutiqueContextValue | null>(null);

export function BoutiqueProvider({ catalog, children }: { catalog: Product[]; children: ReactNode }) {
  if (typeof window !== "undefined") bindCartCatalog(catalog);
  const state = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  useEffect(() => {
    reloadCartWithCatalog(catalog);
  }, [catalog]);
  const [isCartOpen, setCartOpen] = useState(false);
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
      total: cartTotal(state.lines, catalog),
      isCartOpen,
      openCart,
      closeCart,
      addItem: ({ productId, size, color }) => {
        const product = catalog.find((item) => item.id === productId);
        if (!product) return;
        dispatchCart({ type: "add", productId, size, color });
        setNotice(`${product.name} ajouté au panier.`);
        setCartOpen(true);
      },
      setQuantity: (lineId, quantity) => dispatchCart({ type: "setQuantity", lineId, quantity }),
      removeItem: (lineId) => dispatchCart({ type: "remove", lineId }),
      updateVariant: (lineId, size, color) => dispatchCart({ type: "updateVariant", lineId, size, color }),
      setDetails: (details) => dispatchCart({ type: "setDetails", ...details }),
      notice,
      catalog,
    };
  }, [state, isCartOpen, notice, openCart, closeCart, catalog]);

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

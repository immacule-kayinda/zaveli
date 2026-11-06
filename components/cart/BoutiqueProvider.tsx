"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { placeOrder } from "@/app/actions/order";
import { bindCartCatalog, dispatchCart, getCartServerSnapshot, getCartSnapshot, reloadCartWithCatalog, subscribeCart } from "@/lib/cart-storage";
import type { CartLine } from "@/lib/cart";
import { cartTotal } from "@/lib/order";
import { toOrderLine } from "@/lib/order";
import type { Settings } from "@/lib/settings";
import type { Product } from "@/lib/types";
import { buildOrderMessage, whatsAppUrl } from "@/lib/whatsapp";

export type CheckoutItem = { productId: string; size: string; color: string; quantity: number };

type BoutiqueContextValue = {
  lines: CartLine[];
  buyerName: string;
  city: string;
  phone: string;
  count: number;
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: { productId: string; size: string; color: string }) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  updateVariant: (lineId: string, size: string, color: string) => void;
  setDetails: (details: { buyerName?: string; city?: string; phone?: string }) => void;
  notice: string;
  catalog: Product[];
  settings: Settings;
  checkout: (items: CheckoutItem[], options?: { clearCart?: boolean }) => Promise<void>;
  checkingOut: boolean;
  checkoutError: string;
  lastOrderId: string;
};

const BoutiqueContext = createContext<BoutiqueContextValue | null>(null);

export function BoutiqueProvider({
  catalog,
  settings,
  children,
}: {
  catalog: Product[];
  settings: Settings;
  children: ReactNode;
}) {
  if (typeof window !== "undefined") bindCartCatalog(catalog);
  const state = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  useEffect(() => {
    reloadCartWithCatalog(catalog);
  }, [catalog]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [lastOrderId, setLastOrderId] = useState("");
  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);

  const { buyerName, city, phone } = state;
  const checkout = useCallback(
    async (items: CheckoutItem[], options?: { clearCart?: boolean }) => {
      if (!settings.ordersOpen || items.length === 0) return;
      setCheckingOut(true);
      setCheckoutError("");
      // La fenêtre s'ouvre tout de suite, pendant le clic : les navigateurs mobiles bloquent celle qu'on ouvre après une attente.
      const popup = window.open("", "_blank");
      let orderId = "";
      try {
        const result = await placeOrder({ lines: items, buyerName, phone, city });
        if (!result.ok) {
          popup?.close();
          setCheckoutError(result.error);
          return;
        }
        orderId = result.id;
      } catch {
        // Hors connexion ou serveur occupé : la cliente peut quand même écrire sur WhatsApp, la vente ne se perd pas.
      } finally {
        setCheckingOut(false);
      }

      const orderLines = items.flatMap((item) => {
        const product = catalog.find((entry) => entry.id === item.productId);
        return product ? [toOrderLine(product, item.size, item.color, item.quantity)] : [];
      });
      const url = whatsAppUrl(buildOrderMessage(orderLines, { buyerName, city, phone, orderId }), settings.whatsappNumber);
      if (popup && !popup.closed) {
        popup.opener = null;
        popup.location.href = url;
      } else {
        window.location.assign(url);
      }
      if (orderId) setLastOrderId(orderId);
      if (options?.clearCart) dispatchCart({ type: "clear" });
    },
    [settings, catalog, buyerName, phone, city],
  );

  const value = useMemo<BoutiqueContextValue>(() => {
    const count = state.lines.reduce((sum, line) => sum + line.quantity, 0);
    return {
      lines: state.lines,
      buyerName: state.buyerName,
      city: state.city,
      phone: state.phone,
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
      settings,
      checkout,
      checkingOut,
      checkoutError,
      lastOrderId,
    };
  }, [state, isCartOpen, notice, openCart, closeCart, catalog, settings, checkout, checkingOut, checkoutError, lastOrderId]);

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

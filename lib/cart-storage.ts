import { cartReducer, emptyCart, parseStoredCart, type CartAction, type CartState } from "@/lib/cart";
import { products } from "@/lib/products";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "zaveli-cart-v1";

const listeners = new Set<() => void>();
let snapshot: CartState = emptyCart;
let loaded = false;
let activeCatalog: Product[] = products;

export function bindCartCatalog(catalog: Product[]) {
  activeCatalog = catalog;
}

function readFromStorage(): CartState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? parseStoredCart(raw, activeCatalog) : emptyCart;
}

export function reloadCartWithCatalog(catalog: Product[]) {
  activeCatalog = catalog;
  if (!loaded || typeof window === "undefined") return;
  snapshot = readFromStorage();
  listeners.forEach((listener) => listener());
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    const stored = readFromStorage();
    if (stored !== snapshot) snapshot = stored;
  }
  return () => listeners.delete(listener);
}

export function getCartSnapshot(): CartState {
  return snapshot;
}

export function getCartServerSnapshot(): CartState {
  return emptyCart;
}

export function dispatchCart(action: CartAction) {
  const current = getCartSnapshot();
  const next = cartReducer(current, action);
  if (next === current) return;
  snapshot = next;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

import type { Product } from "@/lib/types";

export const MAX_QUANTITY = 8;

export type CartLine = {
  lineId: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
  buyerName: string;
  city: string;
};

export const emptyCart: CartState = {
  lines: [],
  buyerName: "",
  city: "",
};

export function cartLineId(productId: string, size: string, color: string): string {
  return `${productId}::${size}::${color}`;
}

export type CartAction =
  | { type: "hydrate"; state: CartState }
  | { type: "add"; productId: string; size: string; color: string }
  | { type: "setQuantity"; lineId: string; quantity: number }
  | { type: "remove"; lineId: string }
  | { type: "updateVariant"; lineId: string; size: string; color: string }
  | { type: "setDetails"; buyerName?: string; city?: string };

function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "add": {
      const lineId = cartLineId(action.productId, action.size, action.color);
      const existing = state.lines.find((line) => line.lineId === lineId);
      if (existing) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.lineId === lineId
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + 1) }
              : line,
          ),
        };
      }
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            lineId,
            productId: action.productId,
            size: action.size,
            color: action.color,
            quantity: 1,
          },
        ],
      };
    }
    case "setQuantity":
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.lineId === action.lineId ? { ...line, quantity: clampQuantity(action.quantity) } : line,
        ),
      };
    case "remove":
      return {
        ...state,
        lines: state.lines.filter((line) => line.lineId !== action.lineId),
      };
    case "updateVariant": {
      const current = state.lines.find((line) => line.lineId === action.lineId);
      if (!current) return state;
      const nextId = cartLineId(current.productId, action.size, action.color);
      if (nextId === current.lineId) return state;

      const conflict = state.lines.find((line) => line.lineId === nextId);
      if (!conflict) {
        return {
          ...state,
          lines: state.lines.map((line) =>
            line.lineId === action.lineId
              ? { ...line, lineId: nextId, size: action.size, color: action.color }
              : line,
          ),
        };
      }

      const merged = Math.min(MAX_QUANTITY, conflict.quantity + current.quantity);
      return {
        ...state,
        lines: state.lines
          .filter((line) => line.lineId !== action.lineId)
          .map((line) => (line.lineId === nextId ? { ...line, quantity: merged } : line)),
      };
    }
    case "setDetails":
      return {
        ...state,
        buyerName: action.buyerName ?? state.buyerName,
        city: action.city ?? state.city,
      };
    default:
      return state;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function sanitizeCart(raw: unknown, catalog: Product[]): CartState {
  if (!isRecord(raw) || !Array.isArray(raw.lines)) return emptyCart;

  const lines: CartLine[] = [];

  for (const entry of raw.lines) {
    if (!isRecord(entry)) continue;
    const product = catalog.find((item) => item.id === entry.productId);
    if (!product) continue;
    if (typeof entry.size !== "string" || !product.sizes.includes(entry.size)) continue;
    if (typeof entry.color !== "string" || !product.colors.some((color) => color.name === entry.color)) {
      continue;
    }
    const quantity = typeof entry.quantity === "number" ? entry.quantity : Number.NaN;
    if (!Number.isInteger(quantity) || quantity < 1) continue;

    const lineId = cartLineId(product.id, entry.size, entry.color);
    const existing = lines.find((line) => line.lineId === lineId);
    if (existing) {
      existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + quantity);
      continue;
    }
    lines.push({
      lineId,
      productId: product.id,
      size: entry.size,
      color: entry.color,
      quantity: Math.min(MAX_QUANTITY, quantity),
    });
  }

  const clip = (value: unknown) => (typeof value === "string" ? value.slice(0, 80) : "");

  return {
    lines,
    buyerName: clip(raw.buyerName),
    city: clip(raw.city),
  };
}

export function parseStoredCart(raw: string, catalog: Product[]): CartState {
  try {
    return sanitizeCart(JSON.parse(raw) as unknown, catalog);
  } catch {
    return emptyCart;
  }
}

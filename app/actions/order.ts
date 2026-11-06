"use server";

import { getCatalog } from "@/lib/catalog";
import { buildOrder, newOrderId, type OrderInput } from "@/lib/orders";
import { storeOrder } from "@/lib/orders-db";
import { getSettings } from "@/lib/settings";

export type PlaceOrderResult = { ok: true; id: string } | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Les données viennent du navigateur : on les relit champ par champ, et les prix viennent toujours du catalogue. */
function readInput(value: unknown): OrderInput | null {
  if (!isRecord(value) || !Array.isArray(value.lines)) return null;
  const lines: OrderInput["lines"] = [];
  for (const entry of value.lines.slice(0, 50)) {
    if (!isRecord(entry)) return null;
    lines.push({
      productId: typeof entry.productId === "string" ? entry.productId : "",
      size: typeof entry.size === "string" ? entry.size : "",
      color: typeof entry.color === "string" ? entry.color : "",
      quantity: typeof entry.quantity === "number" ? entry.quantity : Number.NaN,
    });
  }
  const str = (field: unknown) => (typeof field === "string" ? field : "");
  return {
    lines,
    buyerName: str(value.buyerName),
    phone: str(value.phone),
    city: str(value.city),
    address: str(value.address),
    note: str(value.note),
  };
}

export async function placeOrder(value: unknown): Promise<PlaceOrderResult> {
  const input = readInput(value);
  if (!input) return { ok: false, error: "La commande n'a pas pu être lue." };

  const settings = await getSettings();
  if (!settings.ordersOpen) {
    return { ok: false, error: "La boutique ne prend pas de commande pour le moment." };
  }

  const built = buildOrder(input, await getCatalog(), { id: newOrderId(), now: Date.now(), source: "site" });
  if (!built.ok) return built;

  try {
    await storeOrder(built.order);
  } catch {
    return { ok: false, error: "La commande n'a pas pu être enregistrée." };
  }
  return { ok: true, id: built.order.id };
}

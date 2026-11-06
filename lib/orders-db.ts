import { connection } from "next/server";

import { getDoc, listDocs, putDoc, removeDoc } from "@/lib/doc-store";
import { computeStats, ORDER_ID_PATTERN, parseOrder, sortNewestFirst, type Order, type Stats } from "@/lib/orders";

const COLLECTION = "orders";

export async function listOrders(): Promise<Order[]> {
  await connection();
  const orders: Order[] = [];
  for (const doc of await listDocs(COLLECTION)) {
    try {
      const order = parseOrder(JSON.parse(doc.raw) as unknown);
      if (order) orders.push(order);
    } catch {
      // Un fichier illisible ne doit pas masquer les autres commandes.
    }
  }
  return sortNewestFirst(orders);
}

export async function findOrder(id: string): Promise<Order | null> {
  await connection();
  if (!ORDER_ID_PATTERN.test(id)) return null;
  const raw = await getDoc(COLLECTION, id);
  if (!raw) return null;
  try {
    return parseOrder(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export async function storeOrder(order: Order): Promise<void> {
  await putDoc(COLLECTION, order.id, JSON.stringify(order));
}

export async function eraseOrder(id: string): Promise<void> {
  if (!ORDER_ID_PATTERN.test(id)) return;
  await removeDoc(COLLECTION, id);
}

export async function loadDashboard(): Promise<{ orders: Order[]; stats: Stats }> {
  const orders = await listOrders();
  return { orders, stats: computeStats(orders, Date.now()) };
}

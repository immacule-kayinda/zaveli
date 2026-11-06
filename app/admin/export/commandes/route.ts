import { readAdminSession } from "@/lib/admin-cookie";
import { ordersToCsv } from "@/lib/orders";
import { listOrders } from "@/lib/orders-db";

export async function GET(): Promise<Response> {
  if (!(await readAdminSession())) return new Response("Non autorisé", { status: 401 });
  const csv = `﻿${ordersToCsv(await listOrders())}`;
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="commandes-${day}.csv"`,
      "cache-control": "no-store",
    },
  });
}

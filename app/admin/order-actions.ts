"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/app/admin/actions";
import { readAdminSession } from "@/lib/admin-cookie";
import { getCatalog } from "@/lib/catalog";
import { buildOrder, changeStatus, isStatus, newOrderId, normalizePhone, phoneLooksValid } from "@/lib/orders";
import { eraseOrder, findOrder, storeOrder } from "@/lib/orders-db";
import { validateSettings, writeSettings } from "@/lib/settings";

async function requireAdmin(): Promise<void> {
  if (!(await readAdminSession())) redirect("/admin/connexion");
}

function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

/** Commande reçue hors du site (appel, message WhatsApp direct) et saisie à la main. */
export async function createManualOrder(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const ids = formData.getAll("productId");
  const sizes = formData.getAll("size");
  const colors = formData.getAll("color");
  const quantities = formData.getAll("quantity");
  const lines = ids
    .map((productId, index) => ({
      productId: String(productId),
      size: String(sizes[index] ?? ""),
      color: String(colors[index] ?? ""),
      quantity: Number(quantities[index] ?? 1),
    }))
    .filter((line) => line.productId !== "");

  const built = buildOrder(
    {
      lines,
      buyerName: field(formData, "buyerName"),
      phone: field(formData, "phone"),
      city: field(formData, "city"),
      address: field(formData, "address"),
      note: field(formData, "note"),
    },
    await getCatalog(),
    { id: newOrderId(), now: Date.now(), source: "manuelle" },
  );
  if (!built.ok) return { error: built.error };

  const status = field(formData, "status");
  const order = isStatus(status) ? changeStatus(built.order, status, built.order.createdAt) : built.order;
  await storeOrder(order);
  redirect(`/admin/commandes/${order.id}`);
}

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = field(formData, "id");
  const status = field(formData, "status");
  const order = await findOrder(id);
  if (!order) redirect("/admin/commandes");
  if (isStatus(status)) await storeOrder(changeStatus(order, status, Date.now()));
  redirect(`/admin/commandes/${id}`);
}

export async function saveOrderDetails(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const order = await findOrder(field(formData, "id"));
  if (!order) return { error: "Cette commande n'existe plus." };

  const rawPhone = field(formData, "phone").trim();
  const phone = rawPhone ? normalizePhone(rawPhone) : "";
  if (rawPhone && !phoneLooksValid(phone)) return { error: "Le numéro de téléphone n'a pas l'air complet." };

  const clean = (name: string, max: number) => field(formData, name).replace(/[ \t]+/g, " ").trim().slice(0, max);
  await storeOrder({
    ...order,
    updatedAt: Date.now(),
    buyerName: clean("buyerName", 60),
    phone,
    city: clean("city", 80),
    address: clean("address", 200),
    internalNote: field(formData, "internalNote").trim().slice(0, 1000),
  });
  redirect(`/admin/commandes/${order.id}`);
}

export async function deleteOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  await eraseOrder(field(formData, "id"));
  redirect("/admin/commandes");
}

export async function saveSettings(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = validateSettings({
    whatsappNumber: field(formData, "whatsappNumber"),
    announcement: field(formData, "announcement"),
    deliveryNote: field(formData, "deliveryNote"),
    ordersOpen: formData.get("ordersOpen") === "on",
  });
  if (!parsed.ok) return { error: parsed.error };
  await writeSettings(parsed.settings);
  redirect("/admin/reglages?enregistre=1");
}

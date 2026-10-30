"use server";

import { redirect } from "next/navigation";

import { clearAdminSession, readAdminSession, writeAdminSession } from "@/lib/admin-cookie";
import { adminConfig, credentialsMatch } from "@/lib/admin-session";
import { discardImage, readCatalogFresh, saveCatalog, storePieceImage, toProduct, type PieceDraft } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export type FormState = { error: string };

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  if (!adminConfig().configured) {
    return { error: "Le compte admin n'est pas configuré." };
  }
  const user = String(formData.get("user") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!credentialsMatch(user, password)) {
    return { error: "Identifiants incorrects." };
  }
  await writeAdminSession(adminConfig().user);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/connexion");
}

export async function savePiece(_state: FormState, formData: FormData): Promise<FormState> {
  if (!(await readAdminSession())) redirect("/admin/connexion");

  const catalog = await catalogForWrite();
  if (!catalog) return { error: "Le catalogue n'a pas pu être lu. Réessayez avant d'enregistrer." };
  const editing = String(formData.get("editing") ?? "");
  const currentImage = String(formData.get("currentImage") ?? "");
  const file = formData.get("image");
  let image = currentImage;

  if (file instanceof File && file.size > 0) {
    const stored = await storePieceImage(file, slugSource(formData));
    if (!stored.ok) return { error: stored.error };
    image = stored.url;
  }

  const draft = draftFromForm(formData, image);
  const parsed = toProduct(draft);
  if (!parsed.ok) return { error: parsed.error };

  const exists = catalog.some((product) => product.id === parsed.product.id);
  if (editing) {
    if (!catalog.some((product) => product.id === editing)) {
      return { error: "Cette pièce n'est plus dans la collection." };
    }
    if (parsed.product.id !== editing) {
      return { error: "L'adresse d'une pièce déjà publiée ne change pas." };
    }
  } else if (exists) {
    return { error: "Une pièce utilise déjà cette adresse." };
  }

  const next = editing
    ? catalog.map((product) => (product.id === editing ? parsed.product : product))
    : [parsed.product, ...catalog];

  await saveCatalog(next);
  if (image !== currentImage && currentImage) await discardImage(currentImage);
  redirect(editing ? `/admin/pieces/${parsed.product.id}` : "/admin");
}

export async function deletePiece(formData: FormData): Promise<void> {
  if (!(await readAdminSession())) redirect("/admin/connexion");
  const id = String(formData.get("id") ?? "");
  const catalog = await catalogForWrite();
  if (!catalog) redirect(id ? `/admin/pieces/${id}` : "/admin");
  const current = catalog.find((product) => product.id === id);
  if (!current) redirect("/admin");
  await saveCatalog(catalog.filter((product) => product.id !== id));
  await discardImage(current.image);
  redirect("/admin");
}

async function catalogForWrite(): Promise<Product[] | null> {
  try {
    return await readCatalogFresh();
  } catch {
    return null;
  }
}

function slugSource(formData: FormData): string {
  const id = String(formData.get("id") ?? "").trim();
  return id || String(formData.get("name") ?? "piece");
}

function draftFromForm(formData: FormData, image: string): PieceDraft {
  const names = formData.getAll("colorName");
  const hexes = formData.getAll("colorHex");
  const colors = names.map((name, index) => ({
    name: String(name),
    hex: String(hexes[index] ?? ""),
  }));
  const price = Number(String(formData.get("price") ?? "").replace(",", "."));
  return {
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    price: Number.isFinite(price) ? Math.round(price) : Number.NaN,
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
    sizeKind: String(formData.get("sizeKind") ?? ""),
    colors,
    image,
    imageAlt: String(formData.get("imageAlt") ?? ""),
    focal: String(formData.get("focal") ?? ""),
    isNew: formData.get("isNew") === "on",
  };
}

import { connection } from "next/server";

import { getDoc, putDoc } from "@/lib/doc-store";
import { normalizePhone, phoneLooksValid } from "@/lib/orders";
import { shop } from "@/lib/shop";

export type Settings = {
  /** Numéro WhatsApp de la boutique, format international, chiffres seulement. */
  whatsappNumber: string;
  /** Texte du bandeau tout en haut de la boutique. */
  announcement: string;
  /** Phrase affichée dans le panier : frais, délais, zones livrées. */
  deliveryNote: string;
  /** Quand c'est faux, la boutique reste visible mais ne prend plus de commande. */
  ordersOpen: boolean;
};

export const defaultSettings: Settings = {
  whatsappNumber: shop.whatsappNumber,
  announcement: "Livraison rapide · Commande simple et directe via WhatsApp",
  deliveryNote: "",
  ordersOpen: true,
};

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export function validateSettings(input: Partial<Record<keyof Settings, unknown>>): { ok: true; settings: Settings } | { ok: false; error: string } {
  const whatsappNumber = normalizePhone(text(input.whatsappNumber, 30));
  if (!phoneLooksValid(whatsappNumber)) {
    return { ok: false, error: "Le numéro WhatsApp doit être complet, avec l'indicatif du pays (243…)." };
  }
  const announcement = text(input.announcement, 120);
  if (announcement.length < 3) return { ok: false, error: "Le bandeau doit contenir au moins quelques mots." };
  return {
    ok: true,
    settings: {
      whatsappNumber,
      announcement,
      deliveryNote: text(input.deliveryNote, 200),
      ordersOpen: input.ordersOpen === true,
    },
  };
}

export function parseSettings(raw: string | null): Settings {
  if (!raw) return defaultSettings;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const parsed = validateSettings({
      whatsappNumber: value.whatsappNumber,
      announcement: value.announcement,
      deliveryNote: value.deliveryNote,
      ordersOpen: value.ordersOpen !== false,
    });
    return parsed.ok ? parsed.settings : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function getSettings(): Promise<Settings> {
  await connection();
  try {
    return parseSettings(await getDoc("settings", "site"));
  } catch {
    return defaultSettings;
  }
}

export async function writeSettings(settings: Settings): Promise<void> {
  await putDoc("settings", "site", JSON.stringify(settings));
}

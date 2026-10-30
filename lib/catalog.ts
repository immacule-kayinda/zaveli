import { refresh, revalidatePath } from "next/cache";
import { connection } from "next/server";

import { readStoredCatalogJson, removeStoredImage, saveStoredImage, writeStoredCatalog } from "@/lib/catalog-io";
import { focalChoices, products as seedProducts, sizesForKind, type FocalChoice } from "@/lib/products";
import type { CategoryId, Product, SizeKind } from "@/lib/types";

const categories = new Set<CategoryId>(["habits", "accessoires", "chaussures"]);
const sizeKinds = new Set<SizeKind>(["letter", "shoe", "unique"]);
const focals = new Set<string>(focalChoices.map((choice) => choice.value));

export async function readCatalogFresh(): Promise<Product[]> {
  const raw = await readStoredCatalogJson();
  if (!raw) return seedProducts;
  let parsed: Product[] | null;
  try {
    parsed = parseCatalog(JSON.parse(raw) as unknown);
  } catch {
    throw new Error("catalog-invalid");
  }
  if (!parsed) throw new Error("catalog-invalid");
  return parsed;
}

export async function getCatalog(): Promise<Product[]> {
  await connection();
  try {
    return await readCatalogFresh();
  } catch {
    return seedProducts;
  }
}

export async function saveCatalog(catalog: Product[]): Promise<void> {
  await writeStoredCatalog(catalog);
  await waitUntilStored(catalog);
  revalidatePath("/", "layout");
  refresh();
}

async function waitUntilStored(catalog: Product[]): Promise<void> {
  const expected = catalog.map((product) => `${product.id}:${product.price}`).join("|");
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const stored = await readCatalogFresh();
      const actual = stored.map((product) => `${product.id}:${product.price}`).join("|");
      if (actual === expected) return;
    } catch {
      // Le fichier vient d'être écrit : une lecture trop tôt peut encore renvoyer l'ancienne version.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export type PieceDraft = {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  sizeKind: string;
  colors: { name: string; hex: string }[];
  image: string;
  imageAlt: string;
  focal: string;
  isNew: boolean;
};

export function toProduct(draft: PieceDraft): { ok: true; product: Product } | { ok: false; error: string } {
  const id = slugify(draft.id || draft.name);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return { ok: false, error: "Le nom ne donne pas une adresse valide." };
  }
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Le nom doit faire entre 2 et 80 caractères." };
  }
  if (!Number.isInteger(draft.price) || draft.price < 1 || draft.price > 100000) {
    return { ok: false, error: "Le prix est un nombre entier, entre 1 et 100 000." };
  }
  if (!categories.has(draft.category as CategoryId)) {
    return { ok: false, error: "Choisissez un rayon." };
  }
  if (!sizeKinds.has(draft.sizeKind as SizeKind)) {
    return { ok: false, error: "Choisissez un type de taille." };
  }
  const description = draft.description.trim();
  if (description.length < 8 || description.length > 400) {
    return { ok: false, error: "La description doit faire entre 8 et 400 caractères." };
  }
  const colors = draft.colors
    .map((color) => ({ name: color.name.trim(), hex: color.hex.trim() }))
    .filter((color) => color.name.length > 0);
  if (colors.length === 0) {
    return { ok: false, error: "Ajoutez au moins une couleur." };
  }
  const seen = new Set<string>();
  for (const color of colors) {
    const key = color.name.toLocaleLowerCase("fr");
    if (seen.has(key)) return { ok: false, error: "Deux couleurs portent le même nom." };
    seen.add(key);
    if (color.name.length > 30 || !/^#[0-9a-fA-F]{6}$/.test(color.hex)) {
      return { ok: false, error: "Chaque couleur a un nom court et un code hexadécimal." };
    }
  }
  if (!draft.image.startsWith("/") && !draft.image.startsWith("https://")) {
    return { ok: false, error: "Ajoutez une photo." };
  }
  const imageAlt = draft.imageAlt.trim();
  if (imageAlt.length < 8 || imageAlt.length > 180) {
    return { ok: false, error: "Décrivez la photo en une phrase, pour les lecteurs d'écran." };
  }
  if (!focals.has(draft.focal)) {
    return { ok: false, error: "Choisissez le cadrage de la photo." };
  }

  const sizeKind = draft.sizeKind as SizeKind;
  return {
    ok: true,
    product: {
      id,
      name,
      price: draft.price,
      category: draft.category as CategoryId,
      description,
      colors,
      sizes: sizesForKind(sizeKind),
      sizeKind,
      image: draft.image,
      imageAlt,
      focal: draft.focal as FocalChoice,
      isNew: draft.isNew,
    },
  };
}

export function parseCatalog(value: unknown): Product[] | null {
  if (!Array.isArray(value)) return null;
  const catalog: Product[] = [];
  for (const entry of value) {
    if (!isRecord(entry)) return null;
    const draft: PieceDraft = {
      id: typeof entry.id === "string" ? entry.id : "",
      name: typeof entry.name === "string" ? entry.name : "",
      price: typeof entry.price === "number" ? entry.price : Number.NaN,
      category: typeof entry.category === "string" ? entry.category : "",
      description: typeof entry.description === "string" ? entry.description : "",
      sizeKind: typeof entry.sizeKind === "string" ? entry.sizeKind : "",
      colors: Array.isArray(entry.colors)
        ? entry.colors.flatMap((color) => {
            if (!isRecord(color) || typeof color.name !== "string" || typeof color.hex !== "string") return [];
            return [{ name: color.name, hex: color.hex }];
          })
        : [],
      image: typeof entry.image === "string" ? entry.image : "",
      imageAlt: typeof entry.imageAlt === "string" ? entry.imageAlt : "",
      focal: typeof entry.focal === "string" ? entry.focal : "",
      isNew: entry.isNew === true,
    };
    const parsed = toProduct(draft);
    if (!parsed.ok || parsed.product.id !== draft.id) return null;
    catalog.push(parsed.product);
  }
  return catalog;
}

export function imageFilename(id: string, extension: string, now = Date.now()): string {
  return `${slugify(id) || "piece"}-${now}.${extension}`;
}

export async function storePieceImage(file: File, id: string): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size === 0) return { ok: false, error: "Ajoutez une photo." };
  if (file.size > 5_000_000) return { ok: false, error: "La photo dépasse 5 Mo." };
  const extension = extensionFor(file.type);
  if (!extension) return { ok: false, error: "La photo doit être un JPEG, un PNG ou un WebP." };
  const url = await saveStoredImage(Buffer.from(await file.arrayBuffer()), imageFilename(id, extension), file.type);
  return { ok: true, url };
}

export async function discardImage(url: string): Promise<void> {
  await removeStoredImage(url);
}

function extensionFor(type: string): string | null {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

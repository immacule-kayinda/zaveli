import { BlobNotFoundError, del, head, put } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Product } from "@/lib/types";

const CATALOG_PATH = "catalog/products.json";
const localCatalog = path.join(process.cwd(), ".data", "catalog.json");

function usesBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function readStoredCatalogJson(): Promise<string | null> {
  if (usesBlob()) return readBlob();
  try {
    return await readFile(localCatalog, "utf8");
  } catch (error) {
    if (isEnoent(error)) return null;
    throw error;
  }
}

export async function writeStoredCatalog(catalog: Product[]): Promise<void> {
  const raw = JSON.stringify(catalog);
  if (usesBlob()) {
    await put(CATALOG_PATH, raw, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }
  await mkdir(path.dirname(localCatalog), { recursive: true });
  await writeFile(localCatalog, raw, "utf8");
}

export async function saveStoredImage(body: Buffer, filename: string, contentType: string): Promise<string> {
  if (usesBlob()) {
    const blob = await put(`produits/${filename}`, body, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });
    return blob.url;
  }
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), body);
  return `/uploads/${filename}`;
}

export async function removeStoredImage(url: string): Promise<void> {
  if (url.includes(".blob.vercel-storage.com/") && usesBlob()) {
    await del(url).catch(() => undefined);
    return;
  }
  if (url.startsWith("/uploads/")) {
    const filename = path.basename(url);
    await unlink(path.join(process.cwd(), "public", "uploads", filename)).catch(() => undefined);
  }
}

async function readBlob(): Promise<string | null> {
  try {
    const existing = await head(CATALOG_PATH);
    const response = await fetch(existing.url, { cache: "no-store" });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Lecture du catalogue impossible (${response.status}).`);
    return await response.text();
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

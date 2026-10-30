import { BlobNotFoundError, del, get, list, put, type ListBlobResultBlob } from "@vercel/blob";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Product } from "@/lib/types";

const CATALOG_PREFIX = "catalog/";
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
    const pathname = `${CATALOG_PREFIX}products-${Date.now()}.json`;
    await put(pathname, raw, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    });
    const blobs = await listCatalogBlobs();
    if (blobs.some((blob) => blob.pathname === pathname)) {
      const stale = blobs.filter((blob) => blob.pathname !== pathname);
      if (stale.length > 0) await del(stale.map((blob) => blob.url));
    }
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
  const latest = (await listCatalogBlobs()).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
  if (!latest) return null;
  try {
    const result = await get(latest.url, { access: "public" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return await new Response(result.stream).text();
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

async function listCatalogBlobs(): Promise<ListBlobResultBlob[]> {
  const blobs: ListBlobResultBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: CATALOG_PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs.filter((blob) => blob.pathname.endsWith(".json")));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

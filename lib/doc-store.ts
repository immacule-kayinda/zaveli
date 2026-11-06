import { BlobNotFoundError, del, get, list, put, type ListBlobResultBlob } from "@vercel/blob";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Petit magasin de documents JSON, un fichier par document.
 * Sur Vercel Blob, chaque enregistrement prend un nouveau nom (`collection/id--horodatage.json`)
 * pour que la lecture suivante ne tombe jamais sur une copie en cache. Sans jeton Blob, les
 * documents restent dans `.data/<collection>/`.
 */

const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const COLLECTION_PATTERN = /^[a-z][a-z0-9-]{0,31}$/;

function usesBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function check(collection: string, id?: string) {
  if (!COLLECTION_PATTERN.test(collection)) throw new Error("collection-invalide");
  if (id !== undefined && !ID_PATTERN.test(id)) throw new Error("identifiant-invalide");
}

function localDirectory(collection: string): string {
  return path.join(process.cwd(), ".data", collection);
}

export type StoredDoc = { id: string; raw: string };

export function blobDocumentId(pathname: string, collection: string): string | null {
  const name = pathname.slice(collection.length + 1);
  const separator = name.lastIndexOf("--");
  if (!pathname.startsWith(`${collection}/`) || separator <= 0 || !name.endsWith(".json")) return null;
  return name.slice(0, separator);
}

export async function listDocs(collection: string): Promise<StoredDoc[]> {
  check(collection);
  if (!usesBlob()) {
    let names: string[];
    try {
      names = await readdir(localDirectory(collection));
    } catch (error) {
      if (isEnoent(error)) return [];
      throw error;
    }
    const docs = await Promise.all(
      names
        .filter((name) => name.endsWith(".json"))
        .map(async (name) => ({
          id: name.slice(0, -".json".length),
          raw: await readFile(path.join(localDirectory(collection), name), "utf8"),
        })),
    );
    return docs;
  }

  const latest = new Map<string, ListBlobResultBlob>();
  for (const blob of await listBlobs(`${collection}/`)) {
    const id = blobDocumentId(blob.pathname, collection);
    if (!id) continue;
    const known = latest.get(id);
    if (!known || known.uploadedAt < blob.uploadedAt) latest.set(id, blob);
  }

  const docs: StoredDoc[] = [];
  const entries = [...latest.entries()];
  for (let start = 0; start < entries.length; start += 10) {
    const batch = await Promise.all(
      entries.slice(start, start + 10).map(async ([id, blob]) => {
        const raw = await readBlob(blob.url);
        return raw === null ? null : { id, raw };
      }),
    );
    for (const doc of batch) if (doc) docs.push(doc);
  }
  return docs;
}

export async function getDoc(collection: string, id: string): Promise<string | null> {
  check(collection, id);
  if (!usesBlob()) {
    try {
      return await readFile(path.join(localDirectory(collection), `${id}.json`), "utf8");
    } catch (error) {
      if (isEnoent(error)) return null;
      throw error;
    }
  }
  const blobs = (await listBlobs(`${collection}/${id}--`)).filter((blob) => blobDocumentId(blob.pathname, collection) === id);
  const latest = blobs.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())[0];
  return latest ? readBlob(latest.url) : null;
}

export async function putDoc(collection: string, id: string, raw: string): Promise<void> {
  check(collection, id);
  if (!usesBlob()) {
    await mkdir(localDirectory(collection), { recursive: true });
    await writeFile(path.join(localDirectory(collection), `${id}.json`), raw, "utf8");
    return;
  }
  const pathname = `${collection}/${id}--${Date.now()}.json`;
  await put(pathname, raw, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  const blobs = (await listBlobs(`${collection}/${id}--`)).filter((blob) => blobDocumentId(blob.pathname, collection) === id);
  if (blobs.some((blob) => blob.pathname === pathname)) {
    const stale = blobs.filter((blob) => blob.pathname !== pathname);
    if (stale.length > 0) await del(stale.map((blob) => blob.url));
  }
}

export async function removeDoc(collection: string, id: string): Promise<void> {
  check(collection, id);
  if (!usesBlob()) {
    await unlink(path.join(localDirectory(collection), `${id}.json`)).catch(() => undefined);
    return;
  }
  const blobs = (await listBlobs(`${collection}/${id}--`)).filter((blob) => blobDocumentId(blob.pathname, collection) === id);
  if (blobs.length > 0) await del(blobs.map((blob) => blob.url));
}

async function readBlob(url: string): Promise<string | null> {
  try {
    const result = await get(url, { access: "public" });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return await new Response(result.stream).text();
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

async function listBlobs(prefix: string): Promise<ListBlobResultBlob[]> {
  const blobs: ListBlobResultBlob[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs.filter((blob) => blob.pathname.endsWith(".json")));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return blobs;
}

function isEnoent(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}

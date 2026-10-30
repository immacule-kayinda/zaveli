import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminConfig = {
  configured: boolean;
  user: string;
  password: string;
  secret: string;
};

export function adminConfig(): AdminConfig {
  const user = process.env.ADMIN_USER?.trim() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  return {
    configured: user.length > 0 && password.length > 0 && secret.length > 0,
    user,
    password,
    secret,
  };
}

export function credentialsMatch(user: string, password: string): boolean {
  const config = adminConfig();
  if (!config.configured) return false;
  return safeEqual(user, config.user) && safeEqual(password, config.password);
}

export function createSessionToken(user: string, secret: string, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ user, exp: now + WEEK_MS })).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function readSessionToken(token: string, secret: string, now = Date.now()): string | null {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as { user?: unknown; exp?: unknown };
    if (typeof parsed.user !== "string" || typeof parsed.exp !== "number") return null;
    if (parsed.exp <= now) return null;
    return parsed.user;
  } catch {
    return null;
  }
}

function safeEqual(left: string, right: string): boolean {
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

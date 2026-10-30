import { cookies } from "next/headers";

import { adminConfig, createSessionToken, readSessionToken } from "@/lib/admin-session";

const COOKIE = "zaveli_admin";
const WEEK_SECONDS = 7 * 24 * 60 * 60;

export async function readAdminSession(): Promise<string | null> {
  const config = adminConfig();
  if (!config.configured) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const user = readSessionToken(token, config.secret);
  return user === config.user ? user : null;
}

export async function writeAdminSession(user: string): Promise<void> {
  const config = adminConfig();
  if (!config.configured) return;
  (await cookies()).set(COOKIE, createSessionToken(user, config.secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: WEEK_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

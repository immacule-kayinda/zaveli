import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { logout } from "@/app/admin/actions";
import { readAdminSession } from "@/lib/admin-cookie";

export const instant = false;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-sm text-muted">Ouverture de l&apos;administration…</p>}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: ReactNode }) {
  await connection();
  if (!(await readAdminSession())) redirect("/admin/connexion");

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs tracking-[0.18em] text-clay uppercase">Administration</p>
            <Link href="/admin" className="font-display text-2xl text-ink">
              Zaveli
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-cocoa hover:text-clay">
              Voir la boutique
            </Link>
            <form action={logout}>
              <button type="submit" className="text-muted hover:text-clay">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-10">{children}</div>
    </div>
  );
}

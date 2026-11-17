import { LogOut, Store } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { logout } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { readAdminSession } from "@/lib/admin-cookie";
import { shop } from "@/lib/shop";

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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 pt-3 pb-3 sm:px-5 md:pb-2">
          <div className="min-w-0">
            <p className="text-[0.65rem] tracking-[0.18em] text-clay uppercase sm:text-xs">Administration</p>
            <Link href="/admin" className="font-display block truncate text-2xl leading-tight text-ink">
              {shop.name}
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm">
            <Link
              href="/"
              aria-label="Voir la boutique"
              className="grid size-11 place-items-center rounded-full text-cocoa hover:bg-sand/60 hover:text-clay md:inline-flex md:size-auto md:px-3 md:py-2"
            >
              <Store aria-hidden className="size-5 md:hidden" />
              <span className="hidden md:inline">Voir la boutique</span>
            </Link>
            <form action={logout}>
              <button
                type="submit"
                aria-label="Se déconnecter"
                className="grid size-11 place-items-center rounded-full text-muted hover:bg-sand/60 hover:text-clay md:inline-flex md:size-auto md:px-3 md:py-2"
              >
                <LogOut aria-hidden className="size-5 md:hidden" />
                <span className="hidden md:inline">Se déconnecter</span>
              </button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <div className="mx-auto max-w-5xl px-4 pt-6 pb-28 sm:px-5 md:py-10">{children}</div>
    </div>
  );
}

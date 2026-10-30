import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";
import { readAdminSession } from "@/lib/admin-cookie";
import { adminConfig } from "@/lib/admin-session";

export const metadata: Metadata = { title: "Connexion" };
export const instant = false;

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <p className="text-xs tracking-[0.2em] text-clay uppercase">Administration</p>
      <h1 className="font-display mt-3 text-4xl text-ink">Entrer dans la maison.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Le compte est celui défini par les variables d&apos;environnement, pas une inscription.
      </p>
      <Suspense fallback={<p className="mt-8 text-sm text-muted">Ouverture…</p>}>
        <LoginBody />
      </Suspense>
    </main>
  );
}

async function LoginBody() {
  await connection();
  if (await readAdminSession()) redirect("/admin");
  if (!adminConfig().configured) {
    return (
      <p role="alert" className="mt-8 rounded-2xl bg-blush px-4 py-3 text-sm text-clay-deep">
        Renseignez ADMIN_USER, ADMIN_PASSWORD et ADMIN_SESSION_SECRET avant d&apos;ouvrir cette page.
      </p>
    );
  }
  return <LoginForm />;
}

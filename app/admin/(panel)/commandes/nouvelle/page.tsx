import type { Metadata } from "next";

import { createManualOrder } from "@/app/admin/order-actions";
import { ManualOrderForm } from "@/components/admin/ManualOrderForm";
import { getCatalog } from "@/lib/catalog";

export const metadata: Metadata = { title: "Saisir une commande" };
export const instant = false;

export default async function NewOrderPage() {
  const catalog = await getCatalog();
  return (
    <section className="max-w-3xl">
      <h1 className="font-display text-3xl text-ink sm:text-4xl">Saisir une commande</h1>
      <p className="mt-2 text-sm text-muted">
        Pour une commande reçue par appel ou directement sur WhatsApp : elle rejoint le suivi et les statistiques.
      </p>
      <div className="mt-8">
        <ManualOrderForm action={createManualOrder} catalog={catalog} />
      </div>
    </section>
  );
}

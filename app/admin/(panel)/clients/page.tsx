import type { Metadata } from "next";
import Link from "next/link";

import { formatDate } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { customersFrom } from "@/lib/orders";
import { listOrders } from "@/lib/orders-db";

export const metadata: Metadata = { title: "Clientes" };
export const instant = false;

export default async function CustomersPage() {
  const customers = customersFrom(await listOrders());

  return (
    <section>
      <h1 className="font-display text-4xl text-ink">Clientes</h1>
      <p className="mt-2 text-sm text-muted">
        Regroupées d&apos;après le téléphone, ou le nom et la ville quand il n&apos;y a pas de numéro. Les commandes annulées ne comptent pas dans les achats.
      </p>

      {customers.length === 0 ? (
        <p className="mt-8 rounded-[1.5rem] border border-line bg-paper p-6 text-sm text-muted">
          Aucune cliente identifiée pour l&apos;instant. Elles apparaissent quand une commande porte un nom ou un téléphone.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-[1.5rem] border border-line bg-paper">
          {customers.map((customer) => (
            <li key={customer.key}>
              <Link
                href={`/admin/commandes?q=${encodeURIComponent(customer.phone || customer.name)}`}
                className="grid gap-1 px-4 py-3.5 hover:bg-sand/40 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">{customer.name || "Sans nom"}</span>
                  <span className="block truncate text-xs text-muted">
                    {[customer.phone ? `+${customer.phone}` : "", customer.city].filter(Boolean).join(" · ") || "Pas de coordonnées"}
                    {" · "}
                    dernière commande le {formatDate(customer.lastOrderAt)}
                  </span>
                </span>
                <span className="flex items-baseline justify-between gap-4 sm:justify-end">
                  <span className="text-sm text-muted">
                    {customer.orderCount} commande{customer.orderCount > 1 ? "s" : ""}
                  </span>
                  <span className="font-display text-lg text-clay">{formatPrice(customer.spent)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

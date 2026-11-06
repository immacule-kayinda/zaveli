import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { filterOrders, isStatus, statuses, statusLabels } from "@/lib/orders";
import { listOrders } from "@/lib/orders-db";

export const metadata: Metadata = { title: "Commandes" };
export const instant = false;

type PageProps = { searchParams: Promise<{ statut?: string | string[]; q?: string | string[] }> };

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = first(params.statut);
  const query = first(params.q).slice(0, 80);
  const all = await listOrders();
  const orders = filterOrders(all, { status, query });
  const activeStatus = isStatus(status) ? status : "";

  function href(next: string) {
    const search = new URLSearchParams();
    if (next) search.set("statut", next);
    if (query) search.set("q", query);
    const text = search.toString();
    return text ? `/admin/commandes?${text}` : "/admin/commandes";
  }

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-ink">Commandes</h1>
          <p className="mt-2 text-sm text-muted">
            {orders.length} sur {all.length}. Chaque commande validée sur le site est enregistrée ici avant l&apos;ouverture de WhatsApp.
          </p>
        </div>
        <div className="flex gap-2">
          <Button href="/admin/export/commandes" variant="outline" download>
            Exporter (CSV)
          </Button>
          <Button href="/admin/commandes/nouvelle">Saisir une commande</Button>
        </div>
      </div>

      <form action="/admin/commandes" className="mt-6 flex gap-2">
        {activeStatus ? <input type="hidden" name="statut" value={activeStatus} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={query}
          aria-label="Rechercher une commande"
          placeholder="Numéro, nom, ville, téléphone, pièce…"
          className="h-11 w-full rounded-full border border-line bg-paper px-5 text-sm text-ink outline-none focus:border-clay"
        />
        <Button type="submit" variant="secondary">
          Chercher
        </Button>
      </form>

      <nav aria-label="Filtrer par statut" className="mt-4 flex flex-wrap gap-2">
        {[{ value: "", label: "Toutes" }, ...statuses.map((value) => ({ value, label: statusLabels[value] }))].map((item) => {
          const count = item.value ? all.filter((order) => order.status === item.value).length : all.length;
          const active = item.value === activeStatus;
          return (
            <Link
              key={item.value || "toutes"}
              href={href(item.value)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition",
                active ? "border-cocoa bg-cocoa text-paper" : "border-line bg-paper text-cocoa hover:border-clay",
              )}
            >
              {item.label} <span className={active ? "text-paper/70" : "text-muted"}>{count}</span>
            </Link>
          );
        })}
      </nav>

      {orders.length === 0 ? (
        <p className="mt-8 rounded-[1.5rem] border border-line bg-paper p-6 text-sm text-muted">
          {all.length === 0
            ? "Aucune commande pour l'instant. Dès qu'une cliente valide son panier, elle apparaît ici."
            : "Aucune commande ne correspond à cette recherche."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-[1.5rem] border border-line bg-paper">
          {orders.map((order) => (
            <li key={order.id}>
              <Link href={`/admin/commandes/${order.id}`} className="grid gap-1 px-4 py-3.5 hover:bg-sand/40 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {order.buyerName || "Sans nom"} <span className="font-normal text-muted">· {order.id}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {formatDateTime(order.createdAt)}
                    {order.city ? ` · ${order.city}` : ""} ·{" "}
                    {order.lines.map((line) => `${line.quantity}× ${line.name}`).join(", ")}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="font-display text-lg text-clay">{formatPrice(order.total)}</span>
                  <StatusBadge status={order.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

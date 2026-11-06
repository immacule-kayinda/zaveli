import type { Metadata } from "next";
import Link from "next/link";

import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { getCatalog } from "@/lib/catalog";
import { formatDayKey, formatDateTime } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { statuses, statusLabels } from "@/lib/orders";
import { loadDashboard } from "@/lib/orders-db";

export const metadata: Metadata = { title: "Tableau de bord" };
export const instant = false;

export default async function DashboardPage() {
  const [{ orders, stats }, catalog] = await Promise.all([loadDashboard(), getCatalog()]);
  const peak = Math.max(1, ...stats.daily.map((day) => day.count));
  const recent = orders.slice(0, 6);
  const soldOut = catalog.filter((product) => product.soldOut);

  const tiles = [
    { label: "À traiter", value: String(stats.toProcess), hint: "commandes nouvelles", href: "/admin/commandes?statut=nouvelle", strong: stats.toProcess > 0 },
    { label: "En cours", value: String(stats.inProgress), hint: "confirmées, payées ou en livraison", href: "/admin/commandes" },
    { label: "Aujourd'hui", value: String(stats.today), hint: `${stats.last7Days} sur les 7 derniers jours` },
    { label: "Ventes sur 30 jours", value: formatPrice(stats.revenue30Days), hint: `panier moyen ${formatPrice(stats.averageBasket)}` },
  ];

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between [&>a]:w-full sm:[&>a]:w-auto">
        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">Tableau de bord</h1>
          <p className="mt-2 text-sm text-muted">
            {stats.orderCount > 1 ? `${stats.orderCount} commandes` : `${stats.orderCount} commande`} au total ·{" "}
            {formatPrice(stats.revenue)} de ventes, annulations exclues.
          </p>
        </div>
        <Button href="/admin/commandes/nouvelle">Saisir une commande</Button>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile) => {
          const body = (
            <>
              <p className="text-xs tracking-[0.14em] text-muted uppercase">{tile.label}</p>
              <p className={`font-display mt-2 text-3xl sm:text-4xl ${tile.strong ? "text-clay" : "text-ink"}`}>{tile.value}</p>
              <p className="mt-1 text-xs text-muted">{tile.hint}</p>
            </>
          );
          return (
            <li key={tile.label}>
              {tile.href ? (
                <Link href={tile.href} className="block h-full rounded-[1.5rem] border border-line bg-paper p-4 hover:border-clay sm:p-5">
                  {body}
                </Link>
              ) : (
                <div className="h-full rounded-[1.5rem] border border-line bg-paper p-4 sm:p-5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[1.5rem] border border-line bg-paper p-5">
          <h2 className="font-display text-2xl text-ink">Commandes des 14 derniers jours</h2>
          <ol className="mt-5 flex h-40 items-end gap-1.5" aria-label="Commandes par jour">
            {stats.daily.map((day) => (
              <li key={day.day} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center">
                <span className="text-[0.65rem] text-muted">{day.count > 0 ? day.count : ""}</span>
                <span
                  className="block rounded-t-md bg-clay/80"
                  style={{ height: `${Math.max(day.count > 0 ? 6 : 2, (day.count / peak) * 100)}%`, opacity: day.count > 0 ? 1 : 0.25 }}
                  title={`${formatDayKey(day.day)} : ${day.count} commande(s), ${formatPrice(day.revenue)}`}
                />
              </li>
            ))}
          </ol>
          <div className="mt-2 flex justify-between text-[0.7rem] text-muted">
            <span>{stats.daily[0] ? formatDayKey(stats.daily[0].day) : ""}</span>
            <span>aujourd&apos;hui</span>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-line bg-paper p-5">
          <h2 className="font-display text-2xl text-ink">Par statut</h2>
          <ul className="mt-4 grid gap-2">
            {statuses.map((status) => (
              <li key={status}>
                <Link href={`/admin/commandes?statut=${status}`} className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-sand/50">
                  <span className="text-sm text-cocoa">{statusLabels[status]}</span>
                  <span className="font-display text-lg text-ink">{stats.byStatus[status]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <div className="rounded-[1.5rem] border border-line bg-paper p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl text-ink">Dernières commandes</h2>
            <Link href="/admin/commandes" className="inline-flex min-h-11 items-center text-sm text-clay underline-offset-4 hover:underline">
              Tout voir
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Aucune commande pour l&apos;instant. Elles apparaissent ici dès qu&apos;une cliente valide son panier.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/commandes/${order.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-clay">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-ink">{order.buyerName || "Sans nom"} · {order.id}</span>
                      <span className="text-xs text-muted">{formatDateTime(order.createdAt)}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span className="text-sm text-cocoa">{formatPrice(order.total)}</span>
                      <StatusBadge status={order.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid min-w-0 content-start gap-6">
          <div className="rounded-[1.5rem] border border-line bg-paper p-5">
            <h2 className="font-display text-2xl text-ink">Pièces les plus commandées</h2>
            {stats.topProducts.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Le classement se remplit avec les commandes.</p>
            ) : (
              <ol className="mt-3 divide-y divide-line">
                {stats.topProducts.map((product, index) => (
                  <li key={product.productId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="truncate text-cocoa">
                      <span className="mr-2 font-display text-clay">{index + 1}</span>
                      {product.name}
                    </span>
                    <span className="shrink-0 text-muted">
                      {product.quantity} × · {formatPrice(product.revenue)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <div className="rounded-[1.5rem] border border-line bg-paper p-5">
            <h2 className="font-display text-2xl text-ink">Collection</h2>
            <p className="mt-3 text-sm text-muted">
              {catalog.length} pièces en ligne
              {soldOut.length > 0 ? `, dont ${soldOut.length} épuisée${soldOut.length > 1 ? "s" : ""}` : ""}.
            </p>
            <Link href="/admin/collection" className="mt-1 inline-flex min-h-11 items-center text-sm text-clay underline-offset-4 hover:underline">
              Gérer la collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

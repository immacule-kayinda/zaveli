import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteOrder, saveOrderDetails, updateOrderStatus } from "@/app/admin/order-actions";
import { MessageCircle, Phone } from "lucide-react";

import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { OrderDetailsForm } from "@/components/admin/OrderDetailsForm";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/dates";
import { formatPrice } from "@/lib/money";
import { customerMessage, nextStatus, statuses, statusLabels } from "@/lib/orders";
import { findOrder } from "@/lib/orders-db";
import { shop } from "@/lib/shop";
import { whatsAppUrl } from "@/lib/whatsapp";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Commande" };
export const instant = false;

export default async function OrderPage({ params }: PageProps) {
  const { id } = await params;
  const order = await findOrder(id);
  if (!order) notFound();

  const next = nextStatus(order.status);
  const contactHref = order.phone ? whatsAppUrl(customerMessage(order, shop.name), order.phone) : "";

  return (
    <section className="grid gap-8 pb-20 md:pb-0 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <Link href="/admin/commandes" className="-mt-2 inline-flex min-h-11 items-center text-sm text-muted hover:text-clay">
          ← Toutes les commandes
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{order.id}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="mt-2 text-sm text-muted">
          Reçue le {formatDateTime(order.createdAt)} · {order.source === "site" ? "depuis le site" : "saisie à la main"}
        </p>

        {order.buyerName || order.phone || order.city || order.address ? (
          <div className="mt-4 rounded-[1.5rem] border border-line bg-paper p-4 text-sm text-cocoa">
            {order.buyerName ? <p className="font-display text-xl text-ink">{order.buyerName}</p> : null}
            {order.city || order.address ? (
              <p className="mt-1 text-muted">{[order.city, order.address].filter(Boolean).join(" · ")}</p>
            ) : null}
            {order.phone ? (
              <a href={`tel:+${order.phone}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-clay">
                <Phone aria-hidden className="size-4" />+{order.phone}
              </a>
            ) : null}
          </div>
        ) : null}

        <ul className="mt-6 divide-y divide-line rounded-[1.5rem] border border-line bg-paper">
          {order.lines.map((line) => (
            <li key={`${line.productId}-${line.size}-${line.color}`} className="flex items-start justify-between gap-4 px-4 py-3.5">
              <span className="min-w-0">
                <span className="block font-display text-lg text-ink">{line.name}</span>
                <span className="text-sm text-muted">
                  {line.sizeKind === "unique" ? "Taille unique" : line.sizeKind === "shoe" ? `Pointure ${line.size}` : `Taille ${line.size}`}
                  {line.color ? ` · ${line.color}` : ""} · {line.quantity} × {formatPrice(line.unitPrice)}
                </span>
              </span>
              <span className="shrink-0 text-cocoa">{formatPrice(line.quantity * line.unitPrice)}</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between px-4 py-3.5">
            <span className="text-sm text-muted">Total</span>
            <span className="font-display text-3xl text-clay">{formatPrice(order.total)}</span>
          </li>
        </ul>

        {order.note ? (
          <p className="mt-4 rounded-2xl bg-sand px-4 py-3 text-sm text-cocoa">
            <span className="text-xs tracking-wide text-muted uppercase">Message de la cliente</span>
            <br />
            {order.note}
          </p>
        ) : null}

        <h2 className="font-display mt-8 text-2xl text-ink">Historique</h2>
        <ol className="mt-3 grid gap-2 text-sm">
          {[...order.history].reverse().map((event, index) => (
            <li key={`${event.status}-${event.at}-${index}`} className="flex justify-between gap-4 border-b border-line pb-2 text-cocoa">
              <span>{statusLabels[event.status]}</span>
              <span className="text-muted">{formatDateTime(event.at)}</span>
            </li>
          ))}
        </ol>
      </div>

      <aside className="grid content-start gap-6">
        <div className="rounded-[1.5rem] border border-line bg-paper p-5">
          <h2 className="font-display text-2xl text-ink">Avancement</h2>
          {next ? (
            <form action={updateOrderStatus} className="mt-4">
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={next} />
              <Button type="submit" className="w-full">
                Passer à « {statusLabels[next]} »
              </Button>
            </form>
          ) : null}
          <form action={updateOrderStatus} className="mt-4 flex gap-2">
            <input type="hidden" name="id" value={order.id} />
            <label className="sr-only" htmlFor="status">
              Changer le statut
            </label>
            <select
              id="status"
              name="status"
              defaultValue={order.status}
              className="h-12 w-full min-w-0 rounded-full border border-line bg-paper px-4 text-base text-ink outline-none focus:border-clay"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Appliquer
            </Button>
          </form>
          {contactHref ? (
            <Button href={contactHref} target="_blank" rel="noopener noreferrer" variant="secondary" className="mt-4 w-full">
              Prévenir la cliente sur WhatsApp
            </Button>
          ) : (
            <p className="mt-4 text-xs text-muted">Ajoutez un téléphone pour écrire à la cliente depuis ici.</p>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-line bg-paper p-5">
          <h2 className="font-display text-2xl text-ink">Cliente et suivi</h2>
          <div className="mt-4">
            <OrderDetailsForm action={saveOrderDetails} order={order} />
          </div>
        </div>

        <ConfirmDelete action={deleteOrder} id={order.id} message={`Supprimer définitivement la commande ${order.id} ?`} label="Supprimer la commande" />
      </aside>

      {next || contactHref ? (
        <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-20 flex gap-2 border-t border-line bg-paper/95 px-4 py-2.5 backdrop-blur md:hidden">
          {next ? (
            <form action={updateOrderStatus} className="min-w-0 flex-1">
              <input type="hidden" name="id" value={order.id} />
              <input type="hidden" name="status" value={next} />
              <Button type="submit" className="w-full">
                Passer à « {statusLabels[next]} »
              </Button>
            </form>
          ) : (
            <p className="flex min-h-11 flex-1 items-center text-sm text-muted">Commande {statusLabels[order.status].toLocaleLowerCase("fr")}.</p>
          )}
          {contactHref ? (
            <Button
              href={contactHref}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              aria-label="Prévenir la cliente sur WhatsApp"
              className="shrink-0 px-4"
            >
              <MessageCircle aria-hidden className="size-5" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

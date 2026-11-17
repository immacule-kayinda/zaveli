"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/money";
import { statuses, statusLabels } from "@/lib/orders";
import type { Product } from "@/lib/types";

const initial: FormState = { error: "" };

type Row = { key: number; productId: string; size: string; color: string; quantity: number };

const fieldClass =
  "h-12 w-full rounded-2xl border border-line bg-paper px-3 text-ink outline-none focus:border-clay focus:shadow-[0_0_0_4px_rgba(162,78,52,0.12)]";

export function ManualOrderForm({
  action,
  catalog,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  catalog: Product[];
}) {
  const [state, formAction] = useActionState(action, initial);
  const available = catalog.filter((product) => !product.soldOut);
  const [rows, setRows] = useState<Row[]>(() => [blankRow(0, available)]);
  const [nextKey, setNextKey] = useState(1);

  const total = rows.reduce((sum, row) => {
    const product = catalog.find((item) => item.id === row.productId);
    return sum + (product ? product.price * row.quantity : 0);
  }, 0);

  function update(key: number, patch: Partial<Row>) {
    setRows((current) =>
      current.map((row) => {
        if (row.key !== key) return row;
        const merged = { ...row, ...patch };
        if (patch.productId !== undefined) {
          const product = catalog.find((item) => item.id === patch.productId);
          merged.size = product?.sizes[0] ?? "";
          merged.color = product?.colors[0]?.name ?? "";
        }
        return merged;
      }),
    );
  }

  return (
    <form action={formAction} className="grid gap-6">
      {state.error ? (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      ) : null}

      <fieldset className="grid gap-4">
        <legend className="font-display text-2xl text-ink">Articles</legend>
        {rows.map((row, index) => {
          const product = catalog.find((item) => item.id === row.productId);
          return (
            <div key={row.key} className="grid grid-cols-2 gap-3 rounded-[1.5rem] border border-line bg-paper p-4 sm:grid-cols-[2fr_1fr_1.2fr_5rem_auto] sm:items-end">
              <div className="col-span-2 grid gap-1.5 sm:col-span-1">
                <label htmlFor={`product-${row.key}`} className="text-xs text-muted">Pièce</label>
                <select
                  id={`product-${row.key}`}
                  name="productId"
                  value={row.productId}
                  onChange={(event) => update(row.key, { productId: event.target.value })}
                  className={fieldClass}
                >
                  {available.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} · {formatPrice(item.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor={`size-${row.key}`} className="text-xs text-muted">
                  {product?.sizeKind === "shoe" ? "Pointure" : "Taille"}
                </label>
                <select id={`size-${row.key}`} name="size" value={row.size} onChange={(event) => update(row.key, { size: event.target.value })} className={fieldClass}>
                  {(product?.sizes ?? []).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor={`color-${row.key}`} className="text-xs text-muted">Couleur</label>
                <select id={`color-${row.key}`} name="color" value={row.color} onChange={(event) => update(row.key, { color: event.target.value })} className={fieldClass}>
                  {(product?.colors ?? []).map((color) => (
                    <option key={color.name} value={color.name}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1.5">
                <label htmlFor={`quantity-${row.key}`} className="text-xs text-muted">Qté</label>
                <input
                  id={`quantity-${row.key}`}
                  name="quantity"
                  type="number"
                  min={1}
                  max={8}
                  value={row.quantity}
                  onChange={(event) => update(row.key, { quantity: Math.min(8, Math.max(1, Number(event.target.value) || 1)) })}
                  className={fieldClass}
                />
              </div>
              <button
                type="button"
                disabled={rows.length === 1}
                aria-label={`Retirer l'article ${index + 1}`}
                onClick={() => setRows((current) => current.filter((item) => item.key !== row.key))}
                className="min-h-12 self-end px-2 text-sm text-muted hover:text-clay disabled:opacity-30"
              >
                Retirer
              </button>
            </div>
          );
        })}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm text-clay underline-offset-4 hover:underline"
            onClick={() => {
              setRows((current) => [...current, blankRow(nextKey, available)]);
              setNextKey((value) => value + 1);
            }}
          >
            Ajouter un article
          </button>
          <p className="text-sm text-muted">
            Total : <span className="font-display text-2xl text-clay">{formatPrice(total)}</span>
          </p>
        </div>
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="font-display mb-3 text-2xl text-ink">Cliente</legend>
        <Input id="buyerName" name="buyerName" label="Prénom ou nom" maxLength={60} />
        <Input id="phone" name="phone" label="Téléphone" type="tel" inputMode="tel" autoComplete="off" hint="Avec l'indicatif, ou en 08… pour la RDC." />
        <Input id="city" name="city" label="Ville ou quartier" maxLength={80} />
        <Input id="address" name="address" label="Adresse de livraison" maxLength={200} />
      </fieldset>

      <div className="grid gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-cocoa">
          Statut de départ
        </label>
        <select id="status" name="status" defaultValue="confirmee" className={fieldClass}>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      <Input id="note" name="note" label="Message de la cliente (facultatif)" maxLength={300} />
      <Save />
    </form>
  );
}

function blankRow(key: number, products: Product[]): Row {
  const first = products[0];
  return { key, productId: first?.id ?? "", size: first?.sizes[0] ?? "", color: first?.colors[0]?.name ?? "", quantity: 1 };
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto sm:justify-self-start">
      {pending ? "Enregistrement…" : "Enregistrer la commande"}
    </Button>
  );
}

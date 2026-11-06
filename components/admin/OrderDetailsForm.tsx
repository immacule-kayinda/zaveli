"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Order } from "@/lib/orders";

const initial: FormState = { error: "" };

export function OrderDetailsForm({
  action,
  order,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  order: Order;
}) {
  const [state, formAction] = useActionState(action, initial);
  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="id" value={order.id} />
      {state.error ? (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      ) : null}
      <Input id="buyerName" name="buyerName" label="Prénom ou nom" defaultValue={order.buyerName} maxLength={60} />
      <Input id="phone" name="phone" label="Téléphone" type="tel" defaultValue={order.phone} hint="Avec l'indicatif, ou en 08… pour la RDC." />
      <Input id="city" name="city" label="Ville ou quartier" defaultValue={order.city} maxLength={80} />
      <Input id="address" name="address" label="Adresse de livraison" defaultValue={order.address} maxLength={200} />
      <div className="grid gap-1.5">
        <label htmlFor="internalNote" className="text-sm font-medium text-cocoa">
          Mémo interne
        </label>
        <textarea
          id="internalNote"
          name="internalNote"
          rows={4}
          maxLength={1000}
          defaultValue={order.internalNote}
          placeholder="Visible seulement ici : acompte reçu, livreur, rappel…"
          className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-clay focus:shadow-[0_0_0_4px_rgba(162,78,52,0.12)]"
        />
      </div>
      <Save />
    </form>
  );
}

function Save() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="justify-self-start">
      {pending ? "Enregistrement…" : "Enregistrer"}
    </Button>
  );
}

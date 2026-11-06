"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Settings } from "@/lib/settings";

const initial: FormState = { error: "" };

export function SettingsForm({
  action,
  settings,
  saved,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  settings: Settings;
  saved: boolean;
}) {
  const [state, formAction] = useActionState(action, initial);
  return (
    <form action={formAction} className="grid gap-5">
      {state.error ? (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      ) : saved ? (
        <p role="status" className="rounded-2xl bg-sand px-4 py-3 text-sm text-cocoa">
          Réglages enregistrés. Ils sont visibles tout de suite sur la boutique.
        </p>
      ) : null}

      <Input
        id="whatsappNumber"
        name="whatsappNumber"
        label="Numéro WhatsApp de la boutique"
        type="tel"
        defaultValue={settings.whatsappNumber}
        hint="Là où arrivent les commandes. Avec l'indicatif du pays, par exemple 243810000000."
        required
      />
      <Input
        id="announcement"
        name="announcement"
        label="Bandeau en haut de la boutique"
        defaultValue={settings.announcement}
        maxLength={120}
        required
      />
      <Input
        id="deliveryNote"
        name="deliveryNote"
        label="Information de livraison dans le panier"
        defaultValue={settings.deliveryNote}
        maxLength={200}
        hint="Facultatif. Par exemple : Livraison à Kinshasa, 3 $ à 5 $ selon la commune."
      />
      <label className="flex items-start gap-3 text-sm text-cocoa">
        <input type="checkbox" name="ordersOpen" defaultChecked={settings.ordersOpen} className="mt-0.5 size-4 accent-clay" />
        <span>
          Prendre les commandes
          <span className="block text-xs text-muted">Décochez pour une pause : la boutique reste visible, mais les boutons de commande sont désactivés.</span>
        </span>
      </label>
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

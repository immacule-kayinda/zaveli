"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { login, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initial: FormState = { error: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(login, initial);
  return (
    <form action={formAction} className="mt-8 grid gap-4">
      {state.error ? (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      ) : null}
      <Input id="user" name="user" label="Identifiant" autoComplete="username" required />
      <Input id="password" name="password" label="Mot de passe" type="password" autoComplete="current-password" required />
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Vérification…" : "Entrer"}
    </Button>
  );
}

"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import { login, type LoginState } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initial: LoginState = { error: "", user: "" };

export function LoginForm() {
  const [state, formAction] = useActionState(login, initial);
  return (
    <form action={formAction} className="mt-8 grid gap-4">
      {state.error ? (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      ) : null}
      <Input
        id="user"
        name="user"
        label="Identifiant"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        defaultValue={state.user}
        key={state.user}
        required
      />
      <PasswordField />
      <Submit />
    </form>
  );
}

function PasswordField() {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        id="password"
        name="password"
        label="Mot de passe"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="pr-12"
        required
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        className="absolute right-3 bottom-3 grid size-6 place-items-center rounded-full text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-clay"
      >
        {visible ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
      </button>
    </div>
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

"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { FormState } from "@/app/admin/actions";
import { focalChoices } from "@/lib/products";
import type { CategoryId, Product, SizeKind } from "@/lib/types";

const initial: FormState = { error: "" };

const categories: { value: CategoryId; label: string }[] = [
  { value: "habits", label: "Habits" },
  { value: "accessoires", label: "Accessoires" },
  { value: "chaussures", label: "Chaussures" },
];

const sizeKinds: { value: SizeKind; label: string; hint: string }[] = [
  { value: "letter", label: "Taille S à XL", hint: "S, M, L et XL" },
  { value: "shoe", label: "Pointure", hint: "37 à 41" },
  { value: "unique", label: "Taille unique", hint: "Une seule taille" },
];

export function PieceForm({
  action,
  product,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  product?: Product;
}) {
  const [state, formAction] = useActionState(action, initial);
  const [colors, setColors] = useState(product?.colors ?? [{ name: "", hex: "#F3EBDD" }]);
  const sizeHint = sizeKinds.find((kind) => kind.value === (product?.sizeKind ?? "letter"))?.hint;

  return (
    <form action={formAction} className="grid gap-5">
      {product ? <input type="hidden" name="editing" value={product.id} /> : null}
      <input type="hidden" name="currentImage" value={product?.image ?? ""} />

      {state.error ? (
        <p role="alert" className="rounded-2xl bg-blush px-4 py-3 text-sm text-clay-deep">
          {state.error}
        </p>
      ) : null}

      <Input id="name" name="name" label="Nom" defaultValue={product?.name} required maxLength={80} />
      <Input
        id="piece-id"
        name="id"
        label="Adresse"
        hint={product ? "Elle reste fixe, les liens et le panier en dépendent." : "Laisser vide pour la déduire du nom."}
        defaultValue={product?.id}
        readOnly={Boolean(product)}
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Input id="price" name="price" label="Prix ($)" type="number" min={1} max={100000} step={1} defaultValue={product?.price ?? 40} required />
        <Field label="Rayon" id="category">
          <select id="category" name="category" defaultValue={product?.category ?? "habits"} className={fieldClass}>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Tailles" id="sizeKind" hint={sizeHint}>
        <select id="sizeKind" name="sizeKind" defaultValue={product?.sizeKind ?? "letter"} className={fieldClass}>
          {sizeKinds.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Description" id="description">
        <textarea
          id="description"
          name="description"
          required
          minLength={8}
          maxLength={400}
          rows={4}
          defaultValue={product?.description}
          className={`${fieldClass} h-auto py-3`}
        />
      </Field>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-cocoa">Couleurs</legend>
        {colors.map((color, index) => (
          <div key={index} className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <input
              aria-label={`Teinte ${index + 1}`}
              name="colorHex"
              type="color"
              value={color.hex}
              onChange={(event) => updateColor(index, { hex: event.target.value })}
              className="size-12 cursor-pointer rounded-2xl border border-line bg-paper p-1"
            />
            <input
              aria-label={`Nom de la couleur ${index + 1}`}
              name="colorName"
              value={color.name}
              placeholder="Ivoire"
              onChange={(event) => updateColor(index, { name: event.target.value })}
              className={fieldClass}
            />
            <button
              type="button"
              className="px-2 text-sm text-muted hover:text-clay"
              onClick={() => setColors((current) => current.filter((_, item) => item !== index))}
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          className="justify-self-start text-sm text-clay underline-offset-4 hover:underline"
          onClick={() => setColors((current) => [...current, { name: "", hex: "#C4B6A4" }])}
        >
          Ajouter une couleur
        </button>
      </fieldset>

      <Field label="Photo" id="image" hint={product ? "Laissez vide pour garder la photo actuelle." : "JPEG, PNG ou WebP, 5 Mo maximum."}>
        <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" className="text-sm text-cocoa" />
      </Field>
      <Input id="imageAlt" name="imageAlt" label="Description de la photo" defaultValue={product?.imageAlt} required maxLength={180} />
      <Field label="Cadrage" id="focal">
        <select id="focal" name="focal" defaultValue={product?.focal ?? "object-center"} className={fieldClass}>
          {focalChoices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-3 text-sm text-cocoa">
        <input type="checkbox" name="isNew" defaultChecked={product?.isNew ?? true} className="size-4 accent-clay" />
        Afficher dans les nouveautés
      </label>
      <Submit label={product ? "Enregistrer" : "Ajouter à la collection"} />
    </form>
  );

  function updateColor(index: number, patch: Partial<{ name: string; hex: string }>) {
    setColors((current) => current.map((color, item) => (item === index ? { ...color, ...patch } : color)));
  }
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="justify-self-start">
      {pending ? "Enregistrement…" : label}
    </Button>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-cocoa">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}

const fieldClass =
  "h-12 w-full rounded-2xl border border-line bg-paper px-4 text-ink outline-none focus:border-clay focus:shadow-[0_0_0_4px_rgba(162,78,52,0.12)]";

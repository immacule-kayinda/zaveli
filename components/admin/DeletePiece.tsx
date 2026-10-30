"use client";

import { deletePiece } from "@/app/admin/actions";

export function DeletePiece({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deletePiece}
      onSubmit={(event) => {
        if (!window.confirm(`Retirer ${name} de la collection ?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-sm text-clay underline-offset-4 hover:underline">
        Retirer de la collection
      </button>
    </form>
  );
}

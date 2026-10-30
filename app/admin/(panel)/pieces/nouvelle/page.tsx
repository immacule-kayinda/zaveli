import type { Metadata } from "next";

import { savePiece } from "@/app/admin/actions";
import { PieceForm } from "@/components/admin/PieceForm";

export const metadata: Metadata = { title: "Nouvelle pièce" };

export default function NewPiecePage() {
  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-4xl text-ink">Nouvelle pièce</h1>
      <p className="mt-2 text-sm text-muted">Elle rejoint la collection dès l&apos;enregistrement.</p>
      <div className="mt-8">
        <PieceForm action={savePiece} />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { savePiece } from "@/app/admin/actions";
import { DeletePiece } from "@/components/admin/DeletePiece";
import { PieceForm } from "@/components/admin/PieceForm";
import { getCatalog } from "@/lib/catalog";

type PageProps = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Modifier une pièce" };
export const instant = false;

export default async function EditPiecePage({ params }: PageProps) {
  const { id } = await params;
  const product = (await getCatalog()).find((item) => item.id === id);
  if (!product) notFound();

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-4xl text-ink">{product.name}</h1>
      <p className="mt-2 text-sm text-muted">Modifiez la fiche, ou retirez la pièce de la collection.</p>
      <div className="mt-8">
        <PieceForm action={savePiece} product={product} />
      </div>
      <div className="mt-8 border-t border-line pt-6">
        <DeletePiece id={product.id} name={product.name} />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Listing } from "@/components/catalog/Listing";
import { categoryLabels, filterProducts, isCategoryId } from "@/lib/products";
import type { CategoryId } from "@/lib/types";

const intros: Record<CategoryId, string> = {
  habits:
    "Robes, blouses et mailles. La photo montre la première teinte ; les autres se préparent quand vous les demandez.",
  accessoires: "Sacs et colliers, à poser sur une tenue simple. Taille unique, couleur au choix.",
  chaussures: "La paire de la maison. Les pointures vont de 37 à 41, et la teinte de la photo est le nacré.",
};

type PageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return (["habits", "accessoires", "chaussures"] as const).map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isCategoryId(category)) return { title: "Introuvable" };
  const label = categoryLabels[category];
  return {
    title: label,
    description: `${label} Zaveli. Taille, couleur, puis commande sur WhatsApp.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!isCategoryId(category)) notFound();

  return (
    <Listing
      eyebrow="La collection"
      title={categoryLabels[category]}
      intro={intros[category]}
      products={filterProducts(category)}
      active={category}
    />
  );
}

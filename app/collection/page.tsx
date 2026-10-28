import type { Metadata } from "next";

import { Listing } from "@/components/catalog/Listing";
import { filterProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Collection",
  description:
    "Robes, pulls, accessoires et chaussures Zaveli. Choisissez la taille et la couleur, puis commandez sur WhatsApp.",
};

export default function CollectionPage() {
  return (
    <Listing
      eyebrow="La collection"
      title="Choisir, puis écrire."
      intro="La couleur affichée sur la photo est la première de la liste. Les autres se commandent de la même façon : on prépare la pièce dans la teinte demandée."
      products={filterProducts("tout")}
      active="tout"
    />
  );
}

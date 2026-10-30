import type { Metadata } from "next";

import { Listing } from "@/components/catalog/Listing";
import { getCatalog } from "@/lib/catalog";
import { selectProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Nouveautés",
  description: "Les pièces qui viennent d'arriver chez Zaveli. Taille, couleur, puis commande sur WhatsApp.",
};

export default async function NouveautesPage() {
  const products = selectProducts(await getCatalog(), "nouveautes");
  return (
    <Listing
      eyebrow="Cette saison"
      title="Les nouveautés"
      intro="Les pièces qui viennent d'arriver. Même geste que pour le reste de la collection : taille, couleur, puis un message."
      products={products}
      active="nouveautes"
    />
  );
}

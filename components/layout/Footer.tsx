import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { categoryLabels } from "@/lib/products";
import { routes } from "@/lib/routes";
import type { CategoryId } from "@/lib/types";
import { buildGreetingMessage, whatsAppUrl } from "@/lib/whatsapp";

const rayons: CategoryId[] = ["habits", "accessoires", "chaussures"];

const pages = [
  { href: routes.collection, label: "Toute la collection" },
  { href: routes.nouveautes, label: "Nouveautés" },
  { href: routes.maison, label: "La maison" },
];

export function Footer() {
  return (
    <footer className="bg-cocoa text-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.8fr_1fr]">
        <div>
          <p className="font-display text-4xl">Zaveli</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/75">
            Une petite maison de vêtements et d&apos;accessoires. Les pièces sont choisies une à une, et chaque
            commande se confirme par message.
          </p>
        </div>

        <div>
          <p className="text-xs tracking-[0.18em] text-paper/55 uppercase">Parcourir</p>
          <ul className="mt-4 grid gap-2">
            {pages.map((page) => (
              <li key={page.href}>
                <Link href={page.href} className="text-sm text-paper/85 transition hover:text-blush">
                  {page.label}
                </Link>
              </li>
            ))}
            {rayons.map((category) => (
              <li key={category}>
                <Link href={routes.category(category)} className="text-sm text-paper/85 transition hover:text-blush">
                  {categoryLabels[category]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs tracking-[0.18em] text-paper/55 uppercase">Écrire à la boutique</p>
          <p className="mt-4 text-sm leading-relaxed text-paper/75">
            Une question de taille, de couleur ou de livraison : le message part déjà rédigé.
          </p>
          <Button
            href={whatsAppUrl(buildGreetingMessage())}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            className="mt-5"
          >
            Ouvrir WhatsApp
          </Button>
          <p className="mt-3 text-xs text-paper/50">Réponse en journée, du lundi au samedi.</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-xs text-paper/45">© 2026 Zaveli</div>
    </footer>
  );
}

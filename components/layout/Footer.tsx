"use client";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { Button } from "@/components/ui/Button";
import { filters } from "@/lib/products";
import { scrollToId } from "@/lib/scroll";
import { buildGreetingMessage, whatsAppUrl } from "@/lib/whatsapp";

export function Footer() {
  const { setFilter } = useBoutique();
  const links = filters.filter((filter) => filter.id !== "tout");

  return (
    <footer id="maison" className="bg-cocoa text-paper">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-[1.3fr_0.8fr_1fr]">
        <div>
          <p className="font-display text-4xl">Zaveli</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/75">
            Une petite maison de vêtements et d&apos;accessoires. Les pièces sont choisies une à une, et chaque
            commande se confirme par message.
          </p>
        </div>

        <div>
          <p className="text-xs tracking-[0.18em] text-paper/55 uppercase">Collection</p>
          <ul className="mt-4 grid gap-2">
            {links.map((filter) => (
              <li key={filter.id}>
                <button
                  type="button"
                  className="text-sm text-paper/85 transition hover:text-blush"
                  onClick={() => {
                    setFilter(filter.id);
                    scrollToId("catalogue");
                  }}
                >
                  {filter.label}
                </button>
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

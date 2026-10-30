import type { Metadata } from "next";
import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { buildGreetingMessage, whatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "La maison",
  description:
    "Zaveli, maison de vêtements et d'accessoires à Kinshasa. La commande se confirme par WhatsApp, du lundi au samedi.",
};

const steps = [
  "Vous choisissez la pièce, la taille et la couleur.",
  "Vous l'ajoutez au panier, ou vous la commandez seule.",
  "Le message part sur WhatsApp, déjà rédigé.",
  "On confirme la disponibilité, puis la livraison.",
];

export default function MaisonPage() {
  return (
    <article className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
      <div>
        <p className="text-xs tracking-[0.2em] text-clay uppercase">La maison</p>
        <h1 className="font-display mt-4 text-4xl leading-tight text-ink sm:text-6xl">Zaveli, à Kinshasa.</h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          Une petite maison de vêtements et d&apos;accessoires. Les pièces sont choisies une à une, dans une palette de
          terre, de crème et de rose poudré. Rien ne se paie en ligne : chaque commande se confirme par message.
        </p>

        <h2 className="font-display mt-10 text-2xl text-ink">Comment commander</h2>
        <ol className="mt-4 grid max-w-lg gap-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-4 text-sm leading-relaxed text-cocoa">
              <span className="font-display text-lg text-clay">{index + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <Button
          href={whatsAppUrl(buildGreetingMessage())}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          className="mt-8"
        >
          Écrire à la boutique
        </Button>
        <p className="mt-3 text-xs text-muted">Réponse en journée, du lundi au samedi.</p>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
        <Image
          src="/images/hero-atelier.jpg"
          alt="Portant de pulls et de robes dans des tons crème, sable et chocolat."
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover"
        />
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { getCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { routes } from "@/lib/routes";

export async function Hero() {
  const catalog = await getCatalog();
  const featured = catalog.find((product) => product.id === "robe-ivoire") ?? catalog.find((product) => product.isNew) ?? catalog[0];

  return (
    <section className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20 lg:pb-28">
        <div>
          <p className="text-xs tracking-[0.22em] text-clay uppercase">Maison Zaveli · Kinshasa</p>
          <h1 className="font-display mt-4 max-w-xl text-[2.7rem] leading-[1.02] text-ink sm:text-6xl">
            Des pièces douces,
            <span className="mt-1 block italic">pour les jours ordinaires.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Robes, pulls et petits accessoires dans une palette de terre, de crème et de rose poudré. Vous choisissez
            la taille et la couleur. La commande part sur WhatsApp, et l&apos;on vous répond directement.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={routes.collection} size="lg">
              Voir la collection
            </Button>
            <Button href={routes.nouveautes} variant="outline" size="lg">
              Les nouveautés
            </Button>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-line pt-6">
            <div>
              <dt className="text-[0.68rem] tracking-[0.16em] text-muted uppercase">Commande</dt>
              <dd className="font-display mt-1 text-lg leading-tight text-ink sm:text-xl">Sur WhatsApp</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] tracking-[0.16em] text-muted uppercase">Tailles</dt>
              <dd className="font-display mt-1 text-lg leading-tight text-ink sm:text-xl">S à XL</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] tracking-[0.16em] text-muted uppercase">Livraison</dt>
              <dd className="font-display mt-1 text-lg leading-tight text-ink sm:text-xl">Confirmée</dd>
            </div>
          </dl>
        </div>

        <div className="relative pb-8 sm:pb-4">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sand">
            <Image
              src="/images/hero-atelier.jpg"
              alt="Portant de pulls et de robes dans des tons crème, sable et chocolat."
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
            />
          </div>
          {featured ? (
            <Link
              href={routes.product(featured.id)}
              className="absolute -bottom-2 left-3 flex w-[min(100%,18rem)] items-center gap-3 rounded-[1.35rem] border border-line bg-paper/95 p-3 shadow-[0_18px_50px_-30px_rgba(74,51,44,0.8)] backdrop-blur transition hover:border-clay sm:right-0 sm:left-auto"
            >
              <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-sand">
                <Image src={featured.image} alt="" fill sizes="64px" className={`object-cover ${featured.focal}`} />
              </span>
              <span>
                <span className="block text-[0.68rem] tracking-[0.16em] text-clay uppercase">Nouveau</span>
                <span className="font-display mt-0.5 block text-lg leading-tight text-ink">{featured.name}</span>
                <span className="mt-0.5 block text-sm text-muted">{formatPrice(featured.price)}</span>
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

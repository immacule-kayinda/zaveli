import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";
import { filterProducts } from "@/lib/products";
import { routes } from "@/lib/routes";

export function NouveautesPreview() {
  const pieces = filterProducts("nouveautes").slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20" aria-labelledby="nouveautes-title">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs tracking-[0.2em] text-clay uppercase">Cette saison</p>
          <h2 id="nouveautes-title" className="font-display mt-3 text-4xl text-ink sm:text-5xl">
            Les nouveautés
          </h2>
        </div>
        <Button href={routes.nouveautes} variant="outline">
          Tout voir
        </Button>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {pieces.map((product) => (
          <Link
            key={product.id}
            href={routes.product(product.id)}
            className="group focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:rounded-[1.4rem] focus-visible:outline-clay"
          >
            <span className="relative block aspect-[3/4] overflow-hidden rounded-[1.3rem] bg-sand">
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className={cn("object-cover transition duration-700 ease-out group-hover:scale-[1.03]", product.focal)}
              />
            </span>
            <span className="font-display mt-3 block text-lg leading-tight text-ink group-hover:text-clay">
              {product.name}
            </span>
            <span className="mt-1 block text-sm text-muted">{formatPrice(product.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

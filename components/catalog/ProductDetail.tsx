import Image from "next/image";
import Link from "next/link";

import { ProductPurchase } from "@/components/catalog/ProductPurchase";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";
import { categoryLabels } from "@/lib/products";
import { routes } from "@/lib/routes";
import type { Product } from "@/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const shown = product.colors[0]?.name;

  return (
    <article className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:py-16">
      <div className="lg:sticky lg:top-[calc(var(--banner-h)+var(--header-h)+1.5rem)]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.8rem] bg-sand">
          <Image
            src={product.image}
            alt={product.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className={cn("object-cover", product.focal)}
          />
        </div>
      </div>

      <div>
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <Link href={routes.home} className="transition hover:text-clay">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <Link href={routes.collection} className="transition hover:text-clay">
            Collection
          </Link>
          <span aria-hidden>/</span>
          <Link href={routes.category(product.category)} className="transition hover:text-clay">
            {categoryLabels[product.category]}
          </Link>
        </nav>

        <h1 className="font-display mt-4 text-4xl leading-tight text-ink sm:text-5xl">{product.name}</h1>
        <p className="font-display mt-3 text-2xl text-clay">{formatPrice(product.price)}</p>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">{product.description}</p>
        {shown ? (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            La photo montre la teinte {shown}. Les autres couleurs se préparent à la commande.
          </p>
        ) : null}

        <ProductPurchase product={product} />
      </div>
    </article>
  );
}

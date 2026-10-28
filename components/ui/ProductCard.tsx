import Image from "next/image";
import Link from "next/link";

import { ProductPurchase } from "@/components/catalog/ProductPurchase";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";
import { categoryLabels } from "@/lib/products";
import { routes } from "@/lib/routes";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const productHref = routes.product(product.id);

  return (
    <article className="flex flex-col">
      <Link href={productHref} className="group relative block aspect-[3/4] overflow-hidden rounded-[1.4rem] bg-sand">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className={cn("object-cover transition duration-700 ease-out group-hover:scale-[1.03]", product.focal)}
        />
        {product.isNew ? (
          <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-3 py-1 text-xs tracking-wide text-cocoa">
            Nouveau
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link
              href={routes.category(product.category)}
              className="text-[0.7rem] tracking-[0.16em] text-muted uppercase transition hover:text-clay"
            >
              {categoryLabels[product.category]}
            </Link>
            <h3 className="font-display mt-1 text-2xl leading-tight text-ink">
              <Link href={productHref} className="transition hover:text-clay">
                {product.name}
              </Link>
            </h3>
          </div>
          <p className="font-display shrink-0 text-xl text-clay">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>
        <ProductPurchase product={product} />
      </div>
    </article>
  );
}

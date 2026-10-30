import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { getCatalog } from "@/lib/catalog";
import { formatPrice } from "@/lib/money";
import { categoryLabels } from "@/lib/products";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminHomePage() {
  const catalog = await getCatalog();

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-ink">La collection</h1>
          <p className="mt-2 text-sm text-muted">
            {catalog.length > 1 ? `${catalog.length} pièces` : `${catalog.length} pièce`}. Les changements sont visibles
            tout de suite sur la boutique.
          </p>
        </div>
        <Button href="/admin/pieces/nouvelle">Ajouter une pièce</Button>
      </div>
      <ul className="mt-8 divide-y divide-line rounded-[1.5rem] border border-line bg-paper">
        {catalog.map((product) => (
          <li key={product.id}>
            <Link href={`/admin/pieces/${product.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-sand/40">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-sand">
                <Image src={product.image} alt="" fill sizes="64px" className={`object-cover ${product.focal}`} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-xl text-ink">{product.name}</span>
                <span className="text-sm text-muted">
                  {categoryLabels[product.category]}
                  {product.isNew ? " · Nouveau" : ""}
                </span>
              </span>
              <span className="font-display text-lg text-clay">{formatPrice(product.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

import { CatalogNav } from "@/components/catalog/CatalogNav";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/Button";
import type { FilterId } from "@/lib/products";
import { routes } from "@/lib/routes";
import type { Product } from "@/lib/types";

type ListingProps = {
  eyebrow: string;
  title: string;
  intro: string;
  products: Product[];
  active: FilterId;
};

export function Listing({ eyebrow, title, intro, products, active }: ListingProps) {
  const pieceLabel = products.length > 1 ? `${products.length} pièces` : `${products.length} pièce`;

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs tracking-[0.2em] text-clay uppercase">{eyebrow}</p>
          <h1 className="font-display mt-3 text-4xl text-ink sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{intro}</p>
        </div>
        <p className="text-sm text-muted">{pieceLabel}</p>
      </div>

      <CatalogNav active={active} />

      {products.length === 0 ? (
        <div className="mt-12 rounded-[1.5rem] border border-dashed border-line bg-paper px-6 py-12 text-center">
          <p className="font-display text-2xl text-ink">Rien dans ce rayon pour le moment.</p>
          <Button href={routes.collection} className="mt-6">
            Voir toute la collection
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

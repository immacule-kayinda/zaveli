"use client";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { ProductCard } from "@/components/ui/ProductCard";
import { cn } from "@/lib/cn";
import { filterProducts, filters } from "@/lib/products";

export function Catalog() {
  const { filter, setFilter } = useBoutique();
  const visible = filterProducts(filter);
  const pieceLabel = visible.length > 1 ? `${visible.length} pièces` : `${visible.length} pièce`;

  return (
    <section id="catalogue" className="mx-auto max-w-6xl px-5 py-16 sm:py-20" aria-labelledby="catalogue-title">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs tracking-[0.2em] text-clay uppercase">La collection</p>
          <h2 id="catalogue-title" className="font-display mt-3 text-4xl text-ink sm:text-5xl">
            Choisir, puis écrire.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            La couleur affichée sur la photo est la première de la liste. Les autres se commandent de la même façon :
            on prépare la pièce dans la teinte demandée.
          </p>
        </div>
        <p className="text-sm text-muted">{pieceLabel}</p>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer la collection">
        {filters.map((item) => {
          const selected = item.id === filter;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(item.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm transition duration-200",
                selected ? "bg-cocoa text-paper" : "bg-paper text-cocoa ring-1 ring-line hover:ring-clay",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-12 rounded-[1.5rem] border border-dashed border-line bg-paper px-6 py-12 text-center">
          <p className="font-display text-2xl text-ink">Rien dans ce rayon pour le moment.</p>
          <button type="button" className="mt-4 text-sm text-clay underline-offset-4 hover:underline" onClick={() => setFilter("tout")}>
            Voir toute la collection
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

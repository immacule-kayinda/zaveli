import Image from "next/image";
import Link from "next/link";

import { getCatalog } from "@/lib/catalog";
import { categoryLabels } from "@/lib/products";
import { routes } from "@/lib/routes";
import type { CategoryId } from "@/lib/types";

const covers: Record<CategoryId, string> = {
  habits: "robe-ivoire",
  accessoires: "sac-emeraude",
  chaussures: "escarpins-nacre",
};

export async function CategoryEntries() {
  const catalog = await getCatalog();
  const entries = (Object.keys(covers) as CategoryId[]).map((category) => {
    const cover =
      catalog.find((product) => product.id === covers[category]) ??
      catalog.find((product) => product.category === category);
    const count = catalog.filter((product) => product.category === category).length;
    return { category, cover, count };
  });

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20" aria-labelledby="rayons-title">
      <div className="max-w-xl">
        <p className="text-xs tracking-[0.2em] text-clay uppercase">Les rayons</p>
        <h2 id="rayons-title" className="font-display mt-3 text-4xl text-ink sm:text-5xl">
          Trois façons d&apos;entrer.
        </h2>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {entries.map(({ category, cover, count }) => {
          if (!cover || count === 0) return null;
          const pieceLabel = count > 1 ? `${count} pièces` : `${count} pièce`;
          return (
            <Link
              key={category}
              href={routes.category(category)}
              className="group relative block aspect-[3/4] overflow-hidden rounded-[1.6rem] bg-sand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay"
            >
              <Image
                src={cover.image}
                alt={cover.imageAlt}
                fill
                sizes="(min-width: 768px) 30vw, 100vw"
                className={`object-cover transition duration-700 ease-out group-hover:scale-[1.03] ${cover.focal}`}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa/85 via-cocoa/35 to-transparent p-5 pt-20">
                <span className="font-display block text-3xl text-paper">{categoryLabels[category]}</span>
                <span className="mt-1 block text-sm text-paper/80">{pieceLabel}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

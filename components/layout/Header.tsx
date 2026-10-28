"use client";

import { ShoppingBag } from "lucide-react";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { scrollToId } from "@/lib/scroll";

export function Header() {
  const { count, openCart, setFilter } = useBoutique();
  const countLabel = count > 1 ? `${count} articles` : count === 1 ? "1 article" : "panier vide";

  function browse(filter: "tout" | "nouveautes") {
    setFilter(filter);
    scrollToId("catalogue");
  }

  return (
    <header
      className="fixed inset-x-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-md"
      style={{ top: "var(--banner-h)", height: "var(--header-h)" }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5">
        <a href="#contenu" className="font-display text-[1.7rem] leading-none tracking-tight text-ink">
          Zaveli
        </a>

        <nav className="hidden items-center gap-7 text-sm text-cocoa md:flex" aria-label="Sections">
          <button type="button" className="transition hover:text-clay" onClick={() => browse("tout")}>
            Collection
          </button>
          <button type="button" className="transition hover:text-clay" onClick={() => browse("nouveautes")}>
            Nouveautés
          </button>
          <a href="#maison" className="transition hover:text-clay">
            La maison
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-sm text-cocoa transition hover:text-clay md:hidden"
            onClick={() => browse("tout")}
          >
            Collection
          </button>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Ouvrir le panier, ${countLabel}`}
            className="relative grid size-11 place-items-center rounded-full border border-line bg-paper text-cocoa transition hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
          >
            <ShoppingBag aria-hidden className="size-[1.15rem]" />
            {count > 0 ? (
              <span
                aria-hidden
                className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.68rem] leading-5 text-paper"
              >
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}

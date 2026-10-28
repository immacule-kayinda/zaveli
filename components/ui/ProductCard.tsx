"use client";

import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";
import { toOrderLine } from "@/lib/order";
import { categoryLabels } from "@/lib/products";
import type { Product } from "@/lib/types";
import { buildOrderMessage, whatsAppUrl } from "@/lib/whatsapp";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, buyerName, city } = useBoutique();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0]?.name ?? "");
  const [error, setError] = useState("");

  const sizeLegend = product.sizeKind === "shoe" ? "Pointure" : "Taille";
  const ready = Boolean(size && color);

  function requireSelection(): boolean {
    if (ready) {
      setError("");
      return true;
    }
    setError("Choisissez une taille et une couleur.");
    return false;
  }

  function addToCart() {
    if (!requireSelection()) return;
    addItem({ productId: product.id, size, color });
  }

  const orderHref = ready
    ? whatsAppUrl(
        buildOrderMessage([toOrderLine(product, size, color, 1)], {
          buyerName,
          city,
        }),
      )
    : undefined;

  return (
    <article id={`produit-${product.id}`} className="flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[1.4rem] bg-sand">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          className={cn("object-cover transition duration-700 ease-out hover:scale-[1.03]", product.focal)}
        />
        {product.isNew ? (
          <span className="absolute top-3 left-3 rounded-full bg-paper/95 px-3 py-1 text-xs tracking-wide text-cocoa">
            Nouveau
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.7rem] tracking-[0.16em] text-muted uppercase">{categoryLabels[product.category]}</p>
            <h3 className="font-display mt-1 text-2xl leading-tight text-ink">{product.name}</h3>
          </div>
          <p className="font-display shrink-0 text-xl text-clay">{formatPrice(product.price)}</p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted">{product.description}</p>

        <fieldset className="mt-4">
          <legend className="mb-2 text-sm text-cocoa">
            Couleur <span className="text-muted">· {color}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((swatch) => {
              const selected = swatch.name === color;
              return (
                <button
                  key={swatch.name}
                  type="button"
                  aria-label={swatch.name}
                  aria-pressed={selected}
                  onClick={() => {
                    setColor(swatch.name);
                    setError("");
                  }}
                  className={cn(
                    "size-7 rounded-full border border-ink/10 ring-offset-2 ring-offset-ivory transition",
                    selected ? "ring-2 ring-clay" : "hover:ring-2 hover:ring-line",
                  )}
                  style={{ backgroundColor: swatch.hex }}
                />
              );
            })}
          </div>
        </fieldset>

        {product.sizeKind === "unique" ? (
          <p className="mt-4 text-sm text-cocoa">
            Taille <span className="text-muted">· unique</span>
          </p>
        ) : (
          <fieldset className="mt-4">
            <legend className="mb-2 text-sm text-cocoa">
              {sizeLegend} <span className="text-muted">· {size}</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((option) => {
                const selected = option === size;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSize(option);
                      setError("");
                    }}
                    className={cn(
                      "min-w-10 rounded-full border px-3 py-1.5 text-sm transition duration-200",
                      selected
                        ? "border-cocoa bg-cocoa text-paper"
                        : "border-line bg-paper text-cocoa hover:border-clay",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {error ? (
          <p role="alert" className="mt-3 text-sm text-clay">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-2">
          <Button className="w-full" onClick={addToCart}>
            Ajouter au panier
          </Button>
          {orderHref ? (
            <Button href={orderHref} target="_blank" rel="noopener noreferrer" variant="outline" className="w-full">
              <MessageCircle aria-hidden className="size-4 shrink-0" />
              Commander directement sur WhatsApp
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={requireSelection}>
              <MessageCircle aria-hidden className="size-4 shrink-0" />
              Commander directement sur WhatsApp
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

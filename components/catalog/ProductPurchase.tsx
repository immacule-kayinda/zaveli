"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { toOrderLine } from "@/lib/order";
import type { Product } from "@/lib/types";
import { buildOrderMessage, whatsAppUrl } from "@/lib/whatsapp";

export function ProductPurchase({ product }: { product: Product }) {
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
    <div>
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
                    selected ? "border-cocoa bg-cocoa text-paper" : "border-line bg-paper text-cocoa hover:border-clay",
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
  );
}

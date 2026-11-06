"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem, checkout, checkingOut, checkoutError, settings } = useBoutique();
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

  function orderNow() {
    if (!requireSelection()) return;
    void checkout([{ productId: product.id, size, color, quantity: 1 }]);
  }

  if (product.soldOut) {
    return (
      <p className="mt-5 rounded-2xl bg-sand px-4 py-3 text-sm text-cocoa">
        Cette pièce est épuisée pour le moment. Écrivez-nous pour être prévenue d&apos;un retour.
      </p>
    );
  }

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

      {error || checkoutError ? (
        <p role="alert" className="mt-3 text-sm text-clay">
          {error || checkoutError}
        </p>
      ) : null}

      <div className="mt-5 grid gap-2">
        <Button className="w-full" onClick={addToCart} disabled={!settings.ordersOpen}>
          Ajouter au panier
        </Button>
        <Button variant="outline" className="w-full" onClick={orderNow} disabled={checkingOut || !settings.ordersOpen}>
          <MessageCircle aria-hidden className="size-4 shrink-0" />
          {checkingOut ? "Enregistrement…" : "Commander directement sur WhatsApp"}
        </Button>
        {!settings.ordersOpen ? (
          <p className="text-center text-xs text-muted">Les commandes sont fermées pour le moment.</p>
        ) : null}
      </div>
    </div>
  );
}

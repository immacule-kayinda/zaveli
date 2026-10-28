"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/money";
import { linesFromCart } from "@/lib/order";
import { getProduct } from "@/lib/products";
import { buildOrderMessage, whatsAppUrl } from "@/lib/whatsapp";

export function CartDrawer() {
  const {
    lines,
    buyerName,
    city,
    total,
    count,
    isCartOpen,
    closeCart,
    setQuantity,
    removeItem,
    updateVariant,
    setDetails,
  } = useBoutique();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const openSelects = useRef(0);

  function trackSelect(open: boolean) {
    if (open) {
      openSelects.current += 1;
      return;
    }
    queueMicrotask(() => {
      openSelects.current = Math.max(0, openSelects.current - 1);
    });
  }

  useEffect(() => {
    if (!isCartOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (openSelects.current > 0) return;
        closeCart();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      previouslyFocused?.focus();
    };
  }, [isCartOpen, closeCart]);

  const orderLines = linesFromCart(lines);
  const checkoutHref =
    orderLines.length > 0 ? whatsAppUrl(buildOrderMessage(orderLines, { buyerName, city })) : undefined;
  const countLabel = count > 1 ? `${count} articles` : count === 1 ? "1 article" : "Aucun article";

  return (
    <div className={cn("fixed inset-0 z-50", isCartOpen ? "" : "pointer-events-none")} aria-hidden={!isCartOpen}>
      <button
        type="button"
        aria-label="Fermer le panier"
        tabIndex={isCartOpen ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-300 motion-reduce:transition-none",
          isCartOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={closeCart}
      />
      <aside
        ref={panelRef}
        role={isCartOpen ? "dialog" : undefined}
        aria-modal={isCartOpen || undefined}
        aria-labelledby={titleId}
        inert={isCartOpen ? undefined : true}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-paper shadow-[-24px_0_60px_-36px_rgba(44,40,38,0.45)] transition-transform duration-300 ease-out motion-reduce:transition-none",
          isCartOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5">
          <div>
            <h2 id={titleId} className="font-display text-3xl text-ink">
              Votre sélection
            </h2>
            <p className="mt-1 text-sm text-muted">{countLabel}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            aria-label="Fermer"
            className="grid size-10 place-items-center rounded-full border border-line text-cocoa transition hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-5 py-10">
            <p className="font-display text-2xl text-ink">Le panier est encore vide.</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              Choisissez une taille et une couleur, puis ajoutez la pièce. Vous pourrez tout envoyer en un message.
            </p>
            <Button className="mt-6 self-start" onClick={closeCart} href="/collection">
              Voir la collection
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {lines.map((line) => {
                const product = getProduct(line.productId);
                if (!product) return null;
                const lineTotal = product.price * line.quantity;
                return (
                  <li key={line.lineId} className="grid grid-cols-[4.5rem_1fr] gap-3 border-b border-line pb-5">
                    <div className="relative h-24 overflow-hidden rounded-2xl bg-sand">
                      <Image src={product.image} alt="" fill sizes="72px" className={cn("object-cover", product.focal)} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-display text-lg leading-tight text-ink">{product.name}</p>
                        <p className="shrink-0 text-sm text-cocoa">{formatPrice(lineTotal)}</p>
                      </div>
                      {line.quantity > 1 ? (
                        <p className="mt-0.5 text-xs text-muted">
                          {line.quantity} × {formatPrice(product.price)}
                        </p>
                      ) : null}

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {product.sizeKind === "unique" ? (
                          <p className="text-sm text-cocoa">
                            Taille <span className="text-muted">· unique</span>
                          </p>
                        ) : (
                          <Select
                            id={`${line.lineId}-size`}
                            label={product.sizeKind === "shoe" ? "Pointure" : "Taille"}
                            density="compact"
                            value={line.size}
                            onOpenChange={trackSelect}
                            onValueChange={(size) => updateVariant(line.lineId, size, line.color)}
                            options={product.sizes.map((size) => ({ value: size, label: size }))}
                          />
                        )}
                        <Select
                          id={`${line.lineId}-color`}
                          label="Couleur"
                          density="compact"
                          value={line.color}
                          onOpenChange={trackSelect}
                          onValueChange={(color) => updateVariant(line.lineId, line.size, color)}
                          options={product.colors.map((swatch) => ({
                            value: swatch.name,
                            label: swatch.name,
                            swatch: swatch.hex,
                          }))}
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            aria-label={`Diminuer la quantité de ${product.name}`}
                            onClick={() => setQuantity(line.lineId, line.quantity - 1)}
                            disabled={line.quantity <= 1}
                            className="grid size-9 place-items-center rounded-full text-cocoa disabled:opacity-35"
                          >
                            <Minus aria-hidden className="size-3.5" />
                          </button>
                          <span className="min-w-6 text-center text-sm" aria-live="polite">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Augmenter la quantité de ${product.name}`}
                            onClick={() => setQuantity(line.lineId, line.quantity + 1)}
                            disabled={line.quantity >= 8}
                            className="grid size-9 place-items-center rounded-full text-cocoa disabled:opacity-35"
                          >
                            <Plus aria-hidden className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.lineId)}
                          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-clay"
                        >
                          <Trash2 aria-hidden className="size-3.5" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-line px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <div className="grid gap-3">
                <Input
                  id="buyer-name"
                  label="Prénom (facultatif)"
                  value={buyerName}
                  autoComplete="given-name"
                  placeholder="Pour qu'on sache à qui répondre"
                  onChange={(event) => setDetails({ buyerName: event.target.value })}
                />
                <Input
                  id="buyer-city"
                  label="Ville ou quartier (facultatif)"
                  value={city}
                  autoComplete="address-level2"
                  placeholder="Pour estimer la livraison"
                  onChange={(event) => setDetails({ city: event.target.value })}
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="text-sm text-muted">Total</p>
                <p className="font-display text-3xl text-ink">{formatPrice(total)}</p>
              </div>
              {checkoutHref ? (
                <Button
                  href={checkoutHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full"
                  size="lg"
                >
                  Finaliser la commande sur WhatsApp
                </Button>
              ) : null}
              <p className="mt-3 text-center text-xs leading-relaxed text-muted">
                WhatsApp s&apos;ouvre avec le message déjà écrit. Il ne reste plus qu&apos;à l&apos;envoyer.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

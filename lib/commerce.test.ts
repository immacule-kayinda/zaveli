import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { cartReducer, emptyCart, parseStoredCart, sanitizeCart } from "./cart";
import { formatPrice } from "./money";
import { products } from "./products";
import { buildOrderMessage, whatsAppUrl } from "./whatsapp";

describe("formatPrice", () => {
  it("écrit les montants comme dans le message de commande", () => {
    assert.equal(formatPrice(25), "25$");
    assert.equal(formatPrice(1200), "1\u202f200$");
  });
});

describe("buildOrderMessage", () => {
  it("structure une commande de plusieurs articles", () => {
    const message = buildOrderMessage([
      {
        name: "Robe Terracotta",
        size: "M",
        color: "Sienne",
        sizeKind: "letter",
        quantity: 1,
        unitPrice: 25,
      },
      {
        name: "Sac Cuir Marron",
        size: "unique",
        color: "",
        sizeKind: "unique",
        quantity: 1,
        unitPrice: 40,
      },
    ]);

    assert.equal(
      message,
      [
        "Bonjour ! Je souhaite passer la commande suivante :",
        "",
        "🛍️ ARTICLES :",
        "- Robe Terracotta (Taille M, Couleur Sienne) x1 — 25$",
        "- Sac Cuir Marron (Taille unique) x1 — 40$",
        "",
        "💰 TOTAL : 65$",
        "",
        "Merci de me confirmer la disponibilité et les modalités de livraison.",
      ].join("\n"),
    );
  });

  it("ajoute le prénom et la ville seulement s'ils sont remplis", () => {
    const message = buildOrderMessage(
      [
        {
          name: "Escarpins Nacré",
          size: "38",
          color: "Nacré",
          sizeKind: "shoe",
          quantity: 2,
          unitPrice: 44,
        },
      ],
      { buyerName: "  Amina ", city: "Gombe" },
    );

    assert.match(message, /Pointure 38, Couleur Nacré\) x2 — 88\$/);
    assert.match(message, /👤 Prénom : Amina/);
    assert.match(message, /📍 Livraison : Gombe/);
    assert.match(message, /💰 TOTAL : 88\$/);
  });
});

describe("whatsAppUrl", () => {
  it("garde uniquement les chiffres du numéro et encode le texte", () => {
    const url = whatsAppUrl("Bonjour\nZaveli", "+243 81 00 00 00");
    const parsed = new URL(url);
    assert.equal(parsed.origin + parsed.pathname, "https://wa.me/24381000000");
    assert.equal(parsed.searchParams.get("text"), "Bonjour\nZaveli");
  });
});

describe("cartReducer", () => {
  it("fusionne deux ajouts de la même variante", () => {
    const once = cartReducer(emptyCart, {
      type: "add",
      productId: "robe-ivoire",
      size: "M",
      color: "Ivoire",
    });
    const twice = cartReducer(once, {
      type: "add",
      productId: "robe-ivoire",
      size: "M",
      color: "Ivoire",
    });
    assert.equal(twice.lines.length, 1);
    assert.equal(twice.lines[0]?.quantity, 2);
  });

  it("borne la quantité", () => {
    const start = cartReducer(emptyCart, {
      type: "add",
      productId: "robe-ivoire",
      size: "S",
      color: "Ivoire",
    });
    const lineId = start.lines[0]?.lineId ?? "";
    const raised = cartReducer(start, { type: "setQuantity", lineId, quantity: 40 });
    const lowered = cartReducer(start, { type: "setQuantity", lineId, quantity: 0 });
    assert.equal(raised.lines[0]?.quantity, 8);
    assert.equal(lowered.lines[0]?.quantity, 1);
  });

  it("fusionne une variante déjà présente dans le panier", () => {
    let state = cartReducer(emptyCart, {
      type: "add",
      productId: "robe-ivoire",
      size: "M",
      color: "Ivoire",
    });
    state = cartReducer(state, { type: "setQuantity", lineId: state.lines[0]?.lineId ?? "", quantity: 2 });
    state = cartReducer(state, {
      type: "add",
      productId: "robe-ivoire",
      size: "L",
      color: "Ivoire",
    });
    const moved = cartReducer(state, {
      type: "updateVariant",
      lineId: state.lines[1]?.lineId ?? "",
      size: "M",
      color: "Ivoire",
    });
    assert.equal(moved.lines.length, 1);
    assert.equal(moved.lines[0]?.quantity, 3);
    assert.equal(moved.lines[0]?.size, "M");
  });
});

describe("sanitizeCart", () => {
  it("ignore les lignes inconnues et garde les coordonnées", () => {
    const clean = sanitizeCart(
      {
        buyerName: "Amina",
        city: "Gombe",
        lines: [
          { productId: "inconnu", size: "M", color: "Ivoire", quantity: 1 },
          { productId: "collier-lune", size: "unique", color: "Or", quantity: 2 },
          { productId: "collier-lune", size: "unique", color: "Vert", quantity: 1 },
        ],
      },
      products,
    );
    assert.equal(clean.lines.length, 1);
    assert.equal(clean.lines[0]?.quantity, 2);
    assert.equal(clean.buyerName, "Amina");
    assert.equal(clean.city, "Gombe");
  });

  it("retombe sur un panier vide si le stockage est illisible", () => {
    assert.deepEqual(parseStoredCart("{", products), emptyCart);
  });
});

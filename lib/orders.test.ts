import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { blobDocumentId } from "./doc-store";
import {
  buildOrder,
  changeStatus,
  computeStats,
  customerMessage,
  customersFrom,
  filterOrders,
  newOrderId,
  normalizePhone,
  nextStatus,
  ORDER_ID_PATTERN,
  ordersToCsv,
  parseOrder,
  type Order,
} from "./orders";
import { products } from "./products";
import { parseSettings, validateSettings } from "./settings";

const NOW = Date.UTC(2026, 10, 6, 10, 0, 0);
const robe = products[0]!;

function order(overrides: Partial<Order> = {}): Order {
  const built = buildOrder(
    { lines: [{ productId: robe.id, size: "M", color: robe.colors[0]!.name, quantity: 2 }], buyerName: "Amina", phone: "0812345678", city: "Gombe" },
    products,
    { id: "ZM-ABCDEF", now: NOW, source: "site" },
  );
  assert.ok(built.ok);
  return { ...built.order, ...overrides };
}

describe("newOrderId", () => {
  it("produit un numéro lisible, sans caractères ambigus", () => {
    for (let index = 0; index < 200; index += 1) assert.match(newOrderId(), ORDER_ID_PATTERN);
    assert.equal(newOrderId(() => 0), "ZM-222222");
  });
});

describe("normalizePhone", () => {
  it("rattache un numéro local à la RDC et nettoie le reste", () => {
    assert.equal(normalizePhone("081 234 5678"), "243812345678");
    assert.equal(normalizePhone("+243 81 234 5678"), "243812345678");
    assert.equal(normalizePhone("00243812345678"), "243812345678");
  });
});

describe("buildOrder", () => {
  it("prend les prix dans le catalogue et regroupe les lignes identiques", () => {
    const built = buildOrder(
      {
        lines: [
          { productId: robe.id, size: "M", color: robe.colors[0]!.name, quantity: 1 },
          { productId: robe.id, size: "M", color: robe.colors[0]!.name, quantity: 2 },
        ],
      },
      products,
      { id: "ZM-ABCDEF", now: NOW, source: "site" },
    );
    assert.ok(built.ok);
    assert.equal(built.order.lines.length, 1);
    assert.equal(built.order.lines[0]!.quantity, 3);
    assert.equal(built.order.total, robe.price * 3);
    assert.equal(built.order.status, "nouvelle");
  });

  it("refuse une pièce inconnue, une taille absente, une quantité folle et une pièce épuisée", () => {
    const base = { size: "M", color: robe.colors[0]!.name, quantity: 1 };
    const attempt = (line: object, catalog = products) =>
      buildOrder({ lines: [{ productId: robe.id, ...base, ...line }] }, catalog, { id: "ZM-ABCDEF", now: NOW, source: "site" });
    assert.equal(attempt({ productId: "inconnue" }).ok, false);
    assert.equal(attempt({ size: "XXL" }).ok, false);
    assert.equal(attempt({ color: "Fluo" }).ok, false);
    assert.equal(attempt({ quantity: 0 }).ok, false);
    assert.equal(attempt({ quantity: 1.5 }).ok, false);
    assert.equal(attempt({ quantity: 99 }).ok, false);
    assert.equal(attempt({}, [{ ...robe, soldOut: true }]).ok, false);
    assert.equal(buildOrder({ lines: [] }, products, { id: "ZM-ABCDEF", now: NOW, source: "site" }).ok, false);
  });

  it("refuse un téléphone trop court", () => {
    const built = buildOrder(
      { lines: [{ productId: robe.id, size: "M", color: robe.colors[0]!.name, quantity: 1 }], phone: "12" },
      products,
      { id: "ZM-ABCDEF", now: NOW, source: "site" },
    );
    assert.equal(built.ok, false);
  });
});

describe("statuts", () => {
  it("garde l'historique et ignore un changement sans effet", () => {
    const start = order();
    const confirmed = changeStatus(start, "confirmee", NOW + 1000);
    assert.equal(confirmed.status, "confirmee");
    assert.deepEqual(confirmed.history.map((event) => event.status), ["nouvelle", "confirmee"]);
    assert.equal(changeStatus(confirmed, "confirmee", NOW + 2000), confirmed);
    assert.equal(nextStatus("livree"), null);
    assert.equal(nextStatus("nouvelle"), "confirmee");
  });
});

describe("parseOrder", () => {
  it("relit une commande enregistrée et refuse un fichier abîmé", () => {
    const stored = order();
    assert.deepEqual(parseOrder(JSON.parse(JSON.stringify(stored))), stored);
    assert.equal(parseOrder({ ...stored, id: "../etc" }), null);
    assert.equal(parseOrder({ ...stored, status: "perdue" }), null);
    assert.equal(parseOrder({ ...stored, lines: [] }), null);
    assert.equal(parseOrder(null), null);
  });
});

describe("filterOrders", () => {
  it("cherche par numéro, nom, ville, pièce et téléphone", () => {
    const orders = [order(), order({ id: "ZM-GHJKMN", buyerName: "Chantal", phone: "", city: "Limete", status: "livree" })];
    assert.equal(filterOrders(orders, { query: "amina" }).length, 1);
    assert.equal(filterOrders(orders, { query: "zm-ghj" }).length, 1);
    assert.equal(filterOrders(orders, { query: "limete" }).length, 1);
    assert.equal(filterOrders(orders, { query: "robe" }).length, 2);
    assert.equal(filterOrders(orders, { query: "0812345678" }).length, 0, "le numéro est stocké au format international");
    assert.equal(filterOrders(orders, { query: "243812345678" }).length, 1);
    assert.equal(filterOrders(orders, { status: "livree" }).length, 1);
    assert.equal(filterOrders(orders, { status: "n'importe quoi" }).length, 2);
  });
});

describe("computeStats", () => {
  it("compte les ventes sans les annulations", () => {
    const orders = [
      order(),
      order({ id: "ZM-GHJKMN", status: "annulee" }),
      order({ id: "ZM-PQRSTU", createdAt: NOW - 40 * 24 * 3600 * 1000, status: "livree" }),
    ];
    const stats = computeStats(orders, NOW);
    assert.equal(stats.orderCount, 3);
    assert.equal(stats.toProcess, 1);
    assert.equal(stats.revenue, robe.price * 4);
    assert.equal(stats.revenue30Days, robe.price * 2);
    assert.equal(stats.today, 2);
    assert.equal(stats.daily.length, 14);
    assert.equal(stats.daily.at(-1)!.count, 2);
    assert.equal(stats.topProducts[0]!.quantity, 4);
    assert.equal(stats.averageBasket, robe.price * 2);
  });

  it("ne plante pas sans commande", () => {
    const stats = computeStats([], NOW);
    assert.equal(stats.averageBasket, 0);
    assert.equal(stats.topProducts.length, 0);
  });
});

describe("customersFrom", () => {
  it("regroupe par téléphone et classe par achats", () => {
    const customers = customersFrom([
      order(),
      order({ id: "ZM-GHJKMN", createdAt: NOW + 5000, buyerName: "" }),
      order({ id: "ZM-PQRSTU", phone: "", buyerName: "Chantal", status: "annulee" }),
      order({ id: "ZM-WXYZ23", phone: "", buyerName: "" }),
    ]);
    assert.equal(customers.length, 2);
    assert.equal(customers[0]!.orderCount, 2);
    assert.equal(customers[0]!.name, "Amina");
    assert.equal(customers[0]!.spent, robe.price * 4);
    assert.equal(customers[1]!.spent, 0);
  });
});

describe("customerMessage", () => {
  it("salue la cliente et rappelle le numéro", () => {
    const message = customerMessage(order({ status: "expediee" }), "ZAVÉLYmarket");
    assert.match(message, /^Bonjour Amina, votre commande ZM-ABCDEF/);
    assert.match(message, /en route/);
  });
});

describe("ordersToCsv", () => {
  it("échappe les guillemets et neutralise les formules", () => {
    const csv = ordersToCsv([order({ buyerName: "=HYPERLINK(\"x\")", note: "a;b" })]);
    const [header, row] = csv.split("\r\n");
    assert.ok(header!.startsWith("Numéro;Date;Statut"));
    assert.ok(row!.includes("\"'=HYPERLINK(\"\"x\"\")\""));
    assert.ok(row!.includes("\"a;b\""));
  });
});

describe("réglages", () => {
  it("rejette un numéro incomplet et lit les valeurs par défaut", () => {
    assert.equal(validateSettings({ whatsappNumber: "12", announcement: "Livraison rapide", ordersOpen: true }).ok, false);
    assert.equal(validateSettings({ whatsappNumber: "0812345678", announcement: "Ok", ordersOpen: true }).ok, false);
    const ok = validateSettings({ whatsappNumber: "0812345678", announcement: "Soldes ce week-end", ordersOpen: false });
    assert.ok(ok.ok);
    assert.equal(ok.settings.whatsappNumber, "243812345678");
    assert.equal(ok.settings.ordersOpen, false);
    assert.equal(parseSettings(null).ordersOpen, true);
    assert.equal(parseSettings("{").ordersOpen, true);
  });
});

describe("blobDocumentId", () => {
  it("retrouve l'identifiant dans le nom du fichier", () => {
    assert.equal(blobDocumentId("orders/ZM-ABCDEF--1793961008061.json", "orders"), "ZM-ABCDEF");
    assert.equal(blobDocumentId("settings/site--12.json", "settings"), "site");
    assert.equal(blobDocumentId("catalog/products-12.json", "orders"), null);
  });
});

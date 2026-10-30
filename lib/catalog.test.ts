import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { imageFilename, parseCatalog, slugify, toProduct, type PieceDraft } from "./catalog";
import { products } from "./products";

const draft: PieceDraft = {
  id: "",
  name: "Robe Ivoire !",
  price: 54,
  category: "habits",
  description: "Coton souple, boutons sur toute la longueur.",
  sizeKind: "letter",
  colors: [
    { name: "Ivoire", hex: "#F3EBDD" },
    { name: "  ", hex: "#000000" },
  ],
  image: "/images/robe-ivoire.jpg",
  imageAlt: "Robe chemise ivoire, ceinture nouée.",
  focal: "object-center",
  isNew: true,
};

describe("slugify", () => {
  it("retire les accents et la ponctuation", () => {
    assert.equal(slugify("Écharpe d'été"), "echarpe-d-ete");
    assert.equal(slugify("   "), "");
  });

  it("donne un nom de fichier sans espace", () => {
    assert.equal(imageFilename("Foulard Brique", "jpg", 5), "foulard-brique-5.jpg");
  });
});

describe("toProduct", () => {
  it("déduit l'adresse du nom et ignore les couleurs vides", () => {
    const parsed = toProduct(draft);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.product.id, "robe-ivoire");
    assert.deepEqual(parsed.product.sizes, ["S", "M", "L", "XL"]);
    assert.deepEqual(parsed.product.colors, [{ name: "Ivoire", hex: "#F3EBDD" }]);
  });

  it("refuse un prix qui n'est pas un entier, une photo absente ou deux couleurs identiques", () => {
    assert.equal(toProduct({ ...draft, price: 1.5 }).ok, false);
    assert.equal(toProduct({ ...draft, image: "" }).ok, false);
    const same = toProduct({
      ...draft,
      colors: [
        { name: "Ivoire", hex: "#F3EBDD" },
        { name: "ivoire", hex: "#FFFFFF" },
      ],
    });
    assert.equal(same.ok, false);
  });
});

describe("parseCatalog", () => {
  it("relit le jeu de départ et refuse un fichier incomplet", () => {
    assert.equal(parseCatalog(products)?.length, products.length);
    assert.equal(parseCatalog([{ ...products[0], price: "54" }]), null);
    assert.equal(parseCatalog({}), null);
  });
});

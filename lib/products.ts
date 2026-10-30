import type { CategoryId, Product, SizeKind } from "@/lib/types";

export const categoryLabels: Record<CategoryId, string> = {
  habits: "Habits",
  accessoires: "Accessoires",
  chaussures: "Chaussures",
};

export const filters = [
  { id: "tout", label: "Tout" },
  { id: "nouveautes", label: "Nouveautés" },
  { id: "habits", label: "Habits" },
  { id: "accessoires", label: "Accessoires" },
  { id: "chaussures", label: "Chaussures" },
] as const;

export type FilterId = (typeof filters)[number]["id"];

const categoryIds = ["habits", "accessoires", "chaussures"] as const satisfies readonly CategoryId[];

export function isCategoryId(value: string): value is CategoryId {
  return (categoryIds as readonly string[]).includes(value);
}

const letterSizes = ["S", "M", "L", "XL"];
const shoeSizes = ["37", "38", "39", "40", "41"];

export const products: Product[] = [
  {
    id: "robe-ivoire",
    name: "Robe chemise Ivoire",
    price: 54,
    category: "habits",
    description:
      "Coton souple, boutons sur toute la longueur, ceinture à nouer. Elle passe le matin et tient encore le soir.",
    colors: [
      { name: "Ivoire", hex: "#F3EBDD" },
      { name: "Sable", hex: "#CDB89A" },
      { name: "Terracotta", hex: "#C4623A" },
    ],
    sizes: letterSizes,
    sizeKind: "letter",
    image: "/images/robe-ivoire.jpg",
    imageAlt: "Femme en robe chemise ivoire ceinturée, devant un mur de pierre ensoleillé.",
    focal: "object-[center_18%]",
    isNew: true,
  },
  {
    id: "blouse-sable",
    name: "Blouse rayée Sable",
    price: 34,
    category: "habits",
    description: "Lin rayé, encolure bateau, manches à retrousser. Légère même quand la journée chauffe.",
    colors: [
      { name: "Sable", hex: "#C4B6A4" },
      { name: "Ivoire", hex: "#F3EEE6" },
      { name: "Cacao", hex: "#6B4A3A" },
    ],
    sizes: letterSizes,
    sizeKind: "letter",
    image: "/images/blouse-sable.jpg",
    imageAlt: "Blouse en lin rayé sable et ivoire, suspendue contre un mur chaud.",
    focal: "object-center",
    isNew: true,
  },
  {
    id: "pull-ivoire",
    name: "Pull côtelé Ivoire",
    price: 42,
    category: "habits",
    description: "Côtes serrées, col montant, une maille qui tient sans gratter.",
    colors: [
      { name: "Ivoire", hex: "#E7E2DA" },
      { name: "Grège", hex: "#C8BEB2" },
      { name: "Chocolat", hex: "#6A4638" },
    ],
    sizes: letterSizes,
    sizeKind: "letter",
    image: "/images/pull-ivoire.jpg",
    imageAlt: "Pull ivoire à côtes larges, tenu devant un fond clair.",
    focal: "object-center",
    isNew: false,
  },
  {
    id: "robe-coquelicot",
    name: "Robe brodée Coquelicot",
    price: 58,
    category: "habits",
    description: "Broderies fleurs, taille marquée, jupe qui tourne. Pour les jours où l'on veut de la couleur.",
    colors: [
      { name: "Coquelicot", hex: "#D12B3A" },
      { name: "Ivoire", hex: "#F6F1EA" },
      { name: "Bordeaux", hex: "#7A3040" },
    ],
    sizes: letterSizes,
    sizeKind: "letter",
    image: "/images/robe-coquelicot.jpg",
    imageAlt: "Robe rouge brodée de fleurs, ceinture tressée, portée sur fond ocre.",
    focal: "object-top",
    isNew: true,
  },
  {
    id: "poncho-creme",
    name: "Poncho maille Crème",
    price: 36,
    category: "habits",
    description: "Maille ajourée et franges. Il se pose sur une robe ou un débardeur, et tombe ample.",
    colors: [
      { name: "Crème", hex: "#EFE6D6" },
      { name: "Camel", hex: "#C6A36A" },
      { name: "Chocolat", hex: "#5C3A2E" },
    ],
    sizes: ["unique"],
    sizeKind: "unique",
    image: "/images/poncho-creme.jpg",
    imageAlt: "Poncho en maille crème à franges, sur un cintre en bois.",
    focal: "object-center",
    isNew: false,
  },
  {
    id: "pull-caramel",
    name: "Pull chevron Caramel",
    price: 38,
    category: "habits",
    description: "Jacquard caramel et ivoire. Il réchauffe sans épaissir la silhouette.",
    colors: [
      { name: "Caramel", hex: "#C6864A" },
      { name: "Ivoire", hex: "#F4EFE6" },
      { name: "Cacao", hex: "#5A3A30" },
    ],
    sizes: letterSizes,
    sizeKind: "letter",
    image: "/images/pull-caramel.jpg",
    imageAlt: "Pull jacquard caramel et ivoire, porté en extérieur.",
    focal: "object-top",
    isNew: false,
  },
  {
    id: "robe-broderie",
    name: "Robe broderie Blanche",
    price: 46,
    category: "habits",
    description: "Coton brodé, épaules dégagées, ourlet court. Pour les après-midi où l'on veut rester légère.",
    colors: [
      { name: "Blanc", hex: "#F7F4EF" },
      { name: "Blush", hex: "#F0D5CC" },
      { name: "Sable", hex: "#E2D0B8" },
    ],
    sizes: letterSizes,
    sizeKind: "letter",
    image: "/images/robe-broderie.jpg",
    imageAlt: "Robe blanche brodée, épaules dénudées, portée dans un escalier clair.",
    focal: "object-[center_22%]",
    isNew: false,
  },
  {
    id: "sac-emeraude",
    name: "Sac structure Émeraude",
    price: 46,
    category: "accessoires",
    description: "Cuir grainé, rabat et fermoir doré. Assez tenu pour garder sa forme, assez petit pour le quotidien.",
    colors: [
      { name: "Émeraude", hex: "#0F6E6A" },
      { name: "Noir", hex: "#2A2624" },
      { name: "Miel", hex: "#C4894A" },
    ],
    sizes: ["unique"],
    sizeKind: "unique",
    image: "/images/sac-emeraude.jpg",
    imageAlt: "Petit sac structuré en cuir émeraude, fermoir doré, posé près d'une plante.",
    focal: "object-center",
    isNew: false,
  },
  {
    id: "collier-lune",
    name: "Collier Lune",
    price: 24,
    category: "accessoires",
    description: "Chaîne fine et croissant serti de petites pierres. Il se porte seul, près du cou.",
    colors: [
      { name: "Or", hex: "#C6A15B" },
      { name: "Argent", hex: "#C5C1BA" },
    ],
    sizes: ["unique"],
    sizeKind: "unique",
    image: "/images/collier-lune.jpg",
    imageAlt: "Collier doré avec un pendentif croissant de lune, sur un fond chaud.",
    focal: "object-center",
    isNew: true,
  },
  {
    id: "collier-perles",
    name: "Collier de perles",
    price: 32,
    category: "accessoires",
    description: "Perles rondes et fermoir fleur. Un bijou calme, pour une encolure simple.",
    colors: [
      { name: "Nacré", hex: "#F4EFE8" },
      { name: "Rosé", hex: "#E7C9C4" },
    ],
    sizes: ["unique"],
    sizeKind: "unique",
    image: "/images/collier-perles.jpg",
    imageAlt: "Collier de perles nacrées dans un écrin ouvert.",
    focal: "object-center",
    isNew: false,
  },
  {
    id: "escarpins-nacre",
    name: "Escarpins Nacré",
    price: 44,
    category: "chaussures",
    description: "Bout pointu, talon moyen, cuir grainé clair. La paire qui allonge la silhouette sans bruit.",
    colors: [
      { name: "Nacré", hex: "#E6E0D6" },
      { name: "Camel", hex: "#C49A6C" },
      { name: "Noir", hex: "#2A2624" },
    ],
    sizes: shoeSizes,
    sizeKind: "shoe",
    image: "/images/escarpins-nacre.jpg",
    imageAlt: "Paire d'escarpins ivoire au cuir grainé, posée près d'une fenêtre.",
    focal: "object-center",
    isNew: true,
  },
];

export const focalChoices = [
  { value: "object-center", label: "Centre" },
  { value: "object-top", label: "Haut" },
  { value: "object-[center_18%]", label: "Un peu plus haut" },
  { value: "object-[center_22%]", label: "Entre le haut et le centre" },
] as const;

export type FocalChoice = (typeof focalChoices)[number]["value"];

export function sizesForKind(kind: SizeKind): string[] {
  if (kind === "shoe") return [...shoeSizes];
  if (kind === "unique") return ["unique"];
  return [...letterSizes];
}

export function getProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function selectProducts(catalog: Product[], filter: FilterId): Product[] {
  if (filter === "tout") return catalog;
  if (filter === "nouveautes") return catalog.filter((product) => product.isNew);
  return catalog.filter((product) => product.category === filter);
}

export function filterProducts(filter: FilterId): Product[] {
  return selectProducts(products, filter);
}

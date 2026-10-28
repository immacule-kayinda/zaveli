import type { FilterId } from "@/lib/products";
import type { CategoryId } from "@/lib/types";

export const routes = {
  home: "/",
  collection: "/collection",
  nouveautes: "/nouveautes",
  maison: "/maison",
  category: (category: CategoryId) => `/collection/${category}`,
  product: (id: string) => `/produit/${id}`,
};

export function filterHref(filter: FilterId): string {
  if (filter === "tout") return routes.collection;
  if (filter === "nouveautes") return routes.nouveautes;
  return routes.category(filter);
}

export function isNavActive(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === routes.home;
  if (href === routes.collection) {
    return pathname === routes.collection || pathname.startsWith("/collection/") || pathname.startsWith("/produit/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

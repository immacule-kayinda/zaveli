"use client";

import { ClipboardList, LayoutDashboard, Settings, Shirt, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Accueil", long: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/commandes", label: "Commandes", long: "Commandes", icon: ClipboardList },
  { href: "/admin/collection", label: "Collection", long: "Collection", icon: Shirt },
  { href: "/admin/clients", label: "Clientes", long: "Clientes", icon: Users },
  { href: "/admin/reglages", label: "Réglages", long: "Réglages", icon: Settings },
];

function useActive() {
  const pathname = usePathname();
  return (link: (typeof links)[number]) =>
    link.exact
      ? pathname === link.href
      : pathname === link.href ||
        pathname.startsWith(`${link.href}/`) ||
        (link.href === "/admin/collection" && pathname.startsWith("/admin/pieces"));
}

/** Sur ordinateur : onglets sous l'en-tête. Sur téléphone : barre fixe en bas, à portée de pouce. */
export function AdminNav() {
  const isActive = useActive();
  return (
    <>
      <nav aria-label="Administration" className="mx-auto hidden max-w-5xl px-5 md:block">
        <ul className="flex gap-1 whitespace-nowrap">
          {links.map((link) => {
            const active = isActive(link);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-block border-b-2 px-3 py-2.5 text-sm transition-colors",
                    active ? "border-clay text-ink" : "border-transparent text-muted hover:text-clay",
                  )}
                >
                  {link.long}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        aria-label="Administration"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {links.map((link) => {
            const active = isActive(link);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.68rem] transition-colors",
                    active ? "text-clay" : "text-muted active:text-clay",
                  )}
                >
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.2 : 1.7} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

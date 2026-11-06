"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/collection", label: "Collection" },
  { href: "/admin/clients", label: "Clientes" },
  { href: "/admin/reglages", label: "Réglages" },
];

export function AdminNav() {
  const pathname = usePathname();
  const onPieces = pathname.startsWith("/admin/pieces");
  return (
    <nav aria-label="Administration" className="mx-auto max-w-5xl overflow-x-auto px-5">
      <ul className="flex gap-1 whitespace-nowrap">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname === link.href || pathname.startsWith(`${link.href}/`) || (link.href === "/admin/collection" && onPieces);
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
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

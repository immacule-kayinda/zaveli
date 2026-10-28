"use client";

import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { cn } from "@/lib/cn";
import { isNavActive, routes } from "@/lib/routes";

const links = [
  { href: routes.home, label: "Accueil" },
  { href: routes.collection, label: "Collection" },
  { href: routes.nouveautes, label: "Nouveautés" },
  { href: routes.maison, label: "La maison" },
] as const;

const rayons = [
  { href: routes.category("habits"), label: "Habits" },
  { href: routes.category("accessoires"), label: "Accessoires" },
  { href: routes.category("chaussures"), label: "Chaussures" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { count, openCart } = useBoutique();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const countLabel = count > 1 ? `${count} articles` : count === 1 ? "1 article" : "panier vide";

  function closeMenu() {
    setMenuPath(null);
  }

  function openMenu() {
    setMenuPath(pathname);
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuPath(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className="fixed inset-x-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-md"
      style={{ top: "var(--banner-h)", height: "var(--header-h)" }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href={routes.home} className="font-display text-[1.7rem] leading-none tracking-tight text-ink">
          Zaveli
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-cocoa md:flex" aria-label="Pages">
          {links.map((link) => {
            const active = isNavActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-1 py-1 transition hover:text-clay focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay",
                  active && "text-clay",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line bg-paper text-cocoa transition hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay md:hidden"
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            onClick={() => (menuOpen ? closeMenu() : openMenu())}
          >
            {menuOpen ? <X aria-hidden className="size-4" /> : <Menu aria-hidden className="size-4" />}
            <span className="sr-only">{menuOpen ? "Fermer le menu" : "Ouvrir le menu"}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              closeMenu();
              openCart();
            }}
            aria-label={`Ouvrir le panier, ${countLabel}`}
            className="relative grid size-11 place-items-center rounded-full border border-line bg-paper text-cocoa transition hover:border-clay focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay"
          >
            <ShoppingBag aria-hidden className="size-[1.15rem]" />
            {count > 0 ? (
              <span
                aria-hidden
                className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.68rem] leading-5 text-paper"
              >
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="menu-mobile"
          aria-label="Pages"
          className="absolute inset-x-0 top-full border-b border-line bg-ivory px-5 py-4 shadow-[0_24px_40px_-28px_rgba(74,51,44,0.7)] md:hidden"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeMenu();
          }}
        >
          <ul className="grid">
            {links.map((link) => {
              const active = isNavActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                    className={cn(
                      "flex min-h-11 items-center text-base text-cocoa",
                      active && "text-clay",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs tracking-[0.16em] text-muted uppercase">Rayons</p>
          <ul className="mt-1 grid">
            {rayons.map((rayon) => {
              const active = pathname === rayon.href;
              return (
                <li key={rayon.href}>
                  <Link
                    href={rayon.href}
                    aria-current={active ? "page" : undefined}
                    onClick={closeMenu}
                    className={cn("flex min-h-11 items-center text-base text-cocoa", active && "text-clay")}
                  >
                    {rayon.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}

export function HeaderFallback() {
  const { count, openCart } = useBoutique();
  const countLabel = count > 1 ? `${count} articles` : count === 1 ? "1 article" : "panier vide";

  return (
    <header
      className="fixed inset-x-0 z-40 border-b border-line/80 bg-ivory/90 backdrop-blur-md"
      style={{ top: "var(--banner-h)", height: "var(--header-h)" }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href={routes.home} className="font-display text-[1.7rem] leading-none tracking-tight text-ink">
          Zaveli
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-cocoa md:flex" aria-label="Pages">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-1 py-1">
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={openCart}
          aria-label={`Ouvrir le panier, ${countLabel}`}
          className="relative grid size-11 place-items-center rounded-full border border-line bg-paper text-cocoa"
        >
          <ShoppingBag aria-hidden className="size-[1.15rem]" />
          {count > 0 ? (
            <span
              aria-hidden
              className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-clay px-1 text-[0.68rem] leading-5 text-paper"
            >
              {count}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
}

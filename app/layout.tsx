import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Fraunces, Outfit } from "next/font/google";

import { BoutiqueProvider } from "@/components/cart/BoutiqueProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header, HeaderFallback } from "@/components/layout/Header";

import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  style: ["normal", "italic"],
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zaveli — Vêtements et accessoires",
    template: "%s — Zaveli",
  },
  description:
    "Maison de vêtements et d'accessoires pour femmes, à Kinshasa. Choisissez la taille et la couleur, puis commandez directement sur WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#F6F0E8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" data-scroll-behavior="smooth" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-ivory font-sans text-ink">
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <AnnouncementBar />
        <BoutiqueProvider>
          <Suspense fallback={<HeaderFallback />}>
            <Header />
          </Suspense>
          <main id="contenu" className="pt-[calc(var(--banner-h)+var(--header-h))]">
            {children}
          </main>
          <Footer />
          <CartDrawer />
        </BoutiqueProvider>
      </body>
    </html>
  );
}

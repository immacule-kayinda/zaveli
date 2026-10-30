import type { ReactNode } from "react";
import { Suspense } from "react";

import { BoutiqueProvider } from "@/components/cart/BoutiqueProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Footer } from "@/components/layout/Footer";
import { Header, HeaderFallback } from "@/components/layout/Header";
import { getCatalog } from "@/lib/catalog";

export const instant = false;

export default async function BoutiqueLayout({ children }: { children: ReactNode }) {
  const catalog = await getCatalog();

  return (
    <>
      <a href="#contenu" className="skip-link">
        Aller au contenu
      </a>
      <AnnouncementBar />
      <BoutiqueProvider catalog={catalog}>
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>
        <main id="contenu" className="pt-[calc(var(--banner-h)+var(--header-h))]">
          {children}
        </main>
        <Footer />
        <CartDrawer />
      </BoutiqueProvider>
    </>
  );
}

"use client";

import { useBoutique } from "@/components/cart/BoutiqueProvider";
import { Button } from "@/components/ui/Button";
import { buildGreetingMessage, whatsAppUrl } from "@/lib/whatsapp";

export function ContactButton({ children }: { children: string }) {
  const { settings } = useBoutique();
  return (
    <Button
      href={whatsAppUrl(buildGreetingMessage(), settings.whatsappNumber)}
      target="_blank"
      rel="noopener noreferrer"
      variant="secondary"
      className="mt-8"
    >
      {children}
    </Button>
  );
}
